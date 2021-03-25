import Delta from 'quill-delta'
import normalizeUrl from 'normalize-url'

const defaults = {
  globalRegularExpression: /(https?:\/\/|www\.)[\w-\.]+\.[\w-\.]+(\/([\S]+)?)?/gi,
  urlRegularExpression: /(https?:\/\/|www\.)[\w-\.]+\.[\w-\.]+(\/([\S]+)?)?/i,
  globalMailRegularExpression: /([\w-\.]+@[\w-\.]+\.[\w-\.]+)/gi,
  mailRegularExpression: /([\w-\.]+@[\w-\.]+\.[\w-\.]+)/i,
  normalizeRegularExpression: /(https?:\/\/|www\.)[\S]+/i,
  normalizeUrlOptions: {
    stripWWW: false,
  },
}

export default class MagicUrl {
  constructor(quill, options) {
    this.quill = quill
    options = options || {}
    this.options = { ...defaults, ...options }
    this.urlNormalizer = (url) => this.normalize(url)
    this.mailNormalizer = (mail) => `mailto:${mail}`
    this.registerTypeListener()
    this.registerPasteListener()
  }
  registerPasteListener() {
    this.quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
      if (typeof node.data !== 'string') {
        return
      }
      const urlRegExp = this.options.globalRegularExpression
      const mailRegExp = this.options.globalMailRegularExpression
      urlRegExp.lastIndex = 0
      mailRegExp.lastIndex = 0
      const newDelta = new Delta()
      let index = 0
      let urlResult = urlRegExp.exec(node.data)
      let mailResult = mailRegExp.exec(node.data)
      const handleMatch = (result, regExp, normalizer) => {
        const head = node.data.substring(index, result.index)
        newDelta.insert(head)
        const match = result[0]
        newDelta.insert(match, { link: normalizer(match) })
        index = regExp.lastIndex
        return regExp.exec(node.data)
      }
      while (urlResult !== null || mailResult !== null) {
        if (urlResult === null) {
          mailResult = handleMatch(mailResult, mailRegExp, this.mailNormalizer)
        } else if (mailResult === null) {
          urlResult = handleMatch(urlResult, urlRegExp, this.urlNormalizer)
        } else if (mailResult.index <= urlResult.index) {
          while (urlResult !== null && urlResult.index < mailRegExp.lastIndex) {
            urlResult = urlRegExp.exec(node.data)
          }
          mailResult = handleMatch(mailResult, mailRegExp, this.mailNormalizer)
        } else {
          while (
            mailResult !== null &&
            mailResult.index < urlRegExp.lastIndex
          ) {
            mailResult = mailRegExp.exec(node.data)
          }
          urlResult = handleMatch(urlResult, urlRegExp, this.urlNormalizer)
        }
      }
      if (index > 0) {
        const tail = node.data.substring(index)
        newDelta.insert(tail)
        delta.ops = newDelta.ops
      }
      return delta
    })
  }
  registerTypeListener() {
    this.quill.on('text-change', (delta) => {
      const ops = delta.ops
      // Only return true, if last operation includes whitespace inserts
      // Equivalent to listening for enter, tab or space
      if (!ops || ops.length < 1 || ops.length > 2) {
        return
      }
      const lastOp = ops[ops.length - 1]
      if (
        !lastOp.insert ||
        typeof lastOp.insert !== 'string' ||
        !lastOp.insert.match(/\s/)
      ) {
        return
      }
      this.checkTextForUrl()
    })
  }
  checkTextForUrl() {
    const sel = this.quill.getSelection()
    if (!sel) {
      return
    }
    const [leaf] = this.quill.getLeaf(sel.index)
    if (!leaf.text || leaf.parent.domNode.localName === 'a') {
      return
    }
    const leafIndex = this.quill.getIndex(leaf)
    const urlMatch = leaf.text.match(this.options.urlRegularExpression)
    const mailMatch = leaf.text.match(this.options.mailRegularExpression)
    if (urlMatch) {
      this.textToUrl(leafIndex + urlMatch.index, urlMatch[0])
    } else if (mailMatch) {
      this.textToMail(leafIndex + mailMatch.index, mailMatch[0])
    }
  }
  textToUrl(index, url) {
    const ops = new Delta()
      .retain(index)
      .retain(url.length, { link: this.urlNormalizer(url) })
    this.quill.updateContents(ops)
  }
  textToMail(index, mail) {
    const ops = new Delta()
      .retain(index)
      .retain(mail.length, { link: this.mailNormalizer(mail) })
    this.quill.updateContents(ops)
  }
  normalize(url) {
    if (this.options.normalizeRegularExpression.test(url)) {
      try {
        return normalizeUrl(url, this.options.normalizeUrlOptions)
      } catch (error) {
        console.error(error)
      }
    }
    return url
  }
}

if (window != null && window.Quill) {
  window.Quill.register('modules/magicUrl', MagicUrl)
}

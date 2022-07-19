import Delta from 'quill-delta'
import normalizeUrl from 'normalize-url'

const defaults = {
  globalRegularExpression:
    /(https?:\/\/|www\.)[\w-\.]+\.[\w-\.]+(\/([\S]+)?)?/gi,
  urlRegularExpression: /(https?:\/\/|www\.)[\w-\.]+\.[\w-\.]+(\/([\S]+)?)?/gi,
  globalMailRegularExpression: /([\w-\.]+@[\w-\.]+\.[\w-\.]+)/gi,
  mailRegularExpression: /([\w-\.]+@[\w-\.]+\.[\w-\.]+)/gi,
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
    this.registerBlurListener()
  }
  registerPasteListener() {
    // Preserves existing links
    this.quill.clipboard.addMatcher('A', (node, delta) => {
      const href = node.getAttribute('href')
      const attributes = delta.ops[0]?.attributes || null
      if (attributes != null && attributes.link != null) {
        attributes.link = href
      }
      return delta
    })
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
      this.checkTextForUrl(lastOp.insert.match(/ |\t/))
    })
  }
  registerBlurListener() {
    this.quill.root.addEventListener('blur', () => {
      this.checkTextForUrl()
    })
  }
  checkTextForUrl(triggeredByInlineWhitespace = false) {
    const sel = this.quill.getSelection()
    if (!sel) {
      return
    }
    const [leaf] = this.quill.getLeaf(sel.index)
    const leafIndex = this.quill.getIndex(leaf)

    if (!leaf.text) {
      return
    }

    // We only care about the leaf until the current cursor position
    const relevantLength = sel.index - leafIndex
    const text = leaf.text.slice(0, relevantLength)
    if (!text || leaf.parent.domNode.localName === 'a') {
      return
    }

    const nextLetter = leaf.text[relevantLength]
    // Do not proceed if we are in the middle of a word
    if (nextLetter != null && nextLetter.match(/\S/)) {
      return
    }

    const bailOutEndingRegex = triggeredByInlineWhitespace ? /\s\s$/ : /\s$/
    if (text.match(bailOutEndingRegex)) {
      return
    }

    const urlMatches = text.match(this.options.urlRegularExpression)
    const mailMatches = text.match(this.options.mailRegularExpression)
    if (urlMatches) {
      this.handleMatches(leafIndex, text, urlMatches, this.urlNormalizer)
    } else if (mailMatches) {
      this.handleMatches(leafIndex, text, mailMatches, this.mailNormalizer)
    }
  }
  handleMatches(leafIndex, text, matches, normalizer) {
    const match = matches.pop()
    const matchIndex = text.lastIndexOf(match)
    const after = text.split(match).pop()
    if (after.match(/\S/)) {
      return
    }
    this.updateText(leafIndex + matchIndex, match.trim(), normalizer)
  }
  updateText(index, string, normalizer) {
    const ops = new Delta()
      .retain(index)
      .retain(string.length, { link: normalizer(string) })
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

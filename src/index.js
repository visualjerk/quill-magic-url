import Delta from 'quill-delta'
import normalizeUrl from 'normalize-url'

const defaults = {
  globalRegularExpression: /(https?:\/\/|www\.)[\w-\.]+\.[\w-\.]+(\/([\S]+)?)?/gi,
  urlRegularExpression: /(https?:\/\/|www\.)[\w-\.]+\.[\w-\.]+(\/([\S]+)?)?/i,
  globalMailRegularExpression: /([\w-\.]+@[\w-\.]+\.[\w-\.]+)/gi,
  mailRegularExpression: /([\w-\.]+@[\w-\.]+\.[\w-\.]+)/i,
  normalizeRegularExpression: /(https?:\/\/|www\.)[\S]+/i,
  normalizeUrlOptions: {
    stripWWW: false
  }
}

export default class MagicUrl {
  constructor (quill, options) {
    this.quill = quill
    options = options || {}
    this.options = {...defaults, ...options}
    this.registerTypeListener()
    this.registerPasteListener()
  }
  registerPasteListener () {
    this.quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
      if (typeof node.data !== 'string') {
        return
      }
      const newDelta = new Delta()
      node.data.split(/(\s+)/).forEach(str => {
        const urlMatches = str.match(this.options.globalRegularExpression)
        const mailMatches = str.match(this.options.globalMailRegularExpression)
        if (urlMatches && urlMatches.length) {
          urlMatches.forEach(match => {
            const split = str.split(match)
            const beforeLink = split.shift()
            newDelta.insert(beforeLink)
            newDelta.insert(match, {link: this.normalize(match)})
            str = split.join(match)
          })
          newDelta.insert(str)
        } else if (mailMatches && mailMatches.length) {
          mailMatches.forEach(match => {
            const split = str.split(match)
            const beforeLink = split.shift()
            newDelta.insert(beforeLink)
            newDelta.insert(match, {link: `mailto:${match}`})
            str = split.join(match)
          })
          newDelta.insert(str)
        } else {
          newDelta.insert(str)
        }
      })
      delta.ops = newDelta.ops
      return delta
    })
  }
  registerTypeListener () {
    this.quill.on('text-change', (delta) => {
      const ops = delta.ops
      // Only return true, if last operation includes whitespace inserts
      // Equivalent to listening for enter, tab or space
      if (!ops || ops.length < 1 || ops.length > 2) {
        return
      }
      const lastOp = ops[ops.length - 1]
      if (!lastOp.insert || typeof lastOp.insert !== 'string' || !lastOp.insert.match(/\s/)) {
        return
      }
      this.checkTextForUrl()
    })
  }
  checkTextForUrl () {
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
  textToUrl (index, url) {
    const ops = new Delta()
      .retain(index)
      .retain(url.length, {link: this.normalize(url)})
    this.quill.updateContents(ops)
  }
  textToMail (index, mail) {
    const ops = new Delta()
      .retain(index)
      .retain(mail.length, {link: `mailto:${mail}`})
    this.quill.updateContents(ops)
  }
  normalize (url) {
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

if (window.Quill) {
  window.Quill.register('modules/magicUrl', MagicUrl);
}

import Delta from 'quill-delta'

const REGEXP_GLOBAL = /https?:\/\/[\S]+/g
const REGEXP_URL =    /(https?:\/\/[\S]+)/

export default class MagicUrl {
  constructor (quill, options) {
    this.quill = quill
    this.options = options
    this.registerTypeListener()
    this.registerPasteListener()
  }
  registerPasteListener () {
    this.quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
      if (typeof node.data !== 'string') {
        return
      }
      const matches = node.data.match(this.options ? this.options.globalRegularExpression : REGEXP_GLOBAL)
      if (matches && matches.length > 0) {
        const ops = []
        let str = node.data
        matches.forEach(match => {
          const split = str.split(match)
          const beforeLink = split.shift()
          ops.push({insert: beforeLink})
          ops.push({insert: match, attributes: {link: match}})
          str = split.join(match)
        })
        ops.push({insert: str})
        delta.ops = ops
      }
      return delta
    })
  }
  registerTypeListener () {
    this.quill.on('text-change', (delta) => {
      let ops = delta.ops
      // Only return true, if last operation includes whitespace inserts
      // Equivalent to listening for enter, tab or space
      if (!ops || ops.length < 1 || ops.length > 2) {
        return
      }
      let lastOp = ops[ops.length - 1]
      if (!lastOp.insert || typeof lastOp.insert !== 'string' || !lastOp.insert.match(/\s/)) {
        return
      }
      this.checkTextForUrl()
    })
  }
  checkTextForUrl () {
    let sel = this.quill.getSelection()
    if (!sel) {
      return
    }
    let [leaf] = this.quill.getLeaf(sel.index)
    if (!leaf.text) {
      return
    }
    let urlMatch = leaf.text.match(this.options ? this.options.urlRegularExpression : REGEXP_URL )
    if (!urlMatch) {
      return
    }
    let stepsBack = leaf.text.length - urlMatch.index
    let index = sel.index - stepsBack
    this.textToUrl(index, urlMatch[0])
  }
  textToUrl (index, url) {
    const ops = new Delta()
      .retain(index)
      .delete(url.length)
      .insert(url, {link: url})
    this.quill.updateContents(ops)
  }
}

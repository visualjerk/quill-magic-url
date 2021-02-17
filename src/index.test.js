import MagicUrl from './index'

describe('MagicUrl', () => {
  describe('PasteListener', () => {
    let matcherCallback

    beforeEach(() => {
      const quillMock = {
        clipboard: {
          addMatcher: (nodeType, callback) => {
            matcherCallback = callback
          },
        },
        on: () => {},
        getSelection: () => {},
        getLeaf: () => {},
        getIndex: () => {},
        updateContents: () => {},
      }

      new MagicUrl(quillMock)
    })

    test('should not alter plain text', () => {
      const node = { data: 'text' }
      const delta = { ops: [{ insert: 'text' }] }

      expect(matcherCallback(node, delta)).toEqual({
        ops: [{ insert: 'text' }],
      })
    })

    test('should ignore newline', () => {
      const node = { data: '\n' }
      const delta = { ops: [] }

      expect(matcherCallback(node, delta)).toEqual({ ops: [] })
    })

    test('should parse email', () => {
      const node = { data: 'Hello hello@example.com' }
      const delta = { ops: [{ insert: 'Hello hello@example.com' }] }

      expect(matcherCallback(node, delta)).toEqual({
        ops: [
          { insert: 'Hello ' },
          {
            insert: 'hello@example.com',
            attributes: { link: 'mailto:hello@example.com' },
          },
        ],
      })
    })

    test('should parse url', () => {
      const node = { data: 'Hello www.example.com' }
      const delta = { ops: [{ insert: 'Hello www.example.com' }] }

      expect(matcherCallback(node, delta)).toEqual({
        ops: [
          { insert: 'Hello ' },
          {
            insert: 'www.example.com',
            attributes: { link: 'http://www.example.com' },
          },
        ],
      })
    })

    test('should parse multiple urls', () => {
      const node = { data: 'Hello www.example.com world http://google.com !' }
      const delta = {
        ops: [{ insert: 'Hello www.example.com world http://google.com !' }],
      }

      expect(matcherCallback(node, delta)).toEqual({
        ops: [
          { insert: 'Hello ' },
          {
            insert: 'www.example.com',
            attributes: { link: 'http://www.example.com' },
          },
          { insert: ' world ' },
          {
            insert: 'http://google.com',
            attributes: { link: 'http://google.com' },
          },
          { insert: ' !' },
        ],
      })
    })

    test('should parse same url multiple times', () => {
      const node = { data: 'Hello www.example.com world www.example.com !' }
      const delta = {
        ops: [{ insert: 'Hello www.example.com world www.example.com !' }],
      }

      expect(matcherCallback(node, delta)).toEqual({
        ops: [
          { insert: 'Hello ' },
          {
            insert: 'www.example.com',
            attributes: { link: 'http://www.example.com' },
          },
          { insert: ' world ' },
          {
            insert: 'www.example.com',
            attributes: { link: 'http://www.example.com' },
          },
          { insert: ' !' },
        ],
      })
    })

    test('should parse url and email', () => {
      const node = { data: 'Hello www.example.com world hello@example.com !' }
      const delta = {
        ops: [{ insert: 'Hello www.example.com world hello@example.com !' }],
      }

      expect(matcherCallback(node, delta)).toEqual({
        ops: [
          { insert: 'Hello ' },
          {
            insert: 'www.example.com',
            attributes: { link: 'http://www.example.com' },
          },
          { insert: ' world ' },
          {
            insert: 'hello@example.com',
            attributes: { link: 'mailto:hello@example.com' },
          },
          { insert: ' !' },
        ],
      })
    })

    test('should parse same url multiple times', () => {
      const node = {
        data: 'Hello www.example.com world www.hello@example.com !',
      }
      const delta = { ops: [{ insert: 'Hello www.example.com' }] }

      expect(matcherCallback(node, delta)).toEqual({
        ops: [
          { insert: 'Hello ' },
          {
            insert: 'www.example.com',
            attributes: { link: 'http://www.example.com' },
          },
          { insert: ' world ' },
          {
            insert: 'www.hello@example.com',
            attributes: { link: 'mailto:www.hello@example.com' },
          },
          { insert: ' !' },
        ],
      })
    })
  })
})

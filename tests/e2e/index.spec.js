describe('quill-magic-url', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080')
  })

  function type(text) {
    const editor = cy.get('.ql-editor')
    editor.type(text)
  }

  function paste(text) {
    cy.window().then((win) => {
      win.quill.clipboard.dangerouslyPasteHTML(text)
    })
  }

  function shouldContain(text) {
    const editor = cy.get('.ql-editor')
    editor.should('contain.html', text)
  }

  function shouldContainLink(url, text) {
    const editor = cy.get('.ql-editor')
    editor.should('contain.html', `<a href="${url}"`)
    editor.should('contain.html', `${text ? text : url}</a>`)
  }

  describe('Typing', () => {
    it('triggered by blank space', () => {
      type('http://test.de ')
      shouldContainLink('http://test.de')
    })

    it('triggered by enter', () => {
      type('http://test.de{enter}')
      shouldContainLink('http://test.de')
    })

    it('triggered by tab', () => {
      type('http://test.de\t')
      shouldContainLink('http://test.de')
    })

    it('for multiple urls', () => {
      type('http://test.de https://google.de ')
      shouldContainLink('http://test.de')
      shouldContainLink('https://google.de')
    })

    it('normalizes url', () => {
      type('www.test.de ')
      shouldContainLink('http://www.test.de', 'www.test.de')
    })

    it('for email address', () => {
      type('test@test.de ')
      shouldContainLink('mailto:test@test.de', 'test@test.de')
    })

    it('for urls and email addresses', () => {
      type('http://test.de test@test.de https://google.de www.test.de ')
      shouldContainLink('http://test.de')
      shouldContainLink('mailto:test@test.de', 'test@test.de')
      shouldContainLink('https://google.de')
      shouldContainLink('http://www.test.de', 'www.test.de')
    })

    it('preserves normal text', () => {
      type(
        'i want to be preserved http://test.de my little pony www.google.com look a mail peter@google.com bam!'
      )
      shouldContain(
        '<p>i want to be preserved <a href="http://test.de" target="_blank">http://test.de</a> my little pony <a href="http://www.google.com" target="_blank">www.google.com</a> look a mail <a href="mailto:peter@google.com" target="_blank">peter@google.com</a> bam!</p>'
      )
    })
  })

  describe('Paste', () => {
    it('for single url', () => {
      paste('http://test.de')
      shouldContainLink('http://test.de')
    })

    it('for email address', () => {
      paste('test@test.de')
      shouldContainLink('mailto:test@test.de', 'test@test.de')
    })

    it('for multiple urls', () => {
      paste('http://test.de https://google.de www.test.de')
      shouldContainLink('http://test.de')
      shouldContainLink('https://google.de')
      shouldContainLink('http://www.test.de', 'www.test.de')
    })

    it('for urls and email addresses', () => {
      paste('http://test.de test@test.de https://google.de www.test.de')
      shouldContainLink('http://test.de')
      shouldContainLink('mailto:test@test.de', 'test@test.de')
      shouldContainLink('https://google.de')
      shouldContainLink('http://www.test.de', 'www.test.de')
    })

    it('preserves normal text', () => {
      paste(
        'i want to be preserved http://test.de my little pony www.google.com look a mail peter@google.com bam!'
      )
      shouldContain(
        'i want to be preserved <a href="http://test.de" target="_blank">http://test.de</a> my little pony <a href="http://www.google.com" target="_blank">www.google.com</a> look a mail <a href="mailto:peter@google.com" target="_blank">peter@google.com</a> bam!'
      )
    })
  })
})

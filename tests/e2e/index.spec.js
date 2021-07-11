Cypress.Commands.add(
  'paste',
  { prevSubject: true },
  function (subject, pasteOptions) {
    const { payload, type } = pasteOptions
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer
    const clipboardData = new DataTransfer()
    clipboardData.setData(type, payload)
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event
    const pasteEvent = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData,
    })
    subject[0].dispatchEvent(pasteEvent)

    return subject
  }
)

describe('quill-magic-url', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080')
    cy.get('.ql-editor').click().type('t{backspace}')
    cy.document().then((doc) => {
      console.log(doc.activeElement)
    })
  })

  function type(text) {
    const editor = cy.get('.ql-editor')
    editor.type(text)
  }

  function paste(text) {
    cy.window().then((win) => {
      console.log(win.quill.clipboard)
      win.quill.clipboard.dangerouslyPasteHTML(text)
    })
  }

  function shouldContainLink(url, text) {
    const editor = cy.get('.ql-editor')
    editor.should('contain.html', `<a href="${url}"`)
    editor.should('contain.html', `${text ? text : url}</a>`)
  }

  describe('Creates link for url on typing', () => {
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
  })

  describe('Creates link for url on paste', () => {
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
  })
})

describe('quill-magic-url', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080')
    cy.get('.ql-editor').as('editor')
  })

  function type(text) {
    cy.get('@editor').type(text)
  }

  function paste(text) {
    cy.window().then((win) => {
      win.quill.clipboard.dangerouslyPasteHTML(text)
    })
  }

  function shouldContain(text) {
    cy.get('@editor').should('contain.html', text)
  }

  function shouldContainLink(url, text) {
    const editor = cy.get('@editor')
    editor.should('contain.html', `<a href="${url}"`)
    editor.should('contain.html', `${text ? text : url}</a>`)
  }

  describe('typing', () => {
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

    it('triggered by blur', () => {
      type('http://test.de')
      cy.get('@editor').blur()
      shouldContainLink('http://test.de')
    })

    it('does not throw on blur when empty', () => {
      cy.get('@editor').focus()
      cy.get('@editor').blur()
      shouldContain('<p><br></p>')
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

    it('keeps query parameters', () => {
      type('www.test.de/?test=1 ')
      shouldContainLink('http://www.test.de/?test=1', 'www.test.de/?test=1')
    })

    describe('does not trigger', () => {
      beforeEach(() => {
        type('http://test.de {leftarrow}{leftarrow}')
        cy.get('.ql-remove').click()
        cy.get('@editor').click('bottomRight')
      })

      it('on double blank space', () => {
        type(' ')
        shouldContain('<p>http://test.de  </p>')
      })

      it('on new word in same line', () => {
        type(' new ')
        shouldContain('<p>http://test.de  new </p>')
      })

      it('on blank space and enter', () => {
        type('{enter}')
        shouldContain('<p>http://test.de </p><p><br></p>')
      })

      it('on blank space in new line', () => {
        type('{enter}next ')
        shouldContain('<p>http://test.de </p><p>next </p>')
      })

      it('on blank space after blur', () => {
        cy.get('@editor').blur()
        shouldContain('<p>http://test.de </p>')
      })
    })

    describe('converts first url', () => {
      beforeEach(() => {
        type('http://test.de {leftarrow}{leftarrow}')
        cy.get('.ql-remove').click()
        cy.get('@editor').click('bottomRight')
        type('www.google.com')
        // Move to end of first url
        type(`{movetostart}${'{rightarrow}'.repeat(14)}`)
      })

      it('on blank space', () => {
        type(' ')
        shouldContain(
          '<p><a href="http://test.de" target="_blank">http://test.de</a>  www.google.com</p>'
        )
      })

      it('on enter', () => {
        type('{enter}')
        shouldContain(
          '<p><a href="http://test.de" target="_blank">http://test.de</a></p><p> www.google.com</p>'
        )
      })

      it('on blur', () => {
        cy.get('@editor').blur()
        shouldContain(
          '<p><a href="http://test.de" target="_blank">http://test.de</a> www.google.com</p>'
        )
      })
    })

    describe('converts second url', () => {
      beforeEach(() => {
        type('http://test.de {leftarrow}{leftarrow}')
        cy.get('.ql-remove').click()
        cy.get('@editor').click('bottomRight')
        type('www.google.com')
      })

      it('on blank space', () => {
        type(' ')
        shouldContain(
          '<p>http://test.de <a href="http://www.google.com" target="_blank">www.google.com</a> </p>'
        )
      })

      it('on enter', () => {
        type('{enter}')
        shouldContain(
          '<p>http://test.de <a href="http://www.google.com" target="_blank">www.google.com</a></p><p><br></p>'
        )
      })

      it('on blur', () => {
        cy.get('@editor').blur()
        shouldContain(
          '<p>http://test.de <a href="http://www.google.com" target="_blank">www.google.com</a></p>'
        )
      })
    })
  })

  describe('blur', () => {
    it('does not convert when inside word', () => {
      type('https://google.com {leftarrow}{leftarrow}')
      cy.get('.ql-remove').click()
      cy.get('@editor').blur()
      shouldContain('<p>https://google.com </p>')
    })

    it('does not convert when inside word after clicking out', () => {
      type(
        'https://google.com test{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}'
      )
      cy.get('.ql-remove').click()
      cy.get('@editor').click('bottomRight')
      cy.get('@editor').blur()
      shouldContain('<p>https://google.com test</p>')
      cy.get('@editor').click('bottomRight')
      type('{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}{leftarrow}')
      cy.get('@editor').blur()
      shouldContain('<p>https://google.com test</p>')
    })
  })

  describe('paste', () => {
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

    it('does not alter existing links', () => {
      paste('<a href="http://www.google.com">http://test.de</a>')
      shouldContain(
        '<p><a href="http://www.google.com" target="_blank">http://test.de</a></p>'
      )
    })

    it('keeps query parameters', () => {
      paste('www.test.de/?test=1 ')
      shouldContainLink('http://www.test.de/?test=1', 'www.test.de/?test=1')
    })

    it('does not throw on empty anchor tag', () => {
      paste('<a href="http://www.google.com"></a>')
      shouldContain('<p><br></p>')
    })
  })
})

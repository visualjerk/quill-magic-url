import Delta from 'quill-delta';
import Quill from '../../../core';


describe('Clipboard', function() {
  describe('events', function() {
    beforeEach(function() {
      this.quill = this.initialize(Quill, '<h1>0123</h1><p>5<em>67</em>8</p>');
      this.quill.setSelection(2, 5);
    });

    it('paste', function(done) {
      this.quill.clipboard.container.innerHTML = '<strong>|</strong>';
      this.quill.clipboard.onPaste({});
      setTimeout(() => {
        expect(this.quill.root).toEqualHTML('<p>01<strong>|</strong><em>7</em>8</p>');
        done();
      }, 2);
    });
  });
});
# quill-magic-url

Checks for URLs during typing and pasting and automatically converts them to links.

## Usage

```javascript
import Quill from 'quill';
import MagicUrl from 'quill-magic-url';

Quill.register('modules/magicUrl', MagicUrl);

const quill = new Quill(editor, {
  modules: {
    magicUrl: true
  }
});
```

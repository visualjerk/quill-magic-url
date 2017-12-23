# quill-magic-url

Checks for URLs during typing and pasting and automatically converts them to links.

Thanks to [@LFDM](https://github.com/LFDM) for the groundwork with [quill-auto-links](https://github.com/SmallImprovements/quill-auto-links).

## Install

```bash
npm install quill-magic-url --save
```

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

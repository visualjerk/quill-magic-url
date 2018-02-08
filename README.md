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
```

Basic usage with default configuration:

```javascript
const quill = new Quill(editor, {
  modules: {
    magicUrl: true
  }
});
```

Thanks to [@marciodsousa](https://github.com/marciodsousa) you can also provide custom regular expressions:

```javascript
const quill = new Quill(editor, {
  modules: {
      magicUrl: {
        globalRegularExpression: /(https?:\/\/|www\.|mailto:)[\S]+/g,
        urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)|(mailto:[\S]+)/
      }
  }
});
```

For some inspiration on some crazy url regex, [checkout this](https://mathiasbynens.be/demo/url-regex).

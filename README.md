# quill-magic-url

Checks for URLs and mail addresses during typing and pasting and automatically converts them to links and normalizes the links URL.

Thanks to [@LFDM](https://github.com/LFDM) for the groundwork with [quill-auto-links](https://github.com/SmallImprovements/quill-auto-links).

You can find a [demo page here](https://visualjerk.github.io/quill-magic-url/).

![quill-magic-url in action](https://github.com/visualjerk/quill-magic-url/blob/master/docs/quill-magic-url.gif?raw=true)

## Install

### From CDN

```html
<!-- After quill script includes -->
<script src="https://unpkg.com/quill-magic-url@3.0.0/dist/index.js"></script>
```

### With NPM

```bash
npm install quill-magic-url --save
```

```javascript
import Quill from 'quill'
import MagicUrl from 'quill-magic-url'

Quill.register('modules/magicUrl', MagicUrl)
```

## Usage

**Basic usage with default options:**

```javascript
const quill = new Quill(editor, {
  modules: {
    magicUrl: true,
  },
})
```

**Usage with custom options:**

```javascript
const quill = new Quill(editor, {
  modules: {
    magicUrl: {
      // Regex used to check URLs during typing
      urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)|(tel:[\S]+)/,
      // Regex used to check URLs on paste
      globalRegularExpression: /(https?:\/\/|www\.|tel:)[\S]+/g,
    },
  },
})
```

## Options

### urlRegularExpression

> Regex used to check for URLs during _typing_.

**Default:** `/(https?:\/\/|www\.)[\w-\.]+\.[\w-\.]+(\/([\S]+)?)?/i`

**Example with custom Regex**

```javascript
magicUrl: {
  urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)|(tel:[\S]+)/
}
```

### globalRegularExpression

> Regex used to check for URLs on _paste_.

**Default:** `/(https?:\/\/|www\.)[\w-\.]+\.[\w-\.]+(\/([\S]+)?)?/gi`

**Example with custom Regex**

```javascript
magicUrl: {
  globalRegularExpression: /(https?:\/\/|www\.|tel:)[\S]+/g
}
```

### mailRegularExpression

> Regex used to check for mail addresses during _typing_. Set to `null` to disable conversion of mail addresses.

**Default:** `/([\w-\.]+@[\w-\.]+\.[\w-\.]+)/i`

**Example with custom Regex**

```javascript
magicUrl: {
  mailRegularExpression: /([\w-\.]+@[\w-\.]+\.[\w-\.]+)/i
}
```

### globalMailRegularExpression

> Regex used to check for mail addresses on _paste_. Set to `null` to disable conversion of mail addresses.

**Default:** `/([\w-\.]+@[\w-\.]+\.[\w-\.]+)/gi`

**Example with custom Regex**

```javascript
magicUrl: {
  globalMailRegularExpression: /([\w-\.]+@[\w-\.]+\.[\w-\.]+)/gi
}
```

### normalizeRegularExpression

> Regex used to check for URLs to be _normalized_.

**Default:** `/(https?:\/\/|www\.)[\S]+/i`

You will most likely want to keep this options default value.

### normalizeUrlOptions

> Options for normalizing the URL

**Default:**

```javascript
{
  stripWWW: false
}
```

**Example with custom options**

```javascript
magicUrl: {
  normalizeUrlOptions: {
    stripHash: true,
    stripWWW: false,
    normalizeProtocol: false
  }
}
```

**Available options**

We use [normalize-url](https://github.com/sindresorhus/normalize-url) for normalizing URLs. You can find a detailed description of the possible options [here](https://github.com/sindresorhus/normalize-url#api).

## More infos on URL Regex

For some advanced URL Regex [check this out](https://mathiasbynens.be/demo/url-regex).

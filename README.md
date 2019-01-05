# quill-magic-url

Checks for URLs during typing and pasting and automatically converts them to links and normalizes the links URL.

Thanks to [@LFDM](https://github.com/LFDM) for the groundwork with [quill-auto-links](https://github.com/SmallImprovements/quill-auto-links).

![quill-magic-url in action](https://github.com/visualjerk/quill-magic-url/blob/master/docs/quill-magic-url.gif?raw=true)

## Install

```bash
npm install quill-magic-url --save
```

## Basic Usage

```javascript
import Quill from 'quill';
import MagicUrl from 'quill-magic-url';

Quill.register('modules/magicUrl', MagicUrl);
```

**Basic usage with default options:**

```javascript
const quill = new Quill(editor, {
  modules: {
    magicUrl: true
  }
});
```

**Usage with custom options:**

```javascript
const quill = new Quill(editor, {
  modules: {
    magicUrl: {
      // Regex used to check URLs during typing
      urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)|(mailto:[\S]+)|(tel:[\S]+)/,
      // Regex used to check URLs on paste
      globalRegularExpression: /(https?:\/\/|www\.|mailto:|tel:)[\S]+/g
    }
  }
});
```

## Options

### urlRegularExpression

> Regex used to check for URLs during *typing*.

**Default:** `/(https?:\/\/[\S]+)|(www.[\S]+)/`

**Example with custom Regex**

```javascript
magicUrl: {
  urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)|(mailto:[\S]+)|(tel:[\S]+)/
}
```

### globalRegularExpression

> Regex used to check for URLs on *paste*.

**Default:** `/(https?:\/\/|www\.)[\S]+/g`

**Example with custom Regex**

```javascript
magicUrl: {
  globalRegularExpression: /(https?:\/\/|www\.|mailto:|tel:)[\S]+/g
}
```

### normalizeRegularExpression

> Regex used to check for URLs to be  *normalized*. 

**Default:** `/(https?:\/\/[\S]+)|(www.[\S]+)/`

You will most likely want to keep this options default value.

### normalizeUrlOptions

> Options for normalizing the URL

**Default:**
```javascript
{
  stripFragment: false,
  stripWWW: false
}
```

**Example with custom Regex**

```javascript
magicUrl: {
  normalizeUrlOptions: {
    stripFragment: false,
    stripWWW: false,
    normalizeProtocol: false
  }
}
```

**Available options**

We use [normalize-url](https://github.com/sindresorhus/normalize-url) for normalizing URLs. You can find a detailed description of the possible options [here](https://github.com/sindresorhus/normalize-url#api).

## More infos on URL Regex

For some advanced URL Regex [check this out](https://mathiasbynens.be/demo/url-regex).

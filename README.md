# unify-paths  [![TravisCI](https://travis-ci.org/GerHobbelt/unify-paths.svg?branch=master)](https://travis-ci.org/GerHobbelt/unify-paths)

Unify file paths from any platform (Windows, OSX, UNIX) inside any text (string) to UNIX format.


## Install

```bash
npm i unify-paths
```


## How to use

```js
const unify = require("unify-paths");

// cross-platform assert of a text containing 
// URIs, file paths, stack traces, exception dumps, ...:
assert.strictEqual(unify(generatedBlurb), referenceText); 
```

Another suggested use is when dumping exception stack traces, e.g.:

```js
const unify = require("unify-paths");

...
try {
  throw new Error('kaboom');
} catch (ex) {
  let exmsg = `
    Error: ${ex.message}
    Stack Trace: ${ex.stack.join('\n')}`;
  report(unify(exmsg));
}
```


## When to use

- when you have arbitrary text which MAY CONTAIN file paths that need conversion
- when you have an input text which may be URL or a file path... or maybe even something else
- when you want to construct (unit) tests which check generated path strings, e.g. output produced by the NodeJS `path.resolve()` API. Now you can generate the reference value on a UNIX box and run the tests on another platform and expect a match when you feed the produce through `unify`
- anything else where you want to process one or more paths, possibly mixed with other confusing stuff such as literal newlines (`\n`, `\\n`) and URIs
- when you want to produce predictable and uniform output for any exception stack trace on any platform


## Related projects 

*Note*: all of these only process straight paths, i.e. these will barf or misbehave in other ways when you feed it an arbitrary chunk of text in which you want the file paths contained therein converted to the 'standard form'.

I am not aware of any library that accomplishes the same as this one.

- [node:slash](https://www.npmjs.com/package/slash)
- ?lodash API?
- ...


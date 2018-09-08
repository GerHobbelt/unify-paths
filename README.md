# unify-paths  [![npm](https://img.shields.io/npm/v/unify-paths.svg)](https://www.npmjs.com/package/unify-paths)   [![TravisCI](https://travis-ci.org/GerHobbelt/unify-paths.svg?branch=master)](https://travis-ci.org/GerHobbelt/unify-paths)   [![License](https://img.shields.io/github/license/mashape/apistatus.svg)](LICENSE)

Unify file paths from any platform (Windows, OSX, UNIX) inside any text (string) to UNIX format.


## Install

```bash
npm i unify-paths
```



## When to use

- when you have arbitrary text which MAY CONTAIN file paths that need conversion
- when you have an input text which may be URL or a file path... or maybe even something else
- when you want to construct (unit) tests which check generated path strings, e.g. output produced by the NodeJS `path.resolve()` API. Now you can generate the reference value on a UNIX box and run the tests on another platform and expect a match when you feed the produce through `unify`
- anything else where you want to process one or more paths, possibly mixed with other confusing stuff such as literal newlines (`\n`, `\\n`) and URIs
- when you want to produce predictable and uniform output for any exception stack trace on any platform


### Example

This code:

```js
const unify = require("../").default;

function dumpEr() {
  throw new Error("kabloowy!");
}

function main() {
  try {
    dumpEr();
  } catch (ex) {
    console.error(unify(ex.stack, {
      cwdPathPrefix: __dirname
    }));
  }
}

main();
```

produces this for the exception stack trace: 

```
Error: kabloowy!
    at dumpEr (<CWD>/stacktrace-dump.js:6:9)
    at main (<CWD>/stacktrace-dump.js:11:5)
    at Object.<anonymous> (<CWD>/stacktrace-dump.js:20:1)
    at Module._compile (module.js:652:30)
    at Object.Module._extensions..js (module.js:663:10)
    at Module.load (module.js:565:32)
    at tryModuleLoad (module.js:505:12)
    at Function.Module._load (module.js:497:3)
    at Function.Module.runMain (module.js:693:10)
    at startup (bootstrap_node.js:188:16)
```

That's nice & readable. Compare with the original input that was fed to `unify()`:

```
 Error: kabloowy!
    at dumpEr (W:\Users\Ger\Projects\sites\library.xyz.gov\80\lib\js\unify-paths\examples\stacktrace-dump.js:6:9)
    at main (W:\Users\Ger\Projects\sites\library.xyz.gov\80\lib\js\unify-paths\examples\stacktrace-dump.js:11:5)
    at Object.<anonymous> (W:\Users\Ger\Projects\sites\library.xyz.gov\80\lib\js\unify-paths\examples\stacktrace-dump.js:20:1)
    at Module._compile (module.js:652:30)
    at Object.Module._extensions..js (module.js:663:10)
    at Module.load (module.js:565:32)
    at tryModuleLoad (module.js:505:12)
    at Function.Module._load (module.js:497:3)
    at Function.Module.runMain (module.js:693:10)
    at startup (bootstrap_node.js:188:16)
```

which has those very long paths in there that obscure everything so much when you `console.log` this to a terminal window for debugging/diagnostics. :sad:



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


## API

Only one function is exported by this module: 

### `unify(text, options)`

- `text` can be any arbitrary string (piece of text) which needs to be processed by `unify()`. Any paths found in there will be converted to a UNIX-style look, i.e. backslashes are replaced with forward slashes, MSDOS/Windows drive letters are discarded, so that `/` is the *root* on every platform, etc.
- `options` is an *optional* object with these attributes:
  + `hasExplicitEscapes` (true|false) - when set, `unify()` will do its best to NOT replace any backslashes which are part of simple newline or unicode character escapes: `\n`, `\u1107`, ...
  + `cwdPathPrefix` (string) - can be any path that should be treated as 'CWD': any occurrence of this path will be replaced by `<CWD>` while `unify()` will attempt to convert all other paths in `text` to paths *relative to `<CWD>`*. See for example this `unify()`-produced stacktrace as can be found in the unit tests of this library:
    ```
    Error: kaboom
    at Context.<anonymous> (<CWD>/index.js:95:19)
    at callFn (<CWD>/../node_modules/mocha/lib/runnable.js:372:21)
    at Test.Runnable.run (<CWD>/../node_modules/mocha/lib/runnable.js:364:7)
    at Runner.runTest (<CWD>/../node_modules/mocha/lib/runner.js:455:10)
    at <CWD>/../node_modules/mocha/lib/runner.js:573:12
    at next (<CWD>/../node_modules/mocha/lib/runner.js:369:14)
    at <CWD>/../node_modules/mocha/lib/runner.js:379:7
    at next (<CWD>/../node_modules/mocha/lib/runner.js:303:14)
    at Immediate.<anonymous> (<CWD>/../node_modules/mocha/lib/runner.js:347:5)
    at runCallback (timers.js:794:20)
    at tryOnImmediate (timers.js:752:5)
    at processImmediate [as _immediateCallback] (timers.js:729:5)
    ```
    Note the `/../` relative parent path bits in there: those were added by `unify()`.
  + `reducePaths` (array|string) - set of (partial) paths -- with optional replacement string per entry -- which will be recognized and transformed by `unify()` in a similar fashion as is done for `cwdPathPrefix`. One might argue that `cwdPathPrefix` is a special case of `reducePaths = [{id: cwdPathPrefix, replacement: '<CWD>'}]`
  




## Related projects 

*Note*: all of these only process straight paths, i.e. these will barf or misbehave in other ways when you feed it an arbitrary chunk of text in which you want the file paths contained therein converted to the 'standard form'.

I am not aware of any library that accomplishes the same as this one.

- [node:slash](https://www.npmjs.com/package/slash)
- ?lodash API?
- ...


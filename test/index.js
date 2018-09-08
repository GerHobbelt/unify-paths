
const unify = require('../').default;
const assert = require('assert');
const cwd = __dirname;

describe('basic transformations', function () {
    it('should not modify a non-path carrying text', function () {
        const ref = 'abc and blabla\nmultiline\n...';
        let ist = unify(ref);
        assert.strictEqual(ist, ref);
    });

    it('should convert a path', function () {
        const ref = [
            'relative/unix/path/file.ext',
            ['relative\\windows\\path\\file.ext', 'relative/windows/path/file.ext'],
            ['\\absolute\\windows\\path\\file.ext', '/absolute/windows/path/file.ext'],
            // loose the drive letter:
            ['D:\\absolute\\windows\\path\\file.ext', '/absolute/windows/path/file.ext'],
        ];

        for (let i = 0, len = ref.length; i < len; i++) {
            let el = ref[i];
            let input, soll;
            if (el.length === 2) {
                input = el[0];
                soll = el[1];
            } else {
                input = el;
                soll = el;
            }
            let ist = unify(input);
            assert.strictEqual(ist, soll, `Test #${i}: input "${input}" should produce "${soll}"`);
        }
    });

    it('should not convert any URL', function () {
        const ref = [
            'http://example.com/',
            'http://bugger.com/foo/bar/do.html',
        ];

        for (let i = 0, len = ref.length; i < len; i++) {
            let soll = ref[i];
            let ist = unify(soll);
            assert.strictEqual(ist, soll, `Test #${i}: input "${soll}" should not be treated as a (Windows) path`);
        }
    });

    it('but should convert anything that looks like a corrupt URL (due to backslashes)', function () {
        const ref = [
            ['http:\\\\example.com\\', 'http://example.com/'],
            ['https:\\\\bugger.com\\foo\\bar\\do.html', 'https://bugger.com/foo/bar/do.html'],
            ['uri:\\\\0\\6\\458\\92-868\\2', 'uri://0/6/458/92-868/2'],
        ];

        for (let i = 0, len = ref.length; i < len; i++) {
            let el = ref[i];
            let soll = el[1];
            let input = el[0];
            let ist = unify(input);
            assert.strictEqual(ist, soll, `Test #${i}: input "${input}" should produce "${soll}"`);
        }
    });
});

describe('advanced transformations', function () {

    it('should not convert any escapes when option "hasExplicitEscapes" is set', function () {
        const ref = [
            'bollocks\\nis not part of that',
            ['wow! Another:\\none/hits/the/dust\nboth/escaped/and/literal', 'wow! Another:/none/hits/the/dust\nboth/escaped/and/literal'],
            'wow! Another:\\none hits the dust'
        ];

        for (let i = 0, len = ref.length; i < len; i++) {
            let el = ref[i];
            let input, soll;
            if (el.length === 2) {
                input = el[0];
                soll = el[1];
            } else {
                input = el;
                soll = el;
            }
            let ist = unify(input, {
                hasExplicitEscapes: true
            });
            assert.strictEqual(ist, soll, `Test #${i}: input "${input}" should have produced "${soll}"`);
        }
    });

    it('should help prduce nice stack traces in exception dumps', function () {
        try {
            throw new Error('kaboom');
        } catch (ex) {
            let msg = `Error: ${ex.message}\nStack Trace: ${ex.stack}`;
            let ist = unify(msg, {
                cwdPathPrefix: cwd
            });
            const soll = `
Error: kaboom
Stack Trace: Error: kaboom
    at Context.<anonymous> (<CWD>/index.js:95:10)
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
`;
            assert.strictEqual(ist, soll.trim(), `Exception ${ex} in CWD "${cwd}" should have printed as "${soll.trim()}"`);
        }
    });
});


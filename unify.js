
/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
const reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/**
 * Escapes the `RegExp` special characters "^", "$", "\", ".", "*", "+",
 * "?", "(", ")", "[", "]", "{", "}", and "|" in `string`.
 *
 * Taken/derived from lodash
 */
function escapeRegExp(string) {
  return string.replace(reRegExpChar, '\\$&');
}

// module.exports = unify;

// Regex for substitution in path
const baseReStr = (/(^|[^\w_\\/:])((?!http|s?ftp|uri)\w+:)?[\\/]+([\w_\\/-]+?[\\/]+)?X[\\/]+([\w_\\/-]+)/).source;

// Regex for generic path recognition
const genericAbsReStr = /(^|[^\w_\\/:])((?!http|s?ftp|uri)\w+:)?([\\/]+[\w_-]+[\\/]+)([\w_\\/-]+)/g;

export default function unify(input, options = {}) {
    let text = '' + input;

    if (options.hasExplicitEscapes) {
        text = text.replace(/(?=\\[^uxwbn])\\\\?/g, "/");
    } else {
        text = text.replace(/\\/g, "/");
    }

    let cwdPathPrefix = (options.cwdPathPrefix || '').replace(/\\/g, '/');
    let cwdReplacement = "<CWD>";

    while (cwdPathPrefix) {
        let re = RegExp(escapeRegExp(cwdPathPrefix), "g");
        text = text.replace(re, cwdReplacement);

        // execute the equivalent of path.dirname(), without requiring the `path` module:
        cwdPathPrefix = cwdPathPrefix.replace(/\/[^/]+$/, '');
        cwdReplacement += '/..';
        if (cwdPathPrefix.indexOf('/') < 0) break;
    }

    if (options.reducePaths) {
        let arr = Array.isArray(options.reducePaths) ? options.reducePaths : [options.reducePaths];
        for (let i = 0, len = arr.length; i < len; i++) {
            let el = arr[i];
            if (!el) continue;

            // decode spec item: {id, replacement}
            let id, replacement;
            if (el.id) {
                id = el.id;
                replacement = el.replacement;
                if (replacement == null) replacement = id;
            } else {
                id = '' + el;
                replacement = id;
            }

            let re = RegExp(baseReStr.replace('X', escapeRegExp(id)), "g");
            text = text.replace(re, function (m, prefix, uri, path1, path2) {
                // discard drive letters, e.g. "C:/", but do not delete network IDLs, e.g. "Waterloo:/":
                if (!uri || uri.length <= 2) uri = "";
                return `${prefix}${uri}/${replacement}/${path2.replace(/\\/g, '/')}`;
            });
        }
    }

    let re = genericAbsReStr;
    text = text.replace(re, function (m, prefix, uri, path1, path2) {
        // discard drive letters, e.g. "C:/", but do not delete network IDLs, e.g. "Waterloo:/":
        if (!uri || uri.length <= 2) uri = "";
        return `${prefix}${uri}${path1.replace(/\\/g, '/')}${path2.replace(/\\/g, '/')}`;
    });

    return text;
}

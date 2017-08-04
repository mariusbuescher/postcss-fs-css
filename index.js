'use strict';

const postcss = require('postcss');

const fsCss = postcss.plugin('postcss-fs-css', (options) => {
    options = options ? options : {
        abs: null
    };

    function filenameToUuid(filename) {
        return filename.toString()
            .replace('ä', 'ae')
            .replace('Ä', 'ae')
            .replace('ü', 'ue')
            .replace('Ü', 'ue')
            .replace('ö', 'oe')
            .replace('Ö', 'oe')
            .replace('ß', 'ss')
            .replace(/[^A-Za-z0-9@]/g, '_')
            .toLowerCase();
    }

    function isExternalFile(value) {
        const regExp = /^(https?:)?\/\//i;
        return regExp.test(value);
    }

    function isBase64File(value) {
        const regExp = /^data:[a-zA-Z0-9 \/+\-]+([; ]+)?(charset\=(\")?.+(\")?)?(\w+?base64(\w+)?,(\w)?)?\w+?,.*/ig;
        return regExp.test(value);
    }

    function transformUrl(src) {
        let abs = (options.abs) ? options.abs : null;
        const filename = src.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "");
        let uuid = filenameToUuid(filename).toLowerCase();

        // get filemapping configuration for file
        const fileMappingConfig = (() => {
            if (!options.hasOwnProperty('fileMapping') || typeof options.fileMapping  !== 'object') {
                return false;
            }
            return options.fileMapping[src];
        })();

        if (typeof fileMappingConfig === 'string') {
            // short configuration syntax detected, overwrite default reference name
            uuid = fileMappingConfig;
        }

        if (typeof fileMappingConfig === 'object') {
            // long configuration syntax, check for reference name config
            if (typeof fileMappingConfig.referenceName === 'string') {
                uuid = fileMappingConfig.referenceName;
            }

            // check for abs configuration
            if (typeof fileMappingConfig.abs !== 'undefined') {
                abs = fileMappingConfig.abs;
            }
        }

        // add abs cms_ref configuration when defined
        const absString = (abs !== null) ? ', abs:' + abs : '';

        let fsCall = '$CMS_REF(media:"' + uuid + '"' + absString + ')$';

        // add cache strategy if configured
        if (options.cacheStrategy === 'revision') {
            fsCall += '?rid=$CMS_VALUE(ref(media:"' + uuid + '").target.releaseRevision.id, default:#global.now.timeInMillis)$';
        }

        return fsCall;
    }

    return function postcssFsCss(css, result) {
        css.walkDecls((decl) => {
            decl.value = decl.value.replace(
                /url\(\s*['"]?([^'"#?]+)(?:[#?](?:[^'"\)]*))?['"]?\s*\)/g,
                (match, src) => {
                    if (src.length < 1 || src === "/") {
                        return match;
                    }

                    if (isExternalFile(src) || isBase64File(src)) {
                        return match;
                    }

                    const fsCall = transformUrl(src);

                    return match.replace(src, fsCall);
            });
        });

        css.walkAtRules('import', (atRule) => {
            atRule.params = atRule.params.replace(/^("|')?([^'"]+)("|')?$/, (match, open, src) => {
                if (src.length < 1 || src === "/") {
                    return match;
                }

                if (isExternalFile(src) || isBase64File(src)) {
                    return match;
                }

                const fsCall = transformUrl(src);

                return match.replace(src, fsCall);
            });
        });
    };
});

module.exports = fsCss;

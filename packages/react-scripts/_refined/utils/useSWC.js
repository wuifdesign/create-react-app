'use strict';

const fs = require('fs');
const path = require('path');
const paths = require('../../config/paths');
const deepmerge = require('deepmerge');

const useSWC = (rules, config) => {
  if (!config.swcLoader) {
    return rules;
  }

  const useTypeScript = fs.existsSync(paths.appTsConfig);
  let babelLoaderIndexArray = [];
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (
      typeof rule.loader === 'string' &&
      rule.loader.indexOf(`${path.sep}babel-loader${path.sep}`) !== -1
    ) {
      babelLoaderIndexArray.push(i);
      break;
    }
  }
  for (const index of babelLoaderIndexArray) {
    rules.splice(index, 1);
  }
  if (typeof babelLoaderIndexArray[0] !== 'undefined') {
    rules.splice(babelLoaderIndexArray[0], 0, {
      test: /\.(js|mjs|jsx|ts|tsx)$/,
      include: paths.appSrc,
      loader: require.resolve('swc-loader'),
      options: deepmerge(
        {
          jsc: {
            target: 'es2015',
            externalHelpers: true,
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
            parser: useTypeScript
              ? {
                  syntax: 'typescript',
                  tsx: true,
                  dynamicImport: true,
                }
              : {
                  syntax: 'ecmascript',
                  jsx: true,
                  dynamicImport: true,
                },
          },
        },
        typeof config.swcLoader === 'object' ? config.swcLoader : {}
      ),
    });
  }

  return rules;
};

module.exports = useSWC;

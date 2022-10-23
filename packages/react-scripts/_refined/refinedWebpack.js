'use strict';

const paths = require('../config/paths');
const refinedRules = require('./utils/refinedRules');
const refinedPlugins = require('./utils/refinedPlugins');
const merge = require('deepmerge');
const satisfies = require('spdx-satisfies');

const config = (() => {
  try {
    return require(paths.reactScriptsRefinedConfig);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      return () => ({});
    }
    throw e;
  }
})();

const defaultConfig = {
  useSWCLoader: false,
  settings: {
    licensePlugin: {
      unacceptableLicenseTest: licenseType =>
        !satisfies(
          licenseType,
          '(Apache-2.0 OR BSD-2-Clause OR BSD-3-Clause OR MIT)'
        ),
    },
    lessLoader: {
      lessOptions: {
        javascriptEnabled: true,
      },
    },
  },
  webpack: {
    alias: {},
    rules: [],
    plugins: {
      remove: ['2'],
      add: [],
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/i,
            name: 'vendors',
            chunks: 'initial',
            reuseExistingChunk: true,
            priority: -10,
          },
          vendorCss: {
            test: /#vendors$/i,
            type: 'css/mini-extract',
            name: 'vendors',
            chunks: 'initial',
            priority: 10,
            enforce: true,
          },
        },
      },
    },
    configure(webpackConfig) {
      return webpackConfig;
    },
  },
};

function getConfig({ env, paths }) {
  const argv = process.argv.slice(2);
  const userConfig = config({ env, paths });
  const mergedConfig = merge(defaultConfig, userConfig);

  if (argv.indexOf('--analyze') === -1) {
    mergedConfig.webpack.plugins.remove.push('BundleAnalyzerPlugin');
  }

  return mergedConfig;
}

function refinedWebpack(webpackConfig, { env, paths }) {
  const isEnvDevelopment = env === 'development';
  const isEnvProduction = env === 'production';
  const additionalParams = { env, isEnvProduction, isEnvDevelopment, paths };
  const mergedConfig = getConfig(additionalParams);

  webpackConfig.output.filename = isEnvProduction
    ? 'static/js/[name].[contenthash:8].js'
    : isEnvDevelopment && 'static/js/[name].js';

  webpackConfig.plugins = refinedPlugins(
    webpackConfig.plugins,
    mergedConfig,
    additionalParams
  ).filter(Boolean);

  const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
  if (!oneOfRule) {
    throw new Error(
      `Can't find a 'oneOf' rule under module.rules in the ${env} webpack config!`,
      'webpack+rules+oneOf'
    );
  }
  oneOfRule.oneOf = refinedRules(
    oneOfRule.oneOf,
    mergedConfig,
    additionalParams
  ).filter(Boolean);

  webpackConfig.optimization = {
    ...webpackConfig.optimization,
    ...mergedConfig.webpack.optimization,
  };

  webpackConfig.resolve.alias = {
    ...webpackConfig.resolve.alias,
    ...mergedConfig.webpack.alias,
  };

  return mergedConfig.webpack.configure(webpackConfig);
}

module.exports = {
  getConfig,
  refineWebpack: refinedWebpack,
};

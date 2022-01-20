'use strict';

const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CircularDependencyPlugin = require('circular-dependency-plugin');
const DuplicatePackageCheckerPlugin = require('@cerner/duplicate-package-checker-webpack-plugin');
const licenseCheckerOutputWriter = require('./licenseCheckerOutputWriter');
const LicenseCheckerWebpackPlugin = require('license-checker-webpack-plugin');
const WebpackBarPlugin = require('webpackbar');

const refinedPlugins = (plugins, config, { env }) => {
  const isEnvProduction = env === 'production';

  plugins = [
    ...plugins,
    isEnvProduction && new BundleAnalyzerPlugin(),
    isEnvProduction &&
      new CircularDependencyPlugin({
        exclude: /node_modules/,
        failOnError: true,
      }),
    isEnvProduction &&
      new LicenseCheckerWebpackPlugin({
        filter:
          /(^.*[/\\]node_modules[/\\]((?:@[^/\\]+[/\\])?(?:[^@/\\][^/\\]*)))/,
        outputWriter: licenseCheckerOutputWriter,
        emitError: true,
        ...config.settings.licenseChecker,
      }),
    new WebpackBarPlugin(),
    new DuplicatePackageCheckerPlugin({
      alwaysEmitErrorsFor: ['react', 'react-router'],
    }),
  ];

  const removePlugins = config.webpack.plugins.remove.filter(Boolean);

  plugins = plugins.filter(plugin => {
    return removePlugins.indexOf(plugin.constructor.name) === -1;
  });

  return [...plugins, ...config.webpack.plugins.add.filter(Boolean)];
};

module.exports = refinedPlugins;

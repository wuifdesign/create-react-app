'use strict';

const chalk = require('chalk');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CircularDependencyPlugin = require('circular-dependency-plugin');
const DuplicatePackageCheckerPlugin = require('@cerner/duplicate-package-checker-webpack-plugin');
const licenseOutputWriter = require('./licenseOutputWriter');
const LicenseWebpackPlugin =
  require('license-webpack-plugin').LicenseWebpackPlugin;

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
      new LicenseWebpackPlugin({
        stats: {
          warnings: false,
          errors: true,
        },
        perChunkOutput: false,
        skipChildCompilers: true,
        outputFilename: 'license-summary.txt',
        handleUnacceptableLicense: (packageName, licenseType) => {
          throw Error(
            chalk.red(
              `Unacceptable license found for ${packageName}: ${licenseType}`
            )
          );
        },
        handleMissingLicenseType: packageName => {
          throw Error(chalk.red(`No license found for ${packageName}.`));
        },
        renderLicenses: licenseOutputWriter,
        ...config.settings.licensePlugin,
      }),
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

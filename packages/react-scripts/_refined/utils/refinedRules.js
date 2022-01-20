'use strict';

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const paths = require('../../config/paths');

const refinedRules = (rules, config, { env }) => {
  const isEnvDevelopment = env === 'development';
  const isEnvProduction = env === 'production';
  const lastRules = rules.splice(-1);

  return [
    ...rules,
    {
      test: /\.less$/i,
      use: [
        isEnvDevelopment && require.resolve('style-loader'),
        isEnvProduction && {
          loader: MiniCssExtractPlugin.loader,
          // css is located in `static/css`, use '../../' to locate index.html folder
          // in production `paths.publicUrlOrPath` can be a relative path
          options: paths.publicUrlOrPath.startsWith('.')
            ? { publicPath: '../../' }
            : {},
        },
        { loader: 'css-loader' },
        {
          loader: 'less-loader',
          options: {
            lessOptions: config.settings.lessLoader,
          },
        },
      ].filter(Boolean),
    },
    ...config.webpack.rules,
    ...lastRules,
  ];
};

module.exports = refinedRules;

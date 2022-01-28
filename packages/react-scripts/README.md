# Improvements added to `react-scripts-refined`

**Based on `react-scripts@5.0.0`**

- Added `less-loader`
- Added report of entry size after build
- Added following webpack plugins
  - BundleAnalyzerPlugin
  - CircularDependencyPlugin
  - DuplicatePackageCheckerPlugin
  - LicenseCheckerWebpackPlugin
  - WebpackBarPlugin
- Added functionality to extend webpack plugins and rules
- Added split config für vendor chunk (including all files from node_modules)

### Create a new project with `react-script-refined`

```bash
# Javascript
npx create-react-app my-app --scripts-version react-scripts-refined
# Typescript
npx create-react-app my-app --template typescript --scripts-version react-scripts-refined
```

### Use with Typescript

You need to update the default `src/react-app-env.d.ts` to use `react-scripts-refined` instead of `react-scripts`.

```
/// <reference types="react-scripts-refined" />
```

### Config with `<root>/react-scripts-refined.config.js`

```js
// <root>/react-scripts-refined.config.js
module.exports = ({ env, isEnvProduction, isEnvDevelopment, paths }) => ({
  settings: {
    /**
     * https://github.com/Microsoft/license-checker-webpack-plugin
     * @var LicenseCheckerWebpackPluginOptions
     */
    licenseChecker: {
      allow: '(Apache-2.0 OR BSD-2-Clause OR BSD-3-Clause OR MIT)',
    },
    /**
     * Settings for the 'less-loader' rule.
     * See https://lesscss.org/usage/#using-less-in-the-browser-setting-options for info about options.
     */
    lessLoader: {},
  },
  webpack: {
    /**
     * Any additional WebpackRule can be added here.
     */
    rules: [],
    plugins: {
      /**
       * If you want to remove an existing plugin add name here. (i.e. ['WebpackManifestPlugin'])
       */
      remove: [],
      /**
       * Any additional WebpackPlugin can be added here.
       */
      add: [],
    },
    /**
     * If you want to make changes to the webpack config.
     */
    configure(webpackConfig) {
      return webpackConfig;
    },
  },
});
```

### Vendor CSS Split

If you append `#vendors` to an import of a `css/less/css/scss/sass` file, it will create a separate `vendors.[hash].css` on build.

```js
import './vendor.css#vendors';
```

### Running webpack-bundle-analyzer

If enabled `bundleAnalyzer` in your config you can run it by adding the following to th `package.json`.

```
// package.json
{
  "scripts": {
    ...
    "analyze": "react-scripts build --analyze",
  }
}
```

---

# react-scripts

This package includes scripts and configuration used by [Create React App](https://github.com/facebook/create-react-app).<br>
Please refer to its documentation:

- [Getting Started](https://facebook.github.io/create-react-app/docs/getting-started) – How to create a new app.
- [User Guide](https://facebook.github.io/create-react-app/) – How to develop apps bootstrapped with Create React App.

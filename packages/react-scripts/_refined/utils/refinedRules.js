'use strict';

const deepClone = require('./deepClone');

const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const styleRuleByName = (name, module) => {
  return rule => {
    if (rule.test) {
      const test = rule.test.toString();

      const includeName = test.includes(name);
      const includeModule = test.includes('module');

      return module
        ? includeName && includeModule
        : includeName && !includeModule;
    }

    return false;
  };
};

const createLessRule = ({ baseRule, overrideRule, config }) => {
  baseRule = deepClone(baseRule);

  let lessRule = {
    ...baseRule,
    ...overrideRule,
    use: [],
  };

  baseRule.use.forEach(ruleOrLoader => {
    let rule;
    if (typeof ruleOrLoader === 'string') {
      rule = {
        loader: ruleOrLoader,
        options: {},
      };
    } else {
      rule = ruleOrLoader;
    }

    if (rule.loader.includes(`sass-loader`)) {
      lessRule.use.push({
        loader: require.resolve('less-loader'),
        options: {
          ...rule.options,
          ...config.settings.lessLoader,
        },
      });
    } else {
      lessRule.use.push(rule);
    }
  });

  return lessRule;
};

const getLessRules = (rules, config, { env }) => {
  const sassRule = rules.find(styleRuleByName('scss|sass', false));
  if (!sassRule) {
    throw new Error(
      `Can't find the webpack rule to match scss/sass files in the ${env} webpack config!`,
      'webpack+rules+scss+sass'
    );
  }

  const sassModuleRule = rules.find(styleRuleByName('scss|sass', true));
  if (!sassModuleRule) {
    throw new Error(
      `Can't find the webpack rule to match scss/sass module files in the ${env} webpack config!`,
      'webpack+rules+scss+sass'
    );
  }

  return [
    createLessRule({
      config,
      baseRule: sassRule,
      overrideRule: {
        test: lessRegex,
        exclude: lessModuleRegex,
      },
    }),
    createLessRule({
      config,
      baseRule: sassModuleRule,
      overrideRule: {
        test: lessModuleRegex,
      },
    }),
  ];
};

const refinedRules = (rules, config, { env }) => {
  const lastRules = rules.splice(-1);
  return [
    ...rules,
    ...getLessRules(rules, config, { env }),
    ...config.webpack.rules,
    ...lastRules,
  ];
};

module.exports = refinedRules;

'use strict';

const prettyMilliseconds = require('pretty-ms');
const chalk = require('react-dev-utils/chalk');

// Prints the build duration after build.
function printBuildTimeAfterBuild(webpackStats) {
  const { warnings, time } = (webpackStats.stats || [webpackStats])[0].toJson({
    all: false,
    warnings: true,
    timings: true,
  });
  const humanTime = prettyMilliseconds(time);

  if (warnings.length) {
    console.log(chalk.yellow(`Compiled with warnings in ${humanTime}.\n`));
  } else {
    console.log(chalk.green(`Compiled successfully in ${humanTime}.\n`));
  }
}

module.exports = printBuildTimeAfterBuild;

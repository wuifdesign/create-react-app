/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var filesize = require('filesize');
var stripAnsi = require('strip-ansi');
var gzipSize = require('gzip-size').sync;

function canReadAsset(asset) {
  return (
    /\.(js|css)$/.test(asset) &&
    !/service-worker\.js/.test(asset) &&
    !/precache-manifest\.[0-9a-f]+\.js/.test(asset)
  );
}

// Prints a detailed summary of entry files.
function printEntrySizesAfterBuild(
  webpackStats,
  previousSizeMap,
  buildFolder,
  maxEntryGzipSize
) {
  const root = previousSizeMap.root;
  const assets = (webpackStats.stats || [webpackStats])
    .map(stats => {
      const entryPoints = stats.toJson({
        all: false,
        entrypoints: true,
      }).entrypoints;
      const data = [];
      for (const [key, value] of Object.entries(entryPoints)) {
        const temp = {
          name: key,
          assets: [],
          size: 0,
        };
        for (const asset of value.assets) {
          if (!canReadAsset(asset.name)) {
            continue;
          }
          const fileContents = fs.readFileSync(path.join(root, asset.name));
          const size = gzipSize(fileContents);
          temp.size += size;
          temp.assets.push({
            folder: path.join(
              path.basename(buildFolder),
              path.dirname(asset.name)
            ),
            name: path.basename(asset.name),
            size: size,
            sizeLabel: filesize(size),
          });
        }
        temp.assets.sort((a, b) => b.size - a.size);
        temp.sizeLabel = filesize(temp.size);
        data.push(temp);
      }
      return data;
    })
    .reduce((single, all) => all.concat(single), []);
  assets.sort((a, b) => b.size - a.size);

  let showInfo = false;
  assets.forEach(asset => {
    const isToBig = asset.size > maxEntryGzipSize;
    if (isToBig) {
      showInfo = true;
    }
    console.log(
      '  ' +
        asset.name +
        ' ' +
        (isToBig
          ? chalk.yellow(`(${asset.sizeLabel})`)
          : `(${asset.sizeLabel})`)
    );
    const longestSizeLabelLength = Math.max.apply(
      null,
      asset.assets.map(a => stripAnsi(a.sizeLabel).length)
    );
    asset.assets.forEach(part => {
      let sizeLabel = part.sizeLabel;
      const sizeLength = stripAnsi(sizeLabel).length;
      if (sizeLength < longestSizeLabelLength) {
        sizeLabel += ' '.repeat(longestSizeLabelLength - sizeLength);
      }
      console.log(
        '    ' +
          sizeLabel +
          '  ' +
          chalk.dim(part.folder + path.sep) +
          chalk.cyan(part.name)
      );
    });
    if (showInfo) {
      console.log();
      console.log(
        chalk.yellow(
          `Some of the entrypoint(s) combined asset size exceeds the recommended limit (${filesize(
            maxEntryGzipSize,
            { base: 2 }
          )}). This can impact web performance.`
        )
      );
    }
  });
}

module.exports = {
  printEntrySizesAfterBuild: printEntrySizesAfterBuild,
};

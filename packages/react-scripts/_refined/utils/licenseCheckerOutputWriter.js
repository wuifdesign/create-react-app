'use strict';

const licenseCheckerOutputWriter = ({ dependencies }) => {
  const licences = dependencies.reduce(
    (prev, { licenseName, name }) => ({
      ...prev,
      [licenseName]: [...(prev[licenseName] || []), name],
    }),
    {}
  );
  const summary = Object.entries(licences)
    .map(([key, value]) => `${key || 'UNLICENSED'}: ${value.length}`)
    .join('\n');
  const details = Object.entries(licences)
    .map(
      ([key, value]) =>
        `${key || 'UNLICENSED'}:\n${value.map(v => `- ${v}`).join('\n')}`
    )
    .join('\n\n');
  return `${summary}\n\n${details}`;
};

module.exports = licenseCheckerOutputWriter;

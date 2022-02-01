'use strict';

const licenseOutputWriter = modules => {
  const licences = modules.reduce(
    (prev, { licenseId, name }) => ({
      ...prev,
      [licenseId]: [...(prev[licenseId] || []), name],
    }),
    {}
  );

  const sortedLicences = Object.fromEntries(
    Object.entries(licences).sort(([, a], [, b]) => b.length - a.length)
  );

  const summary = Object.entries(sortedLicences)
    .map(([key, value]) => `${key || 'UNLICENSED'}: ${value.length}`)
    .join('\n');

  const details = Object.entries(sortedLicences)
    .map(
      ([key, value]) =>
        `${key || 'UNLICENSED'}:\n${value.map(v => `- ${v}`).join('\n')}`
    )
    .join('\n\n');
  return `${summary}\n\n${details}`;
};

module.exports = licenseOutputWriter;

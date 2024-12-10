const path = require('path');
const exportFields = require('./exportFields');

const appConfig = {
  files: {
    import: {
      path: path.resolve('import.csv'),
      encoding: 'utf8',
      delimiter: ','
    },
    export: {
      path: path.resolve('export.csv'),
      encoding: 'utf8',
      delimiter: ';',
      fields: exportFields
    }
  }
};

module.exports = appConfig;
const csvParser = require('csv-parser');
const { parse } = require('json2csv');
const fs = require('fs');

// Map of normalized field names
const FIELD_MAP = {
  'id': 'ID',
  'typ': 'Typ',
  'type': 'Typ',
  'name': 'Name',
  'kurzbeschreibung': 'Kurzbeschreibung',
  'schlagwörter': 'Schlagwörter',
  'attribut 1 name': 'Attribut 1 Name',
  'attribut 1 wert(e)': 'Attribut 1 Wert(e)',
  'artikelnummer': 'Artikelnummer',
  'nährwert referenzmenge titelform': 'Nährwert Referenzmenge Titelform',
  'lager': 'Lager',
  'regulärer preis': 'Regulärer Preis',
  'bilder': 'Bilder',
  'übergeordnetes produkt': 'Übergeordnetes Produkt'
};

function normalizeFieldName(fieldName) {
  if (!fieldName) return '';
  const normalized = fieldName.toLowerCase().trim();
  return FIELD_MAP[normalized] || fieldName;
}

async function readCsvFile(filePath, config) {
  const rows = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath, { encoding: config.encoding })
      .on('error', (error) => {
        if (error.code === 'ENOENT') {
          reject(new Error(`Input file not found: ${filePath}`));
        } else {
          reject(error);
        }
      })
      .pipe(csvParser({ 
        separator: config.delimiter,
        quote: '"',
        escape: '"',
        mapValues: ({ header, value }) => {
          value = value.replace(/^\uFEFF/, '').trim();
          return value;
        },
        mapHeaders: ({ header }) => {
          header = header.replace(/^\uFEFF/, '').trim();
          return normalizeFieldName(header);
        }
      }))
      .on('data', (row) => {
        if (Object.keys(row).length === 1) {
          const key = Object.keys(row)[0];
          const values = row[key].split(config.delimiter).map(v => v.trim());
          const headers = key.split(config.delimiter).map(h => normalizeFieldName(h.trim()));
          
          const newRow = {};
          headers.forEach((header, index) => {
            newRow[header] = values[index] || '';
          });
          rows.push(newRow);
        } else {
          rows.push(row);
        }
      })
      .on('end', () => {
        console.log(`Successfully parsed ${rows.length} rows`);
        resolve(rows);
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        reject(error);
      });
  });
}

function writeCsvFile(filePath, data, fields, config) {
  try {
    const csv = parse(data, { 
      fields,
      delimiter: config.delimiter,
      quote: '"',
      header: true,
      escapedQuote: '""'
    });
    fs.writeFileSync(filePath, csv, config.encoding);
  } catch (error) {
    console.error('Error writing CSV:', error);
    throw error;
  }
}

module.exports = {
  readCsvFile,
  writeCsvFile
};
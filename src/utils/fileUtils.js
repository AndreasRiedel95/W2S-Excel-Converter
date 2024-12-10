const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(filePath) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function createExampleImportFile() {
  const exampleContent = `ID;Typ;Artikelnummer;Name;Veröffentlicht;Kurzbeschreibung;Lager;Regulärer Preis;Schlagwörter;Bilder;Attribut 1 Name;Attribut 1 Wert(e)
1;variable;123;Example Product;1;Example description;10;99,90;tag1,tag2;https://example.com/image1.jpg;Größe;M`;
  
  const importPath = path.resolve('import.csv');
  fs.writeFileSync(importPath, exampleContent, 'utf8');
  return importPath;
}

module.exports = {
  ensureDirectoryExists,
  createExampleImportFile
};
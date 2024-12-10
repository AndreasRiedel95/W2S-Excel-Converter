const { readCsvFile, writeCsvFile } = require('../utils/csvUtils');
const { ensureDirectoryExists } = require('../utils/fileUtils');
const { parseImages, createHandle } = require('../utils/productUtils');
const ProductRow = require('../models/ProductRow');
const appConfig = require('../config/appConfig');

class CsvConverter {
  constructor() {
    const { import: importConfig, export: exportConfig } = appConfig.files;
    this.importFilePath = importConfig.path;
    this.exportFilePath = exportConfig.path;
    this.importConfig = importConfig;
    this.exportConfig = exportConfig;
  }

  async convert() {
    try {
      ensureDirectoryExists(this.exportFilePath);
      const rows = await readCsvFile(this.importFilePath, this.importConfig);
      
      if (!rows || rows.length === 0) {
        throw new Error('No data found in import.csv');
      }

      console.log(`Processing ${rows.length} rows...`);
      const outputRows = this.processRows(rows);
      console.log(`Generated ${outputRows.length} output rows`);

      writeCsvFile(this.exportFilePath, outputRows, this.exportConfig.fields, this.exportConfig);
      console.log('Conversion complete! Check export.csv');
    } catch (error) {
      console.error('Error during conversion:', error.message);
      process.exit(1);
    }
  }

  processRows(rows) {
    const outputRows = [];
    const products = this.groupProductsWithVariants(rows);

    console.log(`Found ${products.length} products to process`);

    products.forEach(({ parent, variants }) => {
      if (!parent) {
        console.warn('Skipping invalid product: Missing parent');
        return;
      }

      const images = parseImages(parent['Bilder']);
      let imagePosition = 1;

      // Handle products with no variants
      if (variants.length === 0) {
        try {
          const row = ProductRow.create(parent, parent, true, imagePosition++, images[0] || '');
          outputRows.push(row);
        } catch (error) {
          console.error(`Error processing single product ${parent['Name']}:`, error.message);
        }
      } else {
        // Handle products with variants
        variants.forEach((variant, index) => {
          try {
            const image = images[imagePosition - 1] || '';
            const row = ProductRow.create(parent, variant, index === 0, imagePosition++, image);
            outputRows.push(row);
          } catch (error) {
            console.error(`Error processing variant for ${parent['Name']}:`, error.message);
          }
        });
      }

      // Add remaining image rows
      while (imagePosition <= images.length) {
        try {
          const handle = createHandle(parent['Name']);
          const imageRow = ProductRow.createImageRow(
            handle,
            images[imagePosition - 1],
            imagePosition++
          );
          outputRows.push(imageRow);
        } catch (error) {
          console.error(`Error processing additional image for ${parent['Name']}:`, error.message);
        }
      }
    });

    return outputRows;
  }

  groupProductsWithVariants(rows) {
    const products = [];
    const productMap = new Map();

    // First pass: Identify parent products and create the map
    rows.forEach(row => {
      const id = row['ID'];
      const parentProductRef = row['Übergeordnetes Produkt'];

      if (!parentProductRef) {
        // This is a parent product
        productMap.set(id, {
          parent: row,
          variants: []
        });
      }
    });

    // Second pass: Associate variants with their parents
    rows.forEach(row => {
      const parentProductRef = row['Übergeordnetes Produkt'];
      
      if (parentProductRef) {
        // Extract parent ID from reference (e.g., "id:4181" -> "4181")
        const parentId = parentProductRef.replace('id:', '');
        const parentProduct = productMap.get(parentId);
        
        if (parentProduct) {
          parentProduct.variants.push(row);
        }
      }
    });

    // Convert map to array and filter out empty products
    productMap.forEach(product => {
      if (product.parent) {
        products.push(product);
      }
    });

    return products;
  }
}

module.exports = CsvConverter;
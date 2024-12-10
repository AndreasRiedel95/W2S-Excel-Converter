const { convertToHTML } = require('../utils/htmlUtils');
const { parsePrice, parseInventoryQuantity, cleanTitle } = require('../utils/productUtils');

const fieldMappings = {
  // Fields that should only appear on the parent product
  parentOnly: {
    'Title': {
      sourceField: 'Name',
      transform: (value) => cleanTitle(value)
    },
    'Vendor': 'Full Send Shop',
    'Product Category': 'Bekleidung & Accessoires',
    'Body (HTML)': {
      sourceField: 'Kurzbeschreibung',
      transform: (value) => convertToHTML(value)
    },
    'Tags': 'Schlagwörter',
    'Status': 'active',
    'Published': 'true'
  },

  // Simple mappings with static values for all rows
  static: {
    'Type': '',
    'Variant Inventory Tracker': 'shopify',
    'Variant Inventory Policy': 'deny',
    'Variant Fulfillment Service': 'manual',
    'Variant Requires Shipping': 'true',
    'Variant Taxable': 'true',
    'Gift Card': 'false',
    'Variant Weight Unit': 'g',
    'Included / Germany': 'true',
    'Included / European Union': 'true',
    'Included / International': 'true',
    'Option1 Linked To': '',
    'Option2 Linked To': '',
    'Option3 Linked To': '',
    'Variant Compare At Price': '',
    'Variant Barcode': '',
    'Image Alt Text': '',
    'SEO Title': '',
    'SEO Description': '',
    'Google Shopping / Google Product Category': '',
    'Google Shopping / Gender': '',
    'Google Shopping / Age Group': '',
    'Google Shopping / MPN': '',
    'Google Shopping / Condition': '',
    'Google Shopping / Custom Product': '',
    'Google Shopping / Custom Label 0': '',
    'Google Shopping / Custom Label 1': '',
    'Google Shopping / Custom Label 2': '',
    'Google Shopping / Custom Label 3': '',
    'Google Shopping / Custom Label 4': '',
    'Farbe (product.metafields.shopify.color-pattern)': '',
    'Variant Tax Code': '',
    'Cost per item': '',
    'Price / Germany': '',
    'Compare At Price / Germany': '',
    'Price / European Union': '',
    'Compare At Price / European Union': '',
    'Price / International': '',
    'Compare At Price / International': ''
  },

  // Direct field mappings (source -> target)
  direct: {
    'Artikelnummer': 'Variant SKU',
    'Nährwert Referenzmenge Titelform': 'Variant Grams',
    'Lager': 'Variant Inventory Qty',
    'Regulärer Preis': 'Variant Price',
  },

  // Complex transformations
  transforms: {
    'Variant Price': {
      sourceField: 'Regulärer Preis',
      transform: (value) => parsePrice(value)
    },
    'Variant Inventory Qty': {
      sourceField: 'Lager',
      transform: (value) => parseInventoryQuantity(value)
    },
    'Variant Grams': {
      sourceField: 'Nährwert Referenzmenge Titelform',
      transform: (value) => value || '0.0'
    }
  },

  // Special handlers for complex logic
  specialHandlers: {
    options: {
      process: (row) => {
        const options = {
          option1: { name: '', value: '' },
          option2: { name: '', value: '' },
          option3: { name: '', value: '' }
        };

        // Define attribute mappings and their priorities
        const attributeMappings = [
          { name: 'größe', outputName: 'Größe', priority: 1 },
          { name: 'waschen', outputName: 'Waschen', priority: 2 },
          { name: 'farbe', outputName: 'Farbe', priority: 3 }
        ];

        // Find all attributes in the row
        const foundAttributes = [];
        for (let i = 1; i <= 3; i++) {
          const attrName = row[`Attribut ${i} Name`]?.toLowerCase();
          if (attrName) {
            const mapping = attributeMappings.find(m => m.name === attrName);
            if (mapping) {
              foundAttributes.push({
                ...mapping,
                value: row[`Attribut ${i} Wert(e)`]?.split(',')[0]?.trim() || '',
                position: i
              });
            }
          }
        }

        // Sort by priority and assign to options
        foundAttributes
          .sort((a, b) => a.priority - b.priority)
          .slice(0, 3)
          .forEach((attr, index) => {
            const optionNumber = index + 1;
            options[`option${optionNumber}`] = {
              name: attr.outputName,
              value: attr.value
            };
          });

        return options;
      }
    },
    images: {
      process: (row, context) => {
        return {
          imageSrc: context.currentImage || '',
          variantImage: row['Bilder'] ? row['Bilder'].split(',')[0]?.trim() : '',
          imagePosition: context.currentImage ? context.imagePosition.toString() : ''
        };
      }
    }
  }
};

module.exports = fieldMappings;
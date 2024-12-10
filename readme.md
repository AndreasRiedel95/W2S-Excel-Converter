# CSV Converter for Shopify Product Import

A flexible and configurable CSV converter that transforms WooCommerce product data from a WooCommerce csv format into Shopify's product import format.

## Overview

This tool converts CSV files containing product data into Shopify's product import format, handling:

- Parent products and variants
- Multiple product attributes (Size, Color, Washing instructions)
- Multiple images per product
- Complex field mappings and transformations

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Place your input CSV file as `import.csv` in the root directory

3. Run the converter:

```bash
npm start
```

The converted file will be generated as `export.csv`.

## Configuration

The converter is highly configurable through several configuration files in the `src/config` directory.

### App Configuration (`appConfig.js`)

Controls file paths and CSV settings:

```javascript
{
  files: {
    import: {
      path: 'import.csv',
      encoding: 'utf8',
      delimiter: ','
    },
    export: {
      path: 'export.csv',
      encoding: 'utf8',
      delimiter: ';'
    }
  }
}
```

### Field Mappings (`fieldMappings.js`)

Defines how fields are mapped from import to export:

1. **Parent-only Fields**: Only appear on the first variant or single products

```javascript
parentOnly: {
  'Title': {
    sourceField: 'Name',
    transform: (value) => cleanTitle(value)
  },
  'Vendor': 'Full Send Shop'  // Static value
}
```

2. **Static Fields**: Same value for all rows

```javascript
static: {
  'Type': '',
  'Variant Inventory Tracker': 'shopify'
}
```

3. **Direct Mappings**: Simple field-to-field mappings

```javascript
direct: {
  'Artikelnummer': 'Variant SKU'
}
```

4. **Transformations**: Fields that need processing

```javascript
transforms: {
  'Variant Price': {
    sourceField: 'Regulärer Preis',
    transform: (value) => parsePrice(value)
  }
}
```

5. **Special Handlers**: Complex logic for specific features

```javascript
specialHandlers: {
  options: {
    process: (row) => {
      // Handle product options (Size, Color, etc.)
    }
  },
  images: {
    process: (row, context) => {
      // Handle product images
    }
  }
}
```

### Export Fields (`exportFields.js`)

Defines the structure of the export CSV file. Add or remove fields here to modify the output structure.

## Input CSV Structure

The import CSV should have the following key fields:

| Field Name             | Description                             |
| ---------------------- | --------------------------------------- |
| ID                     | Product identifier                      |
| Übergeordnetes Produkt | Parent product reference (for variants) |
| Name                   | Product name                            |
| Kurzbeschreibung       | Product description                     |
| Artikelnummer          | SKU                                     |
| Lager                  | Inventory quantity                      |
| Regulärer Preis        | Price                                   |
| Schlagwörter           | Tags                                    |
| Bilder                 | Comma-separated image URLs              |
| Attribut 1 Name        | First attribute name (e.g., "Größe")    |
| Attribut 1 Wert(e)     | First attribute value(s)                |
| Attribut 2 Name        | Second attribute name                   |
| Attribut 2 Wert(e)     | Second attribute value(s)               |

## Output CSV Structure

The export CSV follows Shopify's product import format with these key sections:

1. **Product Information**

   - Handle, Title, Body (HTML), Vendor, etc.

2. **Options**

   - Up to 3 options (e.g., Size, Color, Washing Instructions)

3. **Variant Details**

   - SKU, Price, Inventory, etc.

4. **Images**

   - Product and variant-specific images

5. **Additional Settings**
   - Regional pricing, shipping, etc.

## Adding New Mappings

To add a new field mapping:

1. Add the field to `exportFields.js` if it's a new export field
2. Add the mapping in `fieldMappings.js` under the appropriate section:
   ```javascript
   direct: {
     'ImportField': 'ExportField'  // For simple mappings
   }
   ```
   or
   ```javascript
   transforms: {
     'ExportField': {
       sourceField: 'ImportField',
       transform: (value) => // transformation logic
     }
   }
   ```

## Image Handling

The converter handles images in two ways:

1. **Product Images**: From the parent product's `Bilder` field

   - Distributed across variants
   - Additional images create new rows

2. **Variant Images**: From each variant's `Bilder` field
   - Assigned to `Variant Image` field
   - Takes precedence over product images

## Error Handling

The converter logs:

- Processing progress
- Errors during conversion
- Missing required fields
- Invalid data formats

## Best Practices

1. Always validate your input CSV format
2. Test with a small dataset first
3. Check the output CSV in Shopify's admin before bulk import
4. Back up your data before running conversions
5. Monitor the console for warnings and errors

## Limitations

- Maximum 3 options per product
- Images must be valid URLs
- CSV files must use specified encoding and delimiters

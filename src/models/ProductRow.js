const { createHandle } = require('../utils/productUtils');
const FieldMapper = require('../services/FieldMapper');

class ProductRow {
  static create(parentRow, variantRow, isFirstVariant, imagePosition, image) {
    if (!parentRow || !variantRow) {
      throw new Error('Parent row and variant row are required');
    }

    const handle = createHandle(parentRow['Name']);
    const mapper = new FieldMapper(require('../config/fieldMappings'));
    
    const mappedFields = mapper.mapFields(variantRow, {
      isFirstVariant,
      imagePosition,
      currentImage: image,
      parentRow
    });

    return {
      Handle: handle,
      ...mappedFields
    };
  }

  static createImageRow(handle, image, imagePosition) {
    if (!handle || !image) {
      throw new Error('Handle and image are required for image row');
    }

    const mapper = new FieldMapper(require('../config/fieldMappings'));
    const mappedFields = mapper.mapFields({}, {
      imagePosition,
      currentImage: image,
      isImageRow: true
    });

    return {
      Handle: handle,
      ...mappedFields
    };
  }
}

module.exports = ProductRow;
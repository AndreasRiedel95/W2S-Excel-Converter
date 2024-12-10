class FieldMapper {
  constructor(mappings) {
    this.mappings = mappings;
  }

  mapFields(sourceRow, context = {}) {
    const result = {};

    // Apply parent-only fields if this is the first variant or a single product
    if (context.isFirstVariant) {
      Object.entries(this.mappings.parentOnly).forEach(
        ([targetKey, config]) => {
          if (typeof config === 'string') {
            // Static value
            result[targetKey] = config;
          } else if (typeof config === 'object') {
            // Transform mapping
            const sourceValue = config.sourceField
              ? sourceRow[config.sourceField]
              : null;
            result[targetKey] =
              sourceValue && config.transform
                ? config.transform(sourceValue)
                : config.value || '';
          }
        }
      );
    } else {
      // Add empty values for parent-only fields on non-first variants
      Object.keys(this.mappings.parentOnly).forEach((key) => {
        result[key] = '';
      });
    }

    // Apply static mappings
    Object.entries(this.mappings.static).forEach(([key, value]) => {
      result[key] = value;
    });

    // Apply direct mappings
    Object.entries(this.mappings.direct).forEach(([sourceKey, targetKey]) => {
      if (sourceRow[sourceKey] !== undefined) {
        result[targetKey] = sourceRow[sourceKey];
      }
    });

    // Apply transformations
    Object.entries(this.mappings.transforms).forEach(([targetKey, config]) => {
      if (sourceRow[config.sourceField] !== undefined) {
        result[targetKey] = config.transform(sourceRow[config.sourceField]);
      }
    });

    // Apply special handlers
    if (this.mappings.specialHandlers) {
      // Handle options
      if (this.mappings.specialHandlers.options) {
        const options =
          this.mappings.specialHandlers.options.process(sourceRow);
        result['Option1 Name'] = context.isFirstVariant
          ? options.option1.name
          : '';
        result['Option1 Value'] = options.option1.value;
        result['Option2 Name'] = context.isFirstVariant
          ? options.option2.name
          : '';
        result['Option2 Value'] = options.option2.value;
        result['Option3 Name'] = context.isFirstVariant
          ? options.option3.name
          : '';
        result['Option3 Value'] = options.option3.value;
      }

      // Handle images
      if (this.mappings.specialHandlers.images) {
        const images = this.mappings.specialHandlers.images.process(
          sourceRow,
          context
        );
        result['Image Src'] = images.imageSrc;
        result['Variant Image'] = images.variantImage;
        result['Image Position'] = images.imagePosition;
      }
    }

    return result;
  }
}

module.exports = FieldMapper;

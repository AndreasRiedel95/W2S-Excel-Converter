const parsePrice = (priceString) => {
  if (!priceString) return '';
  return priceString.replace(',', '.').trim();
};

const parseInventoryQuantity = (quantity) => {
  const parsed = parseInt(quantity, 10);
  return isNaN(parsed) ? 0 : parsed;
};

const parseImages = (imagesString) => {
  if (!imagesString) return [];
  const matches = imagesString.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
  if (!matches) return [];
  
  return matches
    .map(img => img.replace(/^"|"$/g, '').trim())
    .filter(Boolean);
};

const createHandle = (name) => {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const getValidOptionName = (name) => {
  const validNames = ['Größe', 'Farbe'];
  return validNames.includes(name) ? name : '';
};

const cleanTitle = (title) => {
  if (!title) return '';
  // Remove size information in parentheses or after hyphen
  return title
    .replace(/\s*-\s*[A-Za-zÄÖÜäöüß\s\d]+$/, '') // Remove everything after hyphen
    .replace(/\s*\([A-Za-zÄÖÜäöüß\s\d]+\)/, '') // Remove parentheses and content
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

module.exports = {
  parsePrice,
  parseInventoryQuantity,
  parseImages,
  createHandle,
  getValidOptionName,
  cleanTitle
};
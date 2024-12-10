function convertToHTML(text) {
  if (!text) return '';
  
  // Remove \n and replace with proper HTML line breaks
  const cleanText = text
    .replace(/\\n/g, '')  // Remove escaped newlines
    .replace(/\n/g, '')   // Remove regular newlines
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular space
    .trim();
    
  return `<p>${cleanText}</p>`;
}

module.exports = {
  convertToHTML
};
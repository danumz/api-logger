const mammoth = require("mammoth");

/**
 * Extract questions from a .docx file.
 * @param {Buffer} docxBuffer - The .docx file as a buffer.
 * @returns {Array} - An array of extracted questions.
 */
async function extractQuestions(docxBuffer) {
    const { value: text } = await mammoth.extractRawText({ buffer: docxBuffer });
    // Implement logic to identify and extract questions
    return text.split('\n').filter(line => line.endsWith('?'));
}

/**
 * Extract images from a .docx file.
 * @param {Buffer} docxBuffer - The .docx file as a buffer.
 * @returns {Array} - An array of image data.
 */
async function extractImages(docxBuffer) {
    const { value: images } = await mammoth.convertToHtml({ buffer: docxBuffer });
    // Implement logic to extract images from HTML
    return images.match(/<img[^>]+src="([^"]+)"/g).map(img => img.src);
}

/**
 * Extract tables from a .docx file.
 * @param {Buffer} docxBuffer - The .docx file as a buffer.
 * @returns {Array} - An array of extracted tables.
 */
async function extractTables(docxBuffer) {
    const { value: html } = await mammoth.convertToHtml({ buffer: docxBuffer });
    // Implement logic to extract tables from HTML
    const tables = [];
    const tableRegex = /<table[^>]*>(.*?)<\/table>/g;
    let match;
    while (match = tableRegex.exec(html)) {
        tables.push(match[1]);
    }
    return tables;
}

/**
 * Extract equations from a .docx file.
 * @param {Buffer} docxBuffer - The .docx file as a buffer.
 * @returns {Array} - An array of extracted equations.
 */
async function extractEquations(docxBuffer) {
    const { value: text } = await mammoth.extractRawText({ buffer: docxBuffer });
    // Implement logic to identify and extract equations
    return text.match(/\$.*?\$/g) || []; // Example regex for LaTeX equations
}

module.exports = {
    extractQuestions,
    extractImages,
    extractTables,
    extractEquations,
};

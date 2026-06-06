const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Parses binary buffer to text based on MIME type
 * @param {Buffer} buffer 
 * @param {string} mimeType 
 * @returns {Promise<string>}
 */
const parseResume = async (buffer, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text || '';
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const data = await mammoth.extractRawText({ buffer });
      return data.value || '';
    } else {
      // Plain text fallback
      return buffer.toString('utf-8');
    }
  } catch (error) {
    console.error('Error parsing document file:', error);
    throw new Error(`Failed to parse resume file: ${error.message}`);
  }
};

module.exports = { parseResume };

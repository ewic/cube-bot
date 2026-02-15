const { google } = require('googleapis');
require('dotenv').config();

class SheetsService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Read data from a Google Sheet
   * @param {string} spreadsheetId - The ID from the sheet URL
   * @param {string} range - The range to read (e.g., 'Sheet1!A1:D10')
   * @returns {Promise<Array>} - 2D array of cell values
   */
  async readSheet(spreadsheetId, range) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      
      return response.data.values || [];
    } catch (error) {
      console.error('Error reading sheet:', error.message);
      throw error;
    }
  }

  /**
   * Read all data from a specific sheet tab
   * @param {string} spreadsheetId - The ID from the sheet URL
   * @param {string} sheetName - Name of the sheet tab (default: 'Sheet1')
   * @returns {Promise<Array>} - 2D array of all values
   */
  async readAllData(spreadsheetId, sheetName = 'Sheet1') {
    return await this.readSheet(spreadsheetId, `${sheetName}`);
  }

  /**
   * Get data as objects with headers as keys
   * @param {string} spreadsheetId - The ID from the sheet URL
   * @param {string} range - The range to read (e.g., 'Sheet1!A1:D10')
   * @returns {Promise<Array<Object>>} - Array of objects
   */
  async readSheetAsObjects(spreadsheetId, range) {
    const data = await this.readSheet(spreadsheetId, range);
    
    if (data.length === 0) return [];
    
    const headers = data[0];
    const rows = data.slice(1);
    
    return rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }
}

module.exports = new SheetsService();

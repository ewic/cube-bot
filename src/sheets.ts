import { google } from 'googleapis';
import * as dotenv from 'dotenv';
import { Card } from './interfaces';

dotenv.config();

interface SheetRow {
  [key: string]: string;
}

class SheetsService {
  private auth: any;
  private sheets: any;

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
   * @param spreadsheetId - The ID from the sheet URL
   * @param range - The range to read (e.g., 'Sheet1!A1:D10')
   * @returns 2D array of cell values
   */
  async readSheet(spreadsheetId: string, range: string): Promise<string[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return response.data.values || [];
    } catch (error) {
      console.error('Error reading sheet:', (error as Error).message);
      throw error;
    }
  }

  /**
   * Read all data from a specific sheet tab
   * @param spreadsheetId - The ID from the sheet URL
   * @param sheetName - Name of the sheet tab (default: 'Sheet1')
   * @returns 2D array of all values
   */
  async readAllData(spreadsheetId: string, sheetName: string = 'Sheet1'): Promise<string[][]> {
    return await this.readSheet(spreadsheetId, `${sheetName}`);
  }

  /**
   * Get data as objects with headers as keys
   * @param spreadsheetId - The ID from the sheet URL
   * @param range - The range to read (e.g., 'Sheet1!A1:D10')
   * @returns Array of objects
   */
  async readSheetAsObjects(spreadsheetId: string, range: string): Promise<SheetRow[]> {
    const data = await this.readSheet(spreadsheetId, range);

    if (data.length === 0) return [];

    const headers = data[0];
    const rows = data.slice(1);

    return rows.map(row => {
      const obj: SheetRow = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }

  /**
   * Read cards from Google Sheet with proper typing
   * @param spreadsheetId - The ID from the sheet URL
   * @param range - The range to read (e.g., 'List!A:F')
   * @returns Array of Card objects with MV as number
   */
  async readCards(spreadsheetId: string, range: string): Promise<Card[]> {
    const data = await this.readSheet(spreadsheetId, range);

    if (data.length === 0) return [];

    const rows = data.slice(1); // Skip header row

    return rows.map(row => ({
      MV: parseInt(row[0]) || 0,
      name: row[1] || '',
      type: row[2] || '',
      color: row[3] || '',
      set: row[4] || '',
      status: row[5] || '',
    }));
  }
}

export default new SheetsService();

import * as dotenv from 'dotenv';

dotenv.config();

const CUBECOBRA_BASE_URL = 'https://cubecobra.com';

class CobraService {
  private cubeId: string;

  constructor() {
    this.cubeId = process.env.CUBECOBRA_ID || '';
  }

  /**
   * Fetch the cube card list from CubeCobra
   * @param filter - Optional filter function to narrow down results
   * @returns Array of card name strings
   */
  async readCube(filter?: (cardName: string) => boolean): Promise<string[]> {
    if (!this.cubeId) {
      throw new Error('CUBECOBRA_ID not configured in environment variables.');
    }

    const url = `${CUBECOBRA_BASE_URL}/cube/api/cubelist/${this.cubeId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CubeCobra API returned ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    let cards = text
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (filter) {
      cards = cards.filter(filter);
    }

    return cards;
  }
}

export default new CobraService();

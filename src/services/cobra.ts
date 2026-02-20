import { Card } from '../interfaces';
import * as dotenv from 'dotenv';

dotenv.config();

const CUBECOBRA_BASE_URL = 'https://cubecobra.com';

class CobraService {
  private cubeId: string;

  constructor() {
    this.cubeId = process.env.CUBECOBRA_ID || '';
  }

  /**
   * Fetch the cube card list from CubeCobra as plain text names
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

  /**
   * Fetch full card data from CubeCobra's JSON API
   * @returns Array of Card objects with full details
   */
  async readCards(): Promise<Card[]> {
    if (!this.cubeId) {
      throw new Error('CUBECOBRA_ID not configured in environment variables.');
    }

    const url = `${CUBECOBRA_BASE_URL}/cube/api/cubeJSON/${this.cubeId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`CubeCobra API returned ${response.status}: ${response.statusText}`);
    }

    const data: any = await response.json();
    const cubeCards: any[] = data.cards?.mainboard || data.cards || [];

    return cubeCards
      .filter((card: any) => !card.markedForDelete)
      .map((card: any) => ({
        MV: card.cmc ?? 0,
        name: card.details?.name ?? 'Unknown',
        type: card.type_line ?? '',
        color: (card.colors ?? []).join(', ') || 'Colorless',
        set: card.details?.set_name ?? '',
        status: card.status ?? '',
      }));
  }
}

export default new CobraService();

import { HotelProvider, StaySearchRequest } from './interfaces';
import { StayOption } from '../types';
import { getDemoHotels } from '../data/demo/demoHotels';

export class MockHotelProvider implements HotelProvider {
  async searchHotels(request: StaySearchRequest): Promise<StayOption[]> {
    await new Promise(r => setTimeout(r, 1000));
    
    if (request.preference === 'NO_STAY') {
      return [];
    }

    const destId = request.destination.placeId;
    return getDemoHotels(destId);
  }
}

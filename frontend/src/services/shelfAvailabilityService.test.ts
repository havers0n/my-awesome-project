
import { shelfAvailabilityService } from './shelfAvailabilityService';
import { supabase } from './supabaseClient';

jest.mock('./supabaseClient', () => ({
  supabase: {
    rpc: jest.fn().mockReturnThis(),
    select: jest.fn(),
  },
}));

describe('shelfAvailabilityService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return mapped data on successful fetch', async () => {
    const mockData = [{ id: 1, name: 'Test Item' }];
    const mockCount = 1;

    (supabase.rpc as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
            data: mockData,
            error: null,
            count: mockCount,
        }),
    });

    const result = await shelfAvailabilityService.fetchList({});
    
    expect(result.items).toEqual(mockData);
    expect(result.total).toEqual(mockCount);
    expect(supabase.rpc).toHaveBeenCalledWith('api_get_shelf_availability', {
        p_search: undefined,
        p_status: undefined,
        p_sort: undefined,
        p_page: undefined,
        p_page_size: undefined,
    });
  });

  it('should return empty items and 0 total on fetch error', async () => {
    const mockError = new Error('Failed to fetch');
    (supabase.rpc as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
            count: null,
        }),
    });
    
    console.error = jest.fn();

    const result = await shelfAvailabilityService.fetchList({});

    expect(result.items).toEqual([]);
    expect(result.total).toEqual(0);
    expect(console.error).toHaveBeenCalledWith('Error fetching shelf availability:', mockError.message);
  });
});


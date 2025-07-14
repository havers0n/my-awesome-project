import { supabase } from './supabaseClient';

interface ShelfAvailabilityParams {
  search?: string;
  status?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export const shelfAvailabilityService = {
  async fetchList({ search, status, sort, page, pageSize }: ShelfAvailabilityParams) {
    try {
      const { data, error, count } = await supabase
        .rpc('api_get_shelf_availability', {
          p_search: search,
          p_status: status,
          p_sort: sort,
          p_page: page,
          p_page_size: pageSize,
        })
        .select('*', { count: 'exact' });

      if (error) {
        throw new Error(error.message);
      }

      return { items: data, total: count };
    } catch (error) {
      console.error('Error fetching shelf availability:', error);
      return { items: [], total: 0 };
    }
  },
};


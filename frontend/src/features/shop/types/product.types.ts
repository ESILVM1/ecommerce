export interface Product {
  id: number;
  product_display_name: string;
  gender: 'Men' | 'Women' | 'Boys' | 'Girls' | 'Unisex';
  master_category: string;
  sub_category: string;
  article_type: string;
  base_colour: string;
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter';
  year: number;
  usage: 'Casual' | 'Smart Casual' | 'Formal' | 'Party' | 'Sports' | 'Travel';
  price: string | number;
  description?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  gender?: string;
  master_category?: string;
  sub_category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  season?: string;
  usage?: string;
}

export interface ProductsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

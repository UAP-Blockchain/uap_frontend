export interface Product {
  id: string;
  name: string;
  categoryId: string;
  image: string;
  price: number;
  discountPercent?: number;
  description: string;
  rating: number;
  reviews: number;
  isBestSeller: boolean;
  isActive: boolean;
}

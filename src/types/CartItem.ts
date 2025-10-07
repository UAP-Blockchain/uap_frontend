export interface CartItem {
  id: string;
  name: string;
  categoryId: string;
  image: string;
  price: number;
  discountPercent?: number;
  description: string;
  quantity: number;
}

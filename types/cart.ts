export type CartItem = {
  id: string;
  sku: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  isOffer?: boolean;
};

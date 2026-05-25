export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  brand: string;
  stock: number;
  tags: string[];
  featured: boolean;
  offer: boolean;
  createdAt: string;
  updatedAt: string;
};

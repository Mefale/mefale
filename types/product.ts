export type Product = {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: string[];
  categoria: string;
  marca: string;
  stock: number;
  etiquetas: string[];
  destacado: boolean;
  createdAt: string;
  updatedAt: string;
};

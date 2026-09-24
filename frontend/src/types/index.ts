// DesignOPack Shared Frontend TypeScript Interfaces

export interface ProductImage {
  imageUrl: string;
  description?: string;
}

export interface Product {
  id?: string;
  name: string;
  categories: string[];
  description?: string;
  imageUrl: string;
  media?: ProductImage[];
  features?: string[];
  price?: number;
  inStock?: boolean;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuoteRequest {
  id?: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  product?: string;
  message: string;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
  createdAt?: Date;
}

export interface Banner {
  id?: string;
  title: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id?: string;
  name: string;
  description?: string;
  catalogueUrl?: string;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: string;
}

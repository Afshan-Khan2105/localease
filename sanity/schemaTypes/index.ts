import { type SchemaTypeDefinition } from 'sanity'

import { blockContentType } from './blockContentType'
import { categoryType } from './categoryType'
import { productType } from './productType'
import { orderType } from './orderType'
import { salesType } from './salesType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blockContentType, categoryType, productType, orderType, salesType],
}

// --- Types for use in your app ---

export interface ProductImage {
  asset: {
    url: string;
    _ref?: string;
    _type?: string;
  };
}

export interface Category {
  _id?: string;
  title: string;
  slug: string | { current: string };
}

export interface Rating {
  username: string;
  score: number;
  comment?: string;
  createdAt: string; // ISO date string
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  radius?: number; // in kilometers
}

export interface Product {
  _id?: string;
  name: string;
  slug: string | { current: string };
  image?: ProductImage;
  images?: ProductImage[];
  description?: any; // blockContent is rich text
  price: number;
  stock?: number;
  categories?: Category[];
  location?: Location;
  ratings?: Rating[];
}

import { logger } from './logger';
import { getAuthToken } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

import type { ProductImage, Product, QuoteRequest, Banner, Category } from '@/types';
export type { ProductImage, Product, QuoteRequest, Banner, Category };

// In-Memory Caches matching previous behavior
let productsCache: Product[] | null = null;
let categoriesCache: Category[] | null = null;
let bannersCache: Banner[] | null = null;

export const clearProductsCache = () => { productsCache = null; };
export const clearCategoriesCache = () => { categoriesCache = null; };
export const clearBannersCache = () => { bannersCache = null; };

// Helper to attach authorization header if user is logged in
const getHeaders = (includeAuth = false): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Helper utilities
export const getProductMedia = (product: Product): ProductImage[] => {
  if (product.media && product.media.length > 0) {
    return product.media.filter((media) => media.imageUrl);
  }

  if (product.imageUrl) {
    return [
      {
        imageUrl: product.imageUrl,
        description: product.description?.trim() || undefined,
      },
    ];
  }

  return [];
};

export const getPrimaryProductImage = (product: Product): string => {
  return getProductMedia(product)[0]?.imageUrl || product.imageUrl || '';
};

export const uploadPdfToStorage = async (
  file: File,
  _categoryName: string = 'catalogue'
): Promise<{ success: boolean; url?: string; error?: any }> => {
  try {
    logger.emoji.loading('Converting PDF file to Data URL...', file.name);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        logger.emoji.success('PDF converted successfully');
        resolve({ success: true, url: dataUrl });
      };
      reader.onerror = (error) => {
        logger.emoji.error('Error reading PDF:', error);
        resolve({ success: false, error });
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    logger.emoji.error('Error uploading PDF:', error);
    return { success: false, error };
  }
};

// ===== PRODUCTS API =====

export const getProducts = async (category?: string) => {
  try {
    if (productsCache !== null && !category) {
      logger.emoji.success(`Successfully loaded ${productsCache.length} products (from Cache)`);
      return { success: true, products: productsCache };
    }

    logger.emoji.search('Fetching products from Express REST API...');
    const url = category
      ? `${API_BASE_URL}/products?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/products`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch products');
    }

    const products: Product[] = (data.products || []).map((p: any) => ({
      ...p,
      id: p.id || p._id,
      createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
    }));

    if (!category) {
      productsCache = products;
    }

    logger.emoji.success(`Successfully loaded ${products.length} products`);
    return { success: true, products };
  } catch (error) {
    logger.emoji.error('Error getting products:', error);
    return { success: false, products: [], error };
  }
};

export const getProductById = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Product not found' };
    }

    const p = data.product;
    return {
      success: true,
      product: {
        ...p,
        id: p.id || p._id,
        createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
      } as Product,
    };
  } catch (error) {
    logger.error('Error getting product:', error);
    return { success: false, error };
  }
};

export const addProduct = async (product: Product) => {
  try {
    logger.emoji.loading('Adding new product via REST API:', product);
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(product),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to add product');
    }

    clearProductsCache();
    logger.emoji.success('Product added successfully with ID:', data.id);
    return { success: true, id: data.id };
  } catch (error) {
    logger.emoji.error('Error adding product:', error);
    return { success: false, error };
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  try {
    logger.emoji.loading('Updating product via REST API:', id);
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update product');
    }

    clearProductsCache();
    logger.emoji.success('Product updated successfully');
    return { success: true };
  } catch (error) {
    logger.emoji.error('Error updating product:', error);
    return { success: false, error };
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete product');
    }

    clearProductsCache();
    return { success: true };
  } catch (error) {
    logger.error('Error deleting product:', error);
    return { success: false, error };
  }
};

// ===== QUOTE REQUESTS API =====

export const addQuoteRequest = async (
  quote: Omit<QuoteRequest, 'id' | 'status' | 'createdAt'>
) => {
  try {
    logger.emoji.loading('Submitting quote request via REST API:', quote);
    const res = await fetch(`${API_BASE_URL}/quotes`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(quote),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to add quote request');
    }

    logger.emoji.success('Quote request added successfully with ID:', data.id);
    return { success: true, id: data.id };
  } catch (error) {
    logger.emoji.error('Error adding quote request:', error);
    return { success: false, error };
  }
};

export const getQuoteRequests = async () => {
  try {
    logger.emoji.loading('Fetching quote requests via REST API...');
    const res = await fetch(`${API_BASE_URL}/quotes`, {
      headers: getHeaders(true),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to get quote requests');
    }

    const quotes: QuoteRequest[] = (data.quotes || []).map((q: any) => ({
      ...q,
      id: q.id || q._id,
      createdAt: q.createdAt ? new Date(q.createdAt) : undefined,
    }));

    logger.emoji.success('Quote requests fetched successfully:', quotes.length);
    return { success: true, quotes };
  } catch (error) {
    logger.emoji.error('Error getting quote requests:', error);
    return { success: false, quotes: [], error };
  }
};

// Real-time polling listener for quote requests with automatic interval refresh
export const subscribeToQuoteRequests = (
  callback: (quotes: QuoteRequest[]) => void
) => {
  let isSubscribed = true;

  const fetchLatestQuotes = async () => {
    if (!isSubscribed) return;
    const res = await getQuoteRequests();
    if (res.success && isSubscribed) {
      callback(res.quotes);
    }
  };

  // Immediate initial load
  fetchLatestQuotes();

  // Periodic sync every 4 seconds
  const intervalId = setInterval(fetchLatestQuotes, 4000);

  return () => {
    isSubscribed = false;
    clearInterval(intervalId);
  };
};

export const updateQuoteStatus = async (
  id: string,
  status: QuoteRequest['status']
) => {
  try {
    logger.emoji.loading('Updating quote status via REST API:', id, 'to', status);
    const res = await fetch(`${API_BASE_URL}/quotes/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(true),
      body: JSON.stringify({ status }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update quote status');
    }

    logger.emoji.success('Quote status updated successfully');
    return { success: true };
  } catch (error) {
    logger.emoji.error('Error updating quote status:', error);
    return { success: false, error };
  }
};

export const deleteQuoteRequest = async (id: string) => {
  try {
    logger.emoji.loading('Deleting quote request via REST API:', id);
    const res = await fetch(`${API_BASE_URL}/quotes/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete quote request');
    }

    logger.emoji.success('Quote request deleted successfully');
    return { success: true };
  } catch (error) {
    logger.emoji.error('Error deleting quote request:', error);
    return { success: false, error };
  }
};

// ===== BANNERS API =====

export const getBanners = async () => {
  try {
    if (bannersCache !== null) {
      logger.log(`Successfully loaded ${bannersCache.length} banners (from Cache)`);
      return { success: true, banners: bannersCache };
    }

    logger.log('Fetching banners from Express REST API...');
    const res = await fetch(`${API_BASE_URL}/banners`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to get banners');
    }

    const banners: Banner[] = (data.banners || []).map((b: any) => ({
      ...b,
      id: b.id || b._id,
      createdAt: b.createdAt ? new Date(b.createdAt) : undefined,
      updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined,
    }));

    bannersCache = banners;
    logger.log(`Successfully loaded ${banners.length} banners`);
    return { success: true, banners };
  } catch (error) {
    logger.error('Error getting banners:', error);
    return { success: false, banners: [], error };
  }
};

export const getActiveBanners = async () => {
  try {
    logger.log('Fetching active banners via REST API...');
    const res = await fetch(`${API_BASE_URL}/banners/active`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to get active banners');
    }

    const banners: Banner[] = (data.banners || []).map((b: any) => ({
      ...b,
      id: b.id || b._id,
      createdAt: b.createdAt ? new Date(b.createdAt) : undefined,
      updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined,
    }));

    logger.log(`Found ${banners.length} active banners`);
    return { success: true, banners };
  } catch (error) {
    logger.error('Error getting active banners:', error);
    return { success: false, banners: [], error };
  }
};

export const addBanner = async (
  banner: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    logger.emoji.loading('Adding new banner via REST API:', banner);
    const res = await fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(banner),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to add banner');
    }

    clearBannersCache();
    logger.emoji.success('Banner added successfully with ID:', data.id);
    return { success: true, id: data.id };
  } catch (error) {
    logger.emoji.error('Error adding banner:', error);
    return { success: false, error };
  }
};

export const updateBanner = async (id: string, updates: Partial<Banner>) => {
  try {
    const res = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update banner');
    }

    clearBannersCache();
    return { success: true };
  } catch (error) {
    logger.error('Error updating banner:', error);
    return { success: false, error };
  }
};

export const deleteBanner = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete banner');
    }

    clearBannersCache();
    return { success: true };
  } catch (error) {
    logger.error('Error deleting banner:', error);
    return { success: false, error };
  }
};

export const initializeDefaultBanners = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/banners/initialize`, {
      method: 'POST',
      headers: getHeaders(false),
    });
    const data = await res.json();
    clearBannersCache();
    return data;
  } catch (error) {
    logger.error('Error initializing default banners:', error);
    return { success: false, error };
  }
};

// ===== CATEGORIES API =====

export const getCategories = async () => {
  try {
    if (categoriesCache !== null) {
      logger.log(`Successfully loaded ${categoriesCache.length} categories (from Cache)`);
      return { success: true, categories: categoriesCache };
    }

    logger.log('Fetching categories from Express REST API...');
    const res = await fetch(`${API_BASE_URL}/categories`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to get categories');
    }

    const categories: Category[] = (data.categories || []).map((c: any) => ({
      ...c,
      id: c.id || c._id,
      createdAt: c.createdAt ? new Date(c.createdAt) : undefined,
      updatedAt: c.updatedAt ? new Date(c.updatedAt) : undefined,
    }));

    categoriesCache = categories;
    logger.log(`Successfully loaded ${categories.length} categories`);
    return { success: true, categories };
  } catch (error) {
    logger.error('Error getting categories:', error);
    return { success: false, categories: [], error };
  }
};

export const addCategory = async (
  category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
) => {
  try {
    logger.emoji.loading('Adding new category via REST API:', category);
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(category),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to add category');
    }

    clearCategoriesCache();
    logger.emoji.success('Category added successfully with ID:', data.id);
    return { success: true, id: data.id };
  } catch (error) {
    logger.emoji.error('Error adding category:', error);
    return { success: false, error };
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>) => {
  try {
    logger.emoji.loading('Updating category via REST API:', id, updates);
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update category');
    }

    clearCategoriesCache();
    logger.emoji.success('Category updated successfully');
    return { success: true };
  } catch (error) {
    logger.emoji.error('Error updating category:', error);
    return { success: false, error };
  }
};

export const deleteCategory = async (id: string) => {
  try {
    logger.emoji.loading('Deleting category via REST API:', id);
    const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete category');
    }

    clearCategoriesCache();
    logger.emoji.success('Category deleted successfully');
    return { success: true };
  } catch (error) {
    logger.emoji.error('Error deleting category:', error);
    return { success: false, error };
  }
};

export const initializeDefaultCategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/categories/initialize`, {
      method: 'POST',
      headers: getHeaders(false),
    });
    const data = await res.json();
    clearCategoriesCache();
    return data;
  } catch (error) {
    logger.error('Error initializing default categories:', error);
    return { success: false, error };
  }
};

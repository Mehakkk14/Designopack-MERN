import Product from '../models/Product.js';

// @desc    Fetch all products (with optional category filter)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category) {
      query.categories = category;
    }

    const products = await Product.find(query);

    // Exact sorting as existing frontend:
    // Sort products by first category name (alphabetically), then by createdAt (ascending)
    products.sort((a, b) => {
      const categoryA = (a.categories && a.categories.length > 0 ? a.categories[0] : '').toLowerCase();
      const categoryB = (b.categories && b.categories.length > 0 ? b.categories[0] : '').toLowerCase();

      if (categoryA < categoryB) return -1;
      if (categoryA > categoryB) return 1;

      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeA - timeB;
    });

    return res.json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      products: [],
      error: error.message || 'Error fetching products',
    });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      return res.json({
        success: true,
        product,
      });
    } else {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error getting product',
    });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      categories,
      description,
      imageUrl,
      media,
      features,
      price,
      inStock,
      displayOrder,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required',
      });
    }

    const product = await Product.create({
      name,
      categories: Array.isArray(categories) ? categories : [],
      description: description || '',
      imageUrl: imageUrl || '',
      media: Array.isArray(media) ? media : [],
      features: Array.isArray(features) ? features : [],
      price: price !== undefined && price !== null && price !== '' ? Number(price) : null,
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    });

    return res.status(201).json({
      success: true,
      id: product._id.toString(),
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error adding product',
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    const updates = req.body;

    // Sanitize numerical fields
    if (updates.price !== undefined) {
      updates.price = updates.price !== null && updates.price !== '' ? Number(updates.price) : null;
    }
    if (updates.displayOrder !== undefined) {
      updates.displayOrder = Number(updates.displayOrder);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error updating product',
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error deleting product',
    });
  }
};

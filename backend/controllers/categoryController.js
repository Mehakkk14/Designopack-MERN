import Category from '../models/Category.js';

const DEFAULT_CATEGORIES = [
  {
    name: 'IN-ROOM ACCESSORIES',
    description: 'Accessories for hotel rooms and guest areas',
    displayOrder: 1,
  },
  {
    name: 'DESK ACCESSORIES',
    description: 'Professional desk and office accessories',
    displayOrder: 2,
  },
  {
    name: 'NIGHTSTAND ACCESSORIES',
    description: 'Bedside and nightstand accessories',
    displayOrder: 3,
  },
  {
    name: 'MINI BAR TABLETOP ACCESSORIES',
    description: 'Mini bar and tabletop accessories',
    displayOrder: 4,
  },
  {
    name: 'RESTAURANT & BAR ACCESSORIES',
    description: 'Restaurant and bar service accessories',
    displayOrder: 5,
  },
  {
    name: 'BATHROOM ACCESSORIES',
    description: 'Luxury bathroom accessories and amenities',
    displayOrder: 6,
  },
  {
    name: 'GIFTING',
    description: 'Gift packaging and presentation solutions',
    displayOrder: 7,
  },
  {
    name: 'FOOD PACKAGING',
    description: 'Food and beverage packaging solutions',
    displayOrder: 8,
  },
];

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ displayOrder: 1 });
    return res.json({
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      categories: [],
      error: error.message || 'Error getting categories',
    });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, catalogueUrl, displayOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required',
      });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'A category with this name already exists',
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      catalogueUrl: catalogueUrl || '',
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 1,
    });

    return res.status(201).json({
      success: true,
      id: category._id.toString(),
      category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error creating category',
    });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    const updates = req.body;
    if (updates.displayOrder !== undefined) {
      updates.displayOrder = Number(updates.displayOrder);
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error updating category',
    });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error deleting category',
    });
  }
};

// @desc    Initialize default categories if none exist
// @route   POST /api/categories/initialize
// @access  Public / Setup
export const initializeDefaultCategories = async (req, res) => {
  try {
    const count = await Category.countDocuments();
    if (count > 0) {
      return res.json({
        success: true,
        message: 'Categories already exist, skipping initialization',
      });
    }

    await Category.insertMany(DEFAULT_CATEGORIES);

    const categories = await Category.find().sort({ displayOrder: 1 });
    return res.json({
      success: true,
      message: 'Default categories initialized successfully',
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error initializing default categories',
    });
  }
};

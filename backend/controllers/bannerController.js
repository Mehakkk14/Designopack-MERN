import Banner from '../models/Banner.js';

const DEFAULT_BANNERS = [
  {
    title: 'Premium Packaging Solutions',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',
    isActive: true,
    order: 1,
  },
  {
    title: 'Luxury Hotel Amenities',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80',
    isActive: true,
    order: 2,
  },
  {
    title: 'Custom Branding Solutions',
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1600&q=80',
    isActive: true,
    order: 3,
  },
  {
    title: 'End-to-End Service',
    imageUrl: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1600&q=80',
    isActive: true,
    order: 4,
  },
];

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    return res.json({
      success: true,
      banners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      banners: [],
      error: error.message || 'Error getting banners',
    });
  }
};

// @desc    Get active banners for homepage showcase
// @route   GET /api/banners/active
// @access  Public
export const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    return res.json({
      success: true,
      banners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      banners: [],
      error: error.message || 'Error getting active banners',
    });
  }
};

// @desc    Create a new banner
// @route   POST /api/banners
// @access  Private/Admin
export const createBanner = async (req, res) => {
  try {
    const { title, imageUrl, isActive, order } = req.body;

    if (!title || !imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both title and image URL',
      });
    }

    const currentCount = await Banner.countDocuments();
    if (currentCount >= 8) {
      return res.status(400).json({
        success: false,
        error: 'Maximum number of banners (8) reached. Please delete a banner before adding a new one.',
      });
    }

    let bannerOrder = order;
    if (!bannerOrder || bannerOrder < 1) {
      bannerOrder = currentCount + 1;
    }

    const banner = await Banner.create({
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      order: Number(bannerOrder),
    });

    return res.status(201).json({
      success: true,
      id: banner._id.toString(),
      banner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error adding banner',
    });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        error: 'Banner not found',
      });
    }

    const updates = req.body;
    if (updates.order !== undefined) {
      updates.order = Number(updates.order);
    }
    if (updates.isActive !== undefined) {
      updates.isActive = Boolean(updates.isActive);
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      banner: updatedBanner,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error updating banner',
    });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        error: 'Banner not found',
      });
    }

    await Banner.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error deleting banner',
    });
  }
};

// @desc    Initialize default banners
// @route   POST /api/banners/initialize
// @access  Public / Setup
export const initializeDefaultBanners = async (req, res) => {
  try {
    const count = await Banner.countDocuments();
    if (count > 0) {
      return res.json({
        success: true,
        message: 'Banners already exist, skipping initialization',
      });
    }

    await Banner.insertMany(DEFAULT_BANNERS);
    const banners = await Banner.find().sort({ order: 1 });

    return res.json({
      success: true,
      message: 'Default banners initialized successfully',
      banners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error initializing default banners',
    });
  }
};

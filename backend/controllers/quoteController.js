import Quote from '../models/Quote.js';

// @desc    Submit a new quote request
// @route   POST /api/quotes
// @access  Public
export const createQuote = async (req, res) => {
  try {
    const { name, email, phone, companyName, product, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and phone number',
      });
    }

    const quote = await Quote.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyName: companyName ? companyName.trim() : '',
      product: product ? product.trim() : '',
      message: message ? message.trim() : '',
      status: 'new',
    });

    return res.status(201).json({
      success: true,
      id: quote._id.toString(),
      quote,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error submitting quote request',
    });
  }
};

// @desc    Get all quote requests
// @route   GET /api/quotes
// @access  Private/Admin
export const getQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      quotes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      quotes: [],
      error: error.message || 'Error getting quote requests',
    });
  }
};

// @desc    Update quote request status
// @route   PATCH /api/quotes/:id/status
// @access  Private/Admin
export const updateQuoteStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['new', 'contacted', 'quoted', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value',
      });
    }

    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote request not found',
      });
    }

    quote.status = status;
    await quote.save();

    return res.json({
      success: true,
      quote,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error updating quote status',
    });
  }
};

// @desc    Delete quote request
// @route   DELETE /api/quotes/:id
// @access  Private/Admin
export const deleteQuote = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote request not found',
      });
    }

    await Quote.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: 'Quote request deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error deleting quote request',
    });
  }
};

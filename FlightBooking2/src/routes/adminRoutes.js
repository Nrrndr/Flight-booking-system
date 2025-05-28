const express = require('express');
const router = express.Router();
const authModule = require('../modules/adminModule');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/admin', isAuthenticated('admin'), authModule.getAdminPage);
router.post('/admin/addFlight', isAuthenticated('admin'), authModule.addFlight);
router.get(
  '/admin/checkRevenue',
  isAuthenticated('admin'),
  authModule.getRevenuePage
);
router.post(
  '/admin/checkRevenue',
  isAuthenticated('admin'),
  authModule.checkRevenue
);

module.exports = router;

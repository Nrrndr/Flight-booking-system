const express = require('express');
const router = express.Router();
const authModule = require('../modules/userModule');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/user', isAuthenticated('user'), authModule.getUserPage);
router.post('/user/searchFlight', isAuthenticated('user'), authModule.searchFlights);
router.post('/user/bookPage', isAuthenticated('user'), authModule.getBookPage);
router.post('/user/bookFlight', isAuthenticated('user'), authModule.bookFlight);
router.get('/user/geneTicketPage', isAuthenticated('user'), authModule.getTicketPage);
router.post('/user/generateTicket', isAuthenticated('user'), authModule.generateTicket);
router.get('/user/historyPage', isAuthenticated('user'), authModule.getHistory);

module.exports = router;

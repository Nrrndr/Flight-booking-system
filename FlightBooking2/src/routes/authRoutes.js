const express = require('express');
const router = express.Router();
const authModule = require('../modules/authModule');

router.get('/', (req, res) => res.render('index'));
router.post('/register', authModule.register);
router.post('/login', authModule.login);

module.exports = router;

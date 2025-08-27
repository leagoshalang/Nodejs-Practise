const {RegisterUser,UserLogin} = require('../models/user');
const express = require('express');
const { userDashboard } = require('../models/UserDashboard');

const router = express.Router();

router.post('/register', RegisterUser);
router.post('/login', UserLogin); 
router.get('/dashboard', userDashboard);



module.exports = router;
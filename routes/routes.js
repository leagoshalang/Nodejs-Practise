const {RegisterUser,UserLogin,forgotPassword} = require('../models/user');
const express = require('express');
const { AdminDashboard } = require('../models/AdminDashboard');
const { LodgeQuery } = require('../models/LodgeQuery');


const router = express.Router();

router.post('/register', RegisterUser);
router.post('/login', UserLogin); 
router.get('/dashboard', AdminDashboard);
router.post('/lodgequery', LodgeQuery);
router.post('/forgotpassword', forgotPassword);


module.exports = router;
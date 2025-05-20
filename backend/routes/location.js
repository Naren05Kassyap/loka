const express = require('express');
const router = express.Router();
const {
  updateLocation,
  getAllLocations,
  getNearbyUsers,
} = require('../controllers/locationController');

router.post('/update', updateLocation);
router.get('/all', getAllLocations);
router.get('/nearby', getNearbyUsers);

module.exports = router;

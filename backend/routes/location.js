const express = require('express');
const router = express.Router();
const {
  updateLocation,
  getAllLocations,
  getNearbyUsers,
  getUserById,
  updateUserTag, // ← NEW
} = require('../controllers/locationController');

router.post('/update', updateLocation);
router.get('/all', getAllLocations);
router.get('/nearby', getNearbyUsers);
router.get('/user/:id', getUserById);
router.post('/tag', updateUserTag);


module.exports = router;
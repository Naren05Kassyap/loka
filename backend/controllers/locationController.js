const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'locations.json');

// Helper to safely read data
function readLocationData() {
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error('Failed to read location data:', err);
    return [];
  }
}

// ✅ POST /location/update
exports.updateLocation = (req, res) => {
  if (Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Batch updates are not allowed. Send one user at a time.' });
  }

  const { userId, username, latitude, longitude } = req.body;

  if (!userId || !username || latitude == null || longitude == null) {
    return res.status(400).json({ error: 'Missing required fields (userId, username, latitude, longitude)' });
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const avatar = `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(username)}`;
  let existingData = readLocationData();

  const index = existingData.findIndex(entry => entry.userId === userId);

  const existingTag = index !== -1 ? existingData[index].tag : '';

  const updatedEntry = {
    userId,
    username,
    avatar,
    latitude,
    longitude,
    tag: existingTag,
    timestamp: new Date().toISOString(),
  };

  if (index !== -1) {
    existingData[index] = updatedEntry;
    console.log(`🔁 Updated user: ${userId}`);
  } else {
    existingData.push(updatedEntry);
    console.log(`➕ Added user: ${userId}`);
  }

  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

  res.status(200).json({ message: 'User location updated' });
};

// ✅ POST /location/tag
exports.updateUserTag = (req, res) => {
  const { userId, tag } = req.body;

  if (!userId || typeof tag !== 'string') {
    return res.status(400).json({ error: 'Missing userId or tag' });
  }

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'User data not found' });

  let users = readLocationData();
  const index = users.findIndex((u) => u.userId === userId);

  if (index === -1) return res.status(404).json({ error: 'User not found' });

  users[index].tag = tag;
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

  console.log(`🏷️ Updated tag for ${userId}: ${tag}`);
  res.status(200).json({ message: 'Tag updated successfully', tag });
};

// ✅ GET /location/all
exports.getAllLocations = (req, res) => {
  const data = readLocationData();
  res.json(data);
};

// ✅ GET /location/nearby?lat=..&lon=..&radius=..
exports.getNearbyUsers = (req, res) => {
  const { lat, lon, radius = 1000 } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Missing lat/lon query params' });
  }

  const centerLat = parseFloat(lat);
  const centerLon = parseFloat(lon);
  const maxDistance = parseFloat(radius);

  const toRadians = deg => deg * (Math.PI / 180);
  const toDegrees = rad => rad * (180 / Math.PI);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getBearing = (lat1, lon1, lat2, lon2) => {
    const dLon = toRadians(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
    const x =
      Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
      Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
    const brng = Math.atan2(y, x);
    return (toDegrees(brng) + 360) % 360;
  };

  const data = readLocationData();

  const results = data
    .filter(user => user.latitude != null && user.longitude != null)
    .filter(user => user.latitude !== centerLat || user.longitude !== centerLon) // exclude self
    .map(user => {
      const distance = getDistance(centerLat, centerLon, user.latitude, user.longitude);
      const angle = getBearing(centerLat, centerLon, user.latitude, user.longitude);
      return { ...user, distance: parseFloat(distance.toFixed(2)), angle: parseFloat(angle.toFixed(2)) };
    })
    .filter(user => user.distance <= maxDistance);

  res.json(results);
};

// ✅ GET /location/user/:id
exports.getUserById = (req, res) => {
  const { id } = req.params;
  const users = readLocationData();
  const user = users.find(u => u.userId === id);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
};

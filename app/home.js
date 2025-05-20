import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, ActivityIndicator, Alert, Text, Animated, Easing } from 'react-native';


import * as Location from 'expo-location';

const { width } = Dimensions.get('window');
const RADAR_RADIUS = width * 0.8;
const RADAR_CENTER = RADAR_RADIUS / 2;
const MAX_RADIUS_METERS = 50;
const AVATAR_SIZE = 40;

export default function HomeScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const placedAvatars = []; // Track avatar positions to avoid overlap

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required for radar.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const payload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        username: 'You',
        latitude,
        longitude,
      };

      await fetch('http://10.0.2.2:5000/location/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await fetch(`http://10.0.2.2:5000/location/nearby?lat=${latitude}&lon=${longitude}&radius=${MAX_RADIUS_METERS}`);
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    })();
  }, []);

  const renderDistanceRings = () => {
  const rings = [10, 20, 30, 40, 50]; // meters
  return rings.map(radius => {
    const pixelRadius = (radius / MAX_RADIUS_METERS) * (RADAR_RADIUS / 2);
    return (
      <View
        key={radius}
        style={{
          position: 'absolute',
          top: RADAR_CENTER - pixelRadius,
          left: RADAR_CENTER - pixelRadius,
          width: pixelRadius * 2,
          height: pixelRadius * 2,
          borderRadius: pixelRadius,
          borderWidth: 1,
          borderColor: '#444',
          opacity: 0.4,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {radius % 20 === 0 && (
          <View style={{ position: 'absolute', top: -10 }}>
            <Text style={{ color: '#888', fontSize: 10 }}>{radius}m</Text>
          </View>
        )}
      </View>
    );
  });
};


  const isOverlapping = (x, y, radius = AVATAR_SIZE) => {
    for (const placed of placedAvatars) {
      const dx = placed.x - x;
      const dy = placed.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) return true;
    }
    return false;
  };

  const getXYFromDistanceAngle = (distance, angle) => {
    const MIN_RADIUS_PX = 30;
    const rawPx = (distance / MAX_RADIUS_METERS) * (RADAR_RADIUS / 2);
    const distancePx = Math.max(rawPx, MIN_RADIUS_PX);

    let rad = angle * (Math.PI / 180);
    let attempts = 0;
    let x, y;

    // Try adjusting angle until no overlap or max attempts
    do {
      x = Math.cos(rad) * distancePx;
      y = Math.sin(rad) * distancePx;
      rad += 0.15;
      attempts++;
    } while (isOverlapping(RADAR_CENTER + x, RADAR_CENTER + y) && attempts < 10);

    placedAvatars.push({ x: RADAR_CENTER + x, y: RADAR_CENTER + y });

    return {
      left: RADAR_CENTER + x - AVATAR_SIZE / 2,
      top: RADAR_CENTER + y - AVATAR_SIZE / 2,
    };
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <View style={styles.radar}>
        {renderDistanceRings()}
        {/* Central Avatar (You) */}
        <Image
          source={{ uri: 'https://api.dicebear.com/7.x/adventurer/png?seed=You' }}
          style={[styles.avatar, {
            top: RADAR_CENTER - AVATAR_SIZE / 2,
            left: RADAR_CENTER - AVATAR_SIZE / 2,
          }]}
        />

        {/* Reset avatar tracker for each render */}
        {placedAvatars.splice(0, placedAvatars.length)}

        {/* Render Nearby Users */}
        {users.map(user => {
          const { top, left } = getXYFromDistanceAngle(user.distance, user.angle);
          return (
            <Image
              key={user.userId}
              source={{ uri: user.avatar }}
              style={[styles.avatar, { top, left }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radar: {
    width: RADAR_RADIUS,
    height: RADAR_RADIUS,
    borderRadius: RADAR_RADIUS / 2,
    borderWidth: 2,
    borderColor: '#1eff00',
    backgroundColor: '#101010',
    position: 'relative',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 1,
    borderColor: '#fff',
    position: 'absolute',
  },
});

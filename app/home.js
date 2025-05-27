import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator,
  Alert,
  Text,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import * as Location from 'expo-location';
import { useRouter, useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');
const RADAR_RADIUS = width * 0.8;
const RADAR_CENTER = RADAR_RADIUS / 2;
const MAX_RADIUS_METERS = 50;
const AVATAR_SIZE = 40;

export default function HomeScreen() {
  const [users, setUsers] = useState([]);
  const [selfTag, setSelfTag] = useState('');
  const [loading, setLoading] = useState(true);
  const placedAvatars = [];
  const router = useRouter();
  const pulseAnim = useState(new Animated.Value(0))[0];

  const sendLocationToBackend = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
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

      return { latitude, longitude };
    } catch (err) {
      console.warn('❌ Failed to update location:', err);
      return null;
    }
  };

  const fetchSelfTag = async () => {
    try {
      const res = await fetch(`http://10.0.2.2:5000/location/user/123e4567-e89b-12d3-a456-426614174000`);
      const user = await res.json();
      setSelfTag(user.tag || '');
    } catch (err) {
      console.warn('❌ Failed to fetch self tag:', err);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required for radar.');
        return;
      }

      const coords = await sendLocationToBackend();
      await fetchSelfTag();
      if (!coords) return;

      const res = await fetch(
        `http://10.0.2.2:5000/location/nearby?lat=${coords.latitude}&lon=${coords.longitude}&radius=${MAX_RADIUS_METERS}`
      );
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSelfTag();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      sendLocationToBackend();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, []);

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

    do {
      x = Math.cos(rad) * distancePx;
      y = Math.sin(rad) * distancePx;
      rad += 0.15;
      attempts++;
    } while (
      isOverlapping(RADAR_CENTER + x, RADAR_CENTER + y) &&
      attempts < 10
    );

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
        {/* Static concentric rings (extending outward) */}
        {Array.from({ length: 8 }).map((_, i) => {
          const ringRadius = ((i + 1) / 5) * RADAR_RADIUS;
          const ringOpacity = 1 - i * 0.12;
          return (
            <View
              key={`ring-${i}`}
              style={{
                position: 'absolute',
                top: RADAR_CENTER - ringRadius / 2,
                left: RADAR_CENTER - ringRadius / 2,
                width: ringRadius,
                height: ringRadius,
                borderRadius: ringRadius / 2,
                borderWidth: 1,
                borderColor: `rgba(0, 0, 0, ${ringOpacity})`,
                zIndex: 0,
              }}
            />
          );
        })}

        {/* Animated pulse ring */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [
                {
                  scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                },
              ],
              opacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.25, 0],
              }),
            },
          ]}
        />

        {/* Self avatar */}
        <Pressable
          onPress={() => router.push('/profile/123e4567-e89b-12d3-a456-426614174000')}
          style={{
            position: 'absolute',
            top: RADAR_CENTER - AVATAR_SIZE / 2,
            left: RADAR_CENTER - AVATAR_SIZE / 2,
            alignItems: 'center',
            width: AVATAR_SIZE,
          }}
        >
          <Image
            source={{ uri: 'https://api.dicebear.com/7.x/adventurer/png?seed=You' }}
            style={styles.avatar}
          />
        </Pressable>

        {/* Self tag */}
        {selfTag !== '' && (
          <Text
            numberOfLines={1}
            style={[
              styles.tagText,
              {
                position: 'absolute',
                top: RADAR_CENTER + AVATAR_SIZE / 2 + 2,
                left: RADAR_CENTER - 30,
                width: 60,
                textAlign: 'center',
              },
            ]}
          >
            {selfTag}
          </Text>
        )}

        {placedAvatars.splice(0, placedAvatars.length)}

        {/* Nearby users */}
        {users.map((user) => {
          const { top, left } = getXYFromDistanceAngle(user.distance, user.angle);
          return (
            <React.Fragment key={user.userId}>
              <Pressable
                onPress={() => router.push(`/profile/${user.userId}`)}
                style={{ position: 'absolute', top, left }}
              >
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              </Pressable>
              {user.tag && (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.tagText,
                    {
                      position: 'absolute',
                      top: top + AVATAR_SIZE + 2,
                      left: left + AVATAR_SIZE / 2 - 30,
                      width: 60,
                      textAlign: 'center',
                    },
                  ]}
                >
                  {user.tag}
                </Text>
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // white background
    justifyContent: 'center',
    alignItems: 'center',
  },
  radar: {
    width: RADAR_RADIUS,
    height: RADAR_RADIUS,
    borderRadius: RADAR_RADIUS / 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 1.5,
    borderColor: '#000',
    position: 'absolute',
  },
  tagText: {
    color: '#444',
    fontSize: 10,
  },
  pulseRing: {
    position: 'absolute',
    top: RADAR_CENTER - RADAR_RADIUS / 2,
    left: RADAR_CENTER - RADAR_RADIUS / 2,
    width: RADAR_RADIUS,
    height: RADAR_RADIUS,
    borderRadius: RADAR_RADIUS / 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    zIndex: 0,
  },
});

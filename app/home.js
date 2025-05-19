import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const RADAR_RADIUS = width * 0.8;
const USER_COUNT = 8; // Number of mock nearby users

export default function HomeScreen() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Randomly generate positions for nearby users
    const generatedUsers = Array.from({ length: USER_COUNT }, (_, i) => {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * (RADAR_RADIUS / 2 - 20);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      return { id: i, x, y };
    });
    setUsers(generatedUsers);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.radar}>
        {/* You at the center */}
        <View style={styles.selfDot} />

        {/* Nearby users */}
        {users.map((user) => (
          <View
            key={user.id}
            style={[
              styles.userDot,
              {
                top: RADAR_RADIUS / 2 + user.y - 5,
                left: RADAR_RADIUS / 2 + user.x - 5,
              },
            ]}
          />
        ))}
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
  selfDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1eff00',
    position: 'absolute',
    top: RADAR_RADIUS / 2 - 8,
    left: RADAR_RADIUS / 2 - 8,
    zIndex: 2,
  },
  userDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00aaff',
    position: 'absolute',
  },
});

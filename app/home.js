import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function HomeScreen() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Request location permission for Android
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
        .then((granted) => {
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            navigator.geolocation.getCurrentPosition(
              (position) => setLocation(position.coords),
              (error) => console.log(error),
              { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
          }
        });
    }
    // For iOS, location permission is handled automatically.
  }, []);

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Loading Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Home!</Text>
      <MapView
        style={styles.map}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

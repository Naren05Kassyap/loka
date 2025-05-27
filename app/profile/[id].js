import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isOwnProfile = id === '123e4567-e89b-12d3-a456-426614174000';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://10.0.2.2:5000/location/user/${id}`);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();
        setUser(data);
        setTagInput(data.tag || '');
      } catch (err) {
        console.error('Error fetching user:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSaveTag = async () => {
    if (!user) return;

    const payload = {
      userId: user.userId,
      tag: tagInput,
    };

    try {
      setIsSaving(true);
      const res = await fetch('http://10.0.2.2:5000/location/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      Alert.alert('✅ Tag updated');
      setIsEditing(false);

      // Refresh user to reflect saved tag
      const refresh = await fetch(`http://10.0.2.2:5000/location/user/${user.userId}`);
      const updated = await refresh.json();
      setUser(updated);
      setTagInput(updated.tag || '');
    } catch (err) {
      console.error('Failed to save tag:', err);
      Alert.alert('❌ Error updating tag');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  if (!user) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Profile</Text>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />
      <Text style={styles.username}>{user.username}</Text>

      {isOwnProfile ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[
              styles.input,
              isEditing ? styles.inputActive : styles.inputDisabled,
            ]}
            value={tagInput}
            onChangeText={setTagInput}
            placeholder="Enter your status or tag"
            placeholderTextColor="#777"
            editable={isEditing}
          />
          {isEditing ? (
            <Button
              title={isSaving ? 'Saving...' : 'Save'}
              onPress={handleSaveTag}
              disabled={isSaving}
            />
          ) : (
            <Button title="Edit Tag" onPress={() => setIsEditing(true)} />
          )}
        </View>
      ) : (
        user.tag && <Text style={styles.tag}>🎯 {user.tag}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#fff',
    marginBottom: 16,
  },
  username: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  tag: {
    color: '#bbb',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 6,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    marginVertical: 12,
    width: '100%',
  },
  inputDisabled: {
    opacity: 0.4,
  },
  inputActive: {
    opacity: 1,
  },
  editContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#222',
    borderRadius: 6,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ff5555',
    fontSize: 18,
    marginTop: 80,
  },
});

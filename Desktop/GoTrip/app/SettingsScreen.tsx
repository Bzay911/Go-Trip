import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, ActivityIndicator, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';

// Firebase instances
const auth = getAuth();
const firestore = getFirestore();
const storage = getStorage();

interface SettingsItemProps {
  label: string;
  onPress?: () => void;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ label, onPress, isSwitch, switchValue, onSwitchChange }) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Text style={styles.itemLabel}>{label}</Text>
      {isSwitch && (
        <Switch value={switchValue} onValueChange={onSwitchChange} />
      )}
      {!isSwitch && <Text style={styles.itemArrow}>{'>'}</Text>}
    </TouchableOpacity>
  );
};

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserName(userData?.name || user.displayName || 'User');
          setUserEmail(userData?.email || user.email || '');
          setProfileImageUrl(userData?.profileImageUrl || null);
        } else {
          setUserName(user.displayName || 'User');
          setUserEmail(user.email || '');
        }
      }
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to pick an image from the gallery
  const navigateToEdit = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const uri = result.assets[0].uri; // Ensure the correct uri is used
      uploadImage(uri);
    } else {
      console.log("No image selected or image picker canceled");
    }
  };

  // Function to upload the picked or taken image
  const uploadImage = async (uri: string) => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('Image file not found');
      }

      // Read the file as a blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          reject(new Error('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      // Create a reference to Firebase Storage
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(storageRef, blob);

      // Clean up the blob
      if ('close' in blob) {
        (blob as any).close();
      }

      // Get the download URL for the image
      const downloadURL = await getDownloadURL(storageRef);

      // Update the user's profile image URL in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        profileImageUrl: downloadURL,
      });

      setProfileImageUrl(downloadURL);
      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message);
      Alert.alert('Error', 'Failed to upload image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await auth.signOut();
              router.replace('/login'); // Navigate to Login screen using expo-router
            } catch (err: any) {
              console.error('Error logging out:', err);
              setError(err.message);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const navigateToEditProfile = () => {
    router.push('/edit-profile');
  };

  const navigateToYourPosts = () => {
    router.push('/your-posts');
  };

  const navigateToSavedPosts = () => {
    router.push('/your-posts');
  };

  const goBack = () => {
    router.push('/(tabs)/profile');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkModeContainer]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, isDarkMode && styles.darkModeText]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkModeText]}>Settings</Text>
      </View>

      <View style={styles.profile}>
        <TouchableOpacity onPress={navigateToEdit} style={styles.profileImageContainer}>
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
          ) : (
            <Text style={styles.profileIcon}>👤</Text>
          )}
          <View style={styles.editIconContainer}>
            <Text style={styles.editIcon}>✏️</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, isDarkMode && styles.darkModeText]}>
            {userName}
          </Text>
          <Text style={[styles.profileEmail, isDarkMode && styles.darkModeText]}>
            {userEmail}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkModeText]}>Profile</Text>
        <SettingsItem label="Edit Profile" onPress={navigateToEditProfile} />
        <SettingsItem label="Your Posts" onPress={navigateToYourPosts} />
        <SettingsItem label="Saved Posts" onPress={navigateToSavedPosts} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkModeText]}>More Info & Support</Text>
        <SettingsItem label="Help and Support" onPress={() => {}} />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  darkModeContainer: {
    backgroundColor: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  darkModeText: {
    color: '#fff',
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileIcon: {
    fontSize: 50,
    color: '#A0A3A8',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 5,
  },
  editIcon: {
    fontSize: 10,
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 16,
    color: '#888',
  },
  themeIcon: {
    fontSize: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemLabel: {
    fontSize: 16,
  },
  itemArrow: {
    fontSize: 16,
    color: '#888',
  },
  logoutButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getAuth, updateEmail, updateProfile, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getFirestore, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore'; // For Firestore document handling
import { useRouter } from 'expo-router';

const EditProfileScreen: React.FC = () => {
  const auth = getAuth();
  const firestore = getFirestore();
  const router = useRouter();

  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>(''); // Password to reauthenticate user

  useEffect(() => {
    // Load user data when the component mounts
    const loadUserData = () => {
      const user = auth.currentUser;
      if (user) {
        setUserName(user.displayName || '');
        setUserEmail(user.email || '');
      }
    };

    loadUserData();
  }, [auth]);

  const handleSaveChanges = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Check if password is entered for reauthentication
      if (!password) {
        Alert.alert('Password Required', 'Please enter your password to confirm the changes.');
        return; // Prevent saving if password is not entered
      }

      // Reauthenticate user with password
      const credential = EmailAuthProvider.credential(user.email!, password);
      await reauthenticateWithCredential(user, credential);

      // Check if there are any changes in the username or email
      if (userName === user.displayName && userEmail === user.email) {
        Alert.alert('No changes', 'You have not made any changes to your profile.');
        return;
      }

      // If email is being updated, show an alert and prevent updating
      if (userEmail !== user.email) {
        Alert.alert('Email Change Not Allowed', 'Changing the email address is not allowed.');
        return; // Prevent further processing for email change
      }

      // Check if the email format is valid (skip if email is not being changed)
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(userEmail)) {
        throw new Error('Please enter a valid email address.');
      }

      // Check if the user document exists in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          name: userName,
          email: userEmail,
        });
      } else {
        await updateDoc(userDocRef, {
          name: userName,
          email: userEmail,
        });
      }

      // If username has changed, update the display name in Firebase Authentication
      if (user.displayName !== userName) {
        await updateProfile(user, { displayName: userName }); // Update profile using updateProfile function
      }

      // Success: Show an alert and navigate back to Settings Screen
      Alert.alert('Success', 'Your profile has been updated.', [
        {
          text: 'OK',
          onPress: () => router.push('/SettingsScreen'), // Navigate to Settings Screen after success
        },
      ]);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message); // Handle error and show to the user
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={userName}
        onChangeText={setUserName}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={userEmail}
        onChangeText={setUserEmail}
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password (to confirm changes)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.push('/SettingsScreen')}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingLeft: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#888',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default EditProfileScreen;

import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, Pressable } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'; // For navigation
import { StackNavigationProp } from '@react-navigation/stack';

// Initialize Firebase
import { firebaseConfig } from '@/config/Config'; 
import { initializeApp } from 'firebase/app';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Define Types
interface Post {
  id: string;
  imageUrl: string;
}

interface UserData {
  name?: string;
  email?: string;
  profileImageUrl?: string;
  favourites?: string[]; // Array of post IDs for favourites
}

type ProfileStackParamList = {
  SettingsScreen: undefined;
  // Add other screen names here as needed
};

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList, 'SettingsScreen'>;

// ProfileScreen Component
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>(); // Correct typing for navigation
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [favouritePosts, setFavouritePosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'favourites'>('posts'); // Track active tab for posts or favourites
  const [isModalVisible, setIsModalVisible] = useState(false); // For modal visibility
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Track the selected image or icon for full-screen view
  const [isIconSelected, setIsIconSelected] = useState(false); // Track if an icon was clicked

  // Fetch user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;

        if (user) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserData; // Explicitly cast to UserData
            setUserName(userData?.name || user.displayName || 'User');
            setUserEmail(userData?.email || user.email || '');
            setProfileImageUrl(userData?.profileImageUrl || null);

            // Fetch favourite posts (if any)
            const favourites = userData?.favourites || [];
            if (favourites.length > 0) {
              const favouritePostsQuery = query(collection(firestore, 'posts'), where('id', 'in', favourites));
              const favouritePostsSnapshot = await getDocs(favouritePostsQuery);
              const fetchedFavourites = favouritePostsSnapshot.docs.map((doc) => ({
                id: doc.id,
                imageUrl: doc.data().imageUrl,
              }));
              setFavouritePosts(fetchedFavourites);
            }
          } else {
            setUserName(user.displayName || 'User');
            setUserEmail(user.email || '');
          }

          // Fetch user's posts
          const postsQuery = query(collection(firestore, 'posts'), where('userId', '==', user.uid));
          const postsSnapshot = await getDocs(postsQuery);
          const fetchedPosts = postsSnapshot.docs.map((doc) => ({
            id: doc.id,
            imageUrl: doc.data().imageUrl,
          }));
          setPosts(fetchedPosts);
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Render individual post
  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity onPress={() => handleImagePress(item.imageUrl, false)}>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
    </TouchableOpacity>
  );

  // Handle image or icon click to show in full screen
  const handleImagePress = (imageUrl: string | null, isIcon: boolean) => {
    if (isIcon) {
      setIsIconSelected(true);
      setSelectedImage(null); // Don't need to pass image, since it's just an icon
    } else {
      setIsIconSelected(false);
      setSelectedImage(imageUrl);
    }
    setIsModalVisible(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedImage(null);
    setIsIconSelected(false);
  };

  // Navigate to Settings screen
  const navigateToSettings = () => {
    navigation.navigate('SettingsScreen');
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
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {profileImageUrl ? (
            <TouchableOpacity onPress={() => handleImagePress(profileImageUrl, false)}>
              <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => handleImagePress(null, true)}>
              <Text style={styles.defaultIcon}>👤</Text> {/* Display default icon if no image */}
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>
        <TouchableOpacity onPress={navigateToSettings} style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>☰</Text> {/* Settings icon */}
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={styles.tabButtonText}>Your Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'favourites' && styles.activeTab]}
          onPress={() => setActiveTab('favourites')}
        >
          <Text style={styles.tabButtonText}>Your Favourites</Text>
        </TouchableOpacity>
      </View>

      {/* Render posts or favourites based on activeTab */}
      <FlatList
        data={activeTab === 'posts' ? posts : favouritePosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={styles.postsList}
        ListEmptyComponent={() => (
          <Text style={styles.noPostsText}>
            {activeTab === 'posts' ? 'No posts yet.' : 'No favourites yet.'}
          </Text>
        )}
      />

      {/* Modal to show full-screen image or icon */}
      <Modal visible={isModalVisible} animationType="fade" transparent={true}>
        <Pressable style={styles.modalBackground} onPress={closeModal}>
          <View style={styles.modalContent}>
            {isIconSelected ? (
              <Text style={styles.iconInModal}>👤</Text> // Display icon in the modal if selected
            ) : (
              <Image source={{ uri: selectedImage || '' }} style={styles.fullScreenImage} />
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  profileInfo: {
    flexDirection: 'column',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 16,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 30,
    color: '#000',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  activeTab: {
    backgroundColor: '#FBFBFB',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#000',
  },
  postsList: {
    flex: 1,
  },
  postImage: {
    width: '48%',
    height: 150,
    marginBottom: 16,
    borderRadius: 8,
  },
  noPostsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  defaultIcon: {
    fontSize: 50,
    color: '#A0A3A8',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  fullScreenImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  iconInModal: {
    fontSize: 150,
    color: '#A0A3A8',
  },
});

export default ProfileScreen;

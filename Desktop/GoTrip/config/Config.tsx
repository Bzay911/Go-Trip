import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { collection, getDocs, getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
    apiKey: "AIzaSyANmmA1LfF4R_-YxyQQmm_Uqyj3XlLhjHc",
    authDomain: "go-trip-7400b.firebaseapp.com",
    projectId: "go-trip-7400b",
    storageBucket: "go-trip-7400b.firebasestorage.app",
    messagingSenderId: "426751250539",
    appId: "1:426751250539:web:903eca49462981fb2ea12e",
    measurementId: "G-WGGCDKYCXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and set persistence
const auth = getAuth(app);

// Setting persistence to AsyncStorage
setPersistence(auth, browserLocalPersistence).then(() => {
  // Persistence is now set
  console.log('Persistence set to local storage');
}).catch((error) => {
  console.error('Error setting persistence: ', error);
});

// Initialize Firestore
const db = getFirestore(app); // You need to initialize the Firestore database here

// Function to fetch posts from Firestore
export const fetchPosts = async () => {
  const postsCollection = collection(db, 'posts'); // Reference to 'posts' collection
  const snapshot = await getDocs(postsCollection); // Fetch documents
  const postsList = snapshot.docs.map((doc) => {
    // Ensure the document data matches the Post structure
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || '',
      body: data.body || '',
      createdAt: data.createdAt || '',
    };
  });
  return postsList;
};
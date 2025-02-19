import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { fetchPosts } from '@/config/Config'; // Import your fetchPosts function

interface Post {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

// Create the context
export const DbContext = createContext<any | null>(null);

// DbContextProvider component
interface DbContextProviderProps {
  children: ReactNode; // Type children as ReactNode
}

export const DbContextProvider: React.FC<DbContextProviderProps> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const getPosts = async () => {
      try {
        const data = await fetchPosts(); // Fetch posts from Firestore
        setPosts(data); // Set posts into state
      } catch (error: any) {
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false); // Finish loading state
      }
    };

    getPosts(); // Fetch posts on component mount
  }, []);

  return (
    <DbContext.Provider value={{ posts, loading, error }}>
      {children}
    </DbContext.Provider>
  );
};

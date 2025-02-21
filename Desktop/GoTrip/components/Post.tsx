import { useState, useContext, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image, Vibration } from "react-native";
import { Bookmark, Heart, MessageCircle } from "lucide-react-native";
import { DBContext } from "@/Contexts/dbContext";
import { collection, addDoc, doc, getDoc, deleteDoc, updateDoc, setDoc, onSnapshot } from "firebase/firestore";
import ImageCarousel from "./imageCarousel";
import { useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";

interface Post {
    postId: string;
    username: string;
    images: string[];
    likes: number;
    comments: string;
    hashtags: string[];
    caption: string;
    postedDate: string;
}
export default function Post({
    postId,
    username,
    images,
    likes,
    comments,
    hashtags,
    caption,
    postedDate,
}: Post) {

    const db = useContext(DBContext);
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(likes);
    const router = useRouter()

    const userEmail = "john@mail.com";
    const postRef = doc(db, "posts", postId)
    const likeRef = doc(db, `posts/${postId}/likes`, userEmail)

    useEffect(() => {
        const checkIfLiked = async () => {
            const likeRef = doc(db, `posts/${postId}/likes`, userEmail);
            const likeDoc = await getDoc(likeRef);

            // Update the liked state based on the document's existence
            if (likeDoc.exists()) {
                setLiked(true);
            } else {
                setLiked(false);
            }

            const unsubscribe = onSnapshot(postRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    setLikeCount(data.numberOfLikes || 0);
                }
            });
            return () => unsubscribe();
        };
        checkIfLiked();
    }, [db, postId, userEmail]);

    const toggleLike = async () => {
        try {
            const likeDoc = await getDoc(likeRef)
            const postDoc = await getDoc(postRef)

            if (!postDoc.exists()) {
                console.error("Post does not exist!");
                return;
            }

            let currentLikes = postDoc.data().numberOfLikes || 0

            if (likeDoc.exists()) {
                // User has already liked unlike the post
                setLiked(false);
                setLikeCount((prev) => Math.max(0, prev - 1));

                await deleteDoc(likeRef)
                await updateDoc(postRef, {
                    numberOfLikes: currentLikes - 1
                });
            } else {
                Vibration.vibrate(50);
                setLiked(true);
                setLikeCount((prev) => prev + 1);
                const Like = {
                    email: "john@mail.com",
                    createdAt: new Date(),
                };
                const path = `posts/${postId}/likes`;
                const docRef = await setDoc(likeRef, Like);
                await updateDoc(postRef, {
                    numberOfLikes: currentLikes + 1
                });
                alert("Post updated successfully !!!.");
            }
        } catch (e: any) {
            alert(`Error adding documennt: ${e.errorMessage}`);
        }
    };


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar} />
                    <Text style={styles.username}>{username}</Text>
                </View>
                <TouchableOpacity>
                    <Bookmark style={styles.bookmarkIcon} size={24} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Image Grid */}
            <View style={styles.imageGrid}>
                <ImageCarousel images={images} />
            </View>


            {/* Engagement */}
            <View style={styles.engagement}>
                <TouchableOpacity style={styles.engagementItem} onPress={toggleLike}>
                    <Heart style={styles.icon} size={24} color={liked ? "red" : "#000"} />
                    <Text style={styles.engagementText}>{likeCount}</Text>
                </TouchableOpacity>
                <View style={styles.engagementItem}>
                    <MessageCircle style={styles.icon} size={24} color="#000" onPress={
                        () => router.push({
                            pathname: "/addComment/[postId]",
                            params: { postId: postId },
                        })
                        } />
                    <Text style={styles.engagementText}>{comments}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        margin: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#000000"
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e1e1e1",
        marginRight: 8,
    },
    username: {
        fontSize: 16,
        fontWeight: "600",
    },
    bookmarkIcon: {
        opacity: 0.8,
    },
    imageGrid: {
        // flexDirection: "row",
        // height: 250,
        gap: 2,
        marginBottom: 12,
    },
    mainImage: {
        flex: 1,
        marginRight: 2,
    },
    leftImage: {
        flex: 1,
        borderRadius: 8,
    },
    rightImages: {
        flex: 1,
        gap: 2,
    },
    rightTopImage: {
        flex: 1,
        borderRadius: 8,
    },
    rightBottomContainer: {
        flex: 1,
        position: "relative",
    },
    rightBottomImage: {
        flex: 1,
        borderRadius: 8,
    },
    moreOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
    },
    moreText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    engagement: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 12,
    },
    engagementItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    icon: {
        opacity: 0.8,
    },
    engagementText: {
        fontSize: 14,
        color: "#666",
    },
});
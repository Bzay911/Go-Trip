import {
    View,
    Text,
    TextInput,
    Button,
    StyleSheet,
    Pressable,
    FlatList,
    SafeAreaView,
  } from "react-native";
  import { FontAwesome } from "@expo/vector-icons";
  import { useLocalSearchParams, useNavigation } from "expo-router";
  import { useContext, useState, useEffect } from "react";
  import { AuthContext } from "@/Contexts/AuthContext";
  import { collection, addDoc, onSnapshot, query } from "@firebase/firestore";
  import { DBContext } from "@/Contexts/dbContext";
  
  export default function CommentItem() {
    const auth = useContext(AuthContext);
    const db = useContext(DBContext);
  
    const params = useLocalSearchParams();
    const navigation = useNavigation()
    const [commentContent, setCommentContent] = useState("");
    const [comments, setComment] = useState([]);
    const [loaded, setLoaded] = useState(false);
    
    const { postId } = params;

    useEffect(() => {
      navigation.setOptions({headerShown: true, title: "Add Comment"
      })
    }, [navigation])
  
    useEffect(() => {
      if (!loaded) {
        fetchComment();
        setLoaded(true);
      }
    }, []);
  
    const fetchComment = () => {
      try {
        const path = `posts/${postId}/comments`;
        const q = query(collection(db, path));
        const unsub = onSnapshot(q, (querySnapshot) => {
          let comments: any = [];
          querySnapshot.forEach((doc) => {
            let comment = doc.data();
            comment.id = doc.id;
            comments.push(comment);
          });
          setComment(comments);
        });
      } catch (e: any) {
        alert("Comment could not be added " + e.message);
      }
    };
  
    const addComment = async () => {
      const Comment = {
        commenterId: "john@mail.com",
        content: commentContent,
        createdAt: new Date(),
      };
  
      try {
        const path = `posts/${postId}/comments`
        const docRef = await addDoc(collection(db, path), Comment)
        setCommentContent("")
        alert("Comment added successfully");
      } catch (e: any) {
        alert("Comment could not be added " + e.message);
      }
    };
  
    const ListItem = (props: any) => {
      return (
        <View style={styles.comment}>
          <FontAwesome
            style={styles.userPicture}
            name="user-circle"
            size={24}
            color={"blue"}
          />
          <Text style={styles.commentContent}> {props.commentContent}</Text>
        </View>
      );
    };
  
    const renderItem = ({ item }: any) => {
      return <ListItem commentContent={item.content} />;
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id}
        />
        <View style={styles.inputBox}>
          <TextInput
            placeholder="Type comment"
            style={styles.inputField}
            value={commentContent}
            onChangeText={(text) => {setCommentContent(text)}}
          />
          <Pressable
            style={styles.addCommentButton}
            onPress={() => {
              addComment();
            }}
          >
            <Text style={{ color: "#FF2E63" }}> Add </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      // padding: 10,
    },
    comment: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      height: 60,
      backgroundColor: "white",
    },
    userPicture: {
      flex: 0.4,
      marginLeft: 15
    },
    commentContent: {
      flex: 4,
      // backgroundColor: "red"
    },
    inputBox: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginHorizontal: 20,
      marginVertical: 10,
      backgroundColor: "white",
      borderRadius: 15,
    },
    inputField: {
      backgroundColor: "white",
      flex: 3,
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderRadius: 15,
    },
    addCommentButton: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
  });
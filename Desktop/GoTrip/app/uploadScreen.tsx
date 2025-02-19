
import { useContext, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Pressable, Alert, Image } from "react-native"
import * as ImagePicker from "expo-image-picker";
import { Image as ImageIcon } from "lucide-react-native"
import SearchChip from "@/components/SearchChip"
import Modal from "@/components/Modal"
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { FsContext } from "@/Contexts/FsContext";

import { ref, uploadBytes, getDownloadURL } from "@firebase/storage"
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { AuthContext } from "@/Contexts/AuthContext";
import { DBContext } from "@/Contexts/dbContext";

const categories = ["Lookout", "Sunrise", "Sunset", "Park"]

export default function uploadScreen() {

  const [downloadURL, setDownloadURL] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImage, setImageSelected] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<string[]>([])

  // Get a reference to Firebase Storage
  const storage = useContext(FsContext);
  const auth = useContext(AuthContext);
  const db = useContext(DBContext);


  const handleAddPost = async () => {

    let imageUrl = "";
    if (selectedImage) {
      // Await the upload so that imageUrl is available
      imageUrl = await uploadImageToStorage(selectedImage);
    }

    const Post = {
      description: description,
      imageURL: imageUrl,  //TODO: Make it array later
      category: selectedCategory,
      email: "john@mail.com",
      numberOfLikes: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    try {
      const path = `posts`;
      const docRef = await addDoc(collection(db, path), Post);
      alert("Post uploaded successfully !!!.");
    } catch (e: any) {
      alert(`Error adding documennt: ${e.errorMessage}`);
    }
  }

  //  Access camera using expo image picker
  const pickcameraImageAsync = async () => {
    let result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      //  save image
      setModalIsOpen(false);
      setImageSelected(result.assets[0].uri);
    } else {
      alert("you did not select any image.");
    }
  };


  //  Access gallery using expo image picker
  const pickGallerymageAsync = async () => {
    console.log("i am here");
    let result = await ImagePicker.launchImageLibraryAsync({
      cameraType: ImagePicker.CameraType.front,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      //  save image
      setImageSelected(result.assets[0].uri);
      setModalIsOpen(false);
    } else {
      alert("you did not select any image.");
    }
  };

  //  Upload the image to the firebase storage
  const uploadImageToStorage = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      // Create a unique file name using a timestamp and original file name
      const filename = uri.substring(uri.lastIndexOf("/") + 1);
      const uniqueName = `${Date.now()}_${filename}`;
      const storageRef = ref(storage, `images/${uniqueName}`);

      const snapshot = await uploadBytes(storageRef, blob)
      console.log("Uploaded a blob or file!", snapshot);

      // Retrieve the download URL
      const url = await getDownloadURL(storageRef);
      console.log("Download URL:", url);
      setDownloadURL(url);
      return url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <SearchChip
                key={category}
                label={category}
                onPress={() => {
                  setSelectedCategory(selectedCategory === category ? '' : category);
                }}
                isSelected={selectedCategory == category}
              />
            ))}
          </ScrollView>
        </View>

        {/* Image Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pick Images</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={() => {
            console.log("Opening modal");
            setModalIsOpen(true)
          }}>
            {selectedImage === "" ? (
              <ImageIcon size={48} color="#666" />
            ) : (
              <Image
                source={{ uri: selectedImage }}
                style={{ width: "100%", height: "100%", borderRadius: 8 }} // adjust styles as needed
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter post description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Modal to display media options */}
        <Modal isOpen={modalIsOpen}>
          <View style={styles.modal}>
            <Text style={{ fontWeight: "500", marginBottom: 10 }}>
              Choose media options{" "}
            </Text>

            <TouchableOpacity
              style={styles.mediaButton}
              onPress={pickcameraImageAsync}
            >
              <FontAwesome name="camera" size={24} color="white" />
              <Text style={{ color: "white" }}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mediaButton}
              onPress={pickGallerymageAsync}
            >
              <MaterialIcons name="perm-media" size={24} color="white" />
              <Text style={{ color: "white" }}>Photos</Text>
            </TouchableOpacity>

            <Pressable
              style={styles.closeModal}
              onPress={() => setModalIsOpen(false)}
            >
              <Text style={{ color: "white", textAlign: "center" }}>Cancel</Text>
            </Pressable>
          </View>
        </Modal>
      </ScrollView>

      {/* Add Post Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => { handleAddPost() }}>
        <Text style={styles.addButtonText}>Add Post</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  imagePicker: {
    width: "100%",
    height: 200,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#007AFF",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modal: {
    backgroundColor: "#EAEAEA",
    padding: 20,
    borderRadius: 10,
  },
  mediaButton: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#FF2E63",
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
  },
  closeModal: {
    gap: 10,
    alignItems: "center",
    backgroundColor: "black",
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
  },
})


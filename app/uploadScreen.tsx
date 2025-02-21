
import { useContext, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Pressable, Alert, Image, ActivityIndicator } from "react-native"
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
import ImageCarousel from "@/components/imageCarousel";

const categories = ["Lookout", "Sunrise", "Sunset", "Park"]

export default function uploadScreen() {

  const [downloadURL, setDownloadURL] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>()
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Get a reference to Firebase Storage
  const storage = useContext(FsContext);
  const auth = useContext(AuthContext);
  const db = useContext(DBContext);


  const handleAddPost = async () => {

    if (!selectedImages.length) {
      alert("Please select at least one image.");
      return;
    }

     // Check if description is empty (using trim() to avoid spaces)
  if (!description.trim()) {
    alert("Please enter a description for your post.");
    return;
  }

  // Check if a category has been selected
  if (!selectedCategory || selectedCategory.trim() === "") {
    alert("Please choose a category.");
    return;
  }

  setIsUploading(true)
    // Upload each image and get its download URL
    const imageUrls = await Promise.all(
      selectedImages.map(async (image) => await uploadImageToStorage(image))
    );

    const Post = {
      userName: "Steve John",
      description: description,
      imageURL: imageUrls,  //TODO: Make it array later
      category: selectedCategory,
      email: "john@mail.com",
      numberOfLikes: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    try {
      const path = "posts";
      const docRef = await addDoc(collection(db, path), Post);
      setSelectedImages([]);
      setDescription("");
      setSelectedCategory("");
      setDownloadURL("");
      alert("Post uploaded successfully !!!.");
    } catch (e: any) {
      alert(`Error adding documennt: ${e.errorMessage}`);
    }finally {
      setIsUploading(false);
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
      setSelectedImages((prevImages) => [...prevImages, ...result.assets.map(asset => asset.uri)]);
    } else {
      alert("you did not select any image.");
    }
  };


  //  Access gallery using expo image picker
  const pickGallerymageAsync = async () => {
    console.log("i am here");
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      //  save image
      setSelectedImages((prevImages) => [...prevImages, ...result.assets.map(asset => asset.uri)]);

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
          <View style={[styles.imagePicker, selectedImages.length > 0 && { height: 300 }]}>
            {selectedImages.length > 0 ? (
              <View style={styles.carouselContainer}>
                <ImageCarousel images={selectedImages} />
                <TouchableOpacity
                  style={styles.addMoreButton}
                  onPress={() => setModalIsOpen(true)}
                >
                  <Text style={styles.addMoreButtonText}>+ Add More</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ImageIcon size={48} color="#666" onPress={() => {
                console.log("Opening modal");
                setModalIsOpen(true)
              }} />
            )}
          </View>
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
      {isUploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.addButtonText}>Add Post</Text>
        )}
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
  carouselContainer: {
    height: 200,
    width: '100%',
    alignItems: "center"
  },
  addMoreButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  addMoreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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


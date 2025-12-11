import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView
} from 'react-native';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

// 1. Import Pure React Native Image Picker
import { launchImageLibrary } from 'react-native-image-picker';

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- COMMENT MODAL STATES ---
  const [modalVisible, setModalVisible] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  // 1. Listen for Posts
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen for Comments (When Modal is Open)
  useEffect(() => {
    if (!activePostId || !modalVisible) return;

    setLoadingComments(true);
    // Reference to the subcollection: posts/{postId}/comments
    const commentsRef = collection(db, "posts", activePostId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
      setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [activePostId, modalVisible]);

  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 500,
      maxWidth: 500,
      quality: 0.5,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        const source = `data:${asset.type};base64,${asset.base64}`;
        setSelectedImage(source);
      }
    });
  };

  const handlePost = async () => {
    if (!newPostText.trim() && !selectedImage) return;

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    try {
      await addDoc(collection(db, "posts"), {
        pokemonName: "Trainer Update",
        pokemonId: null,
        pokemonImage: null,
        trainerEmail: user.email,
        content: newPostText,
        customImage: selectedImage,
        createdAt: serverTimestamp(),
        likedBy: [] // Array of User IDs who liked the post
      });
      setNewPostText('');
      setSelectedImage(null);
    } catch (error) {
      console.error("Error posting:", error);
      Alert.alert("Error", "Could not send transmission.");
    }
  };

  // --- LIKE LOGIC ---
  const handleLike = async (post) => {
    const user = auth.currentUser;
    if (!user) return;

    const postRef = doc(db, "posts", post.id);
    const isLiked = post.likedBy && post.likedBy.includes(user.uid);

    try {
      await updateDoc(postRef, {
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
      });
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  // --- COMMENT LOGIC ---
  const openCommentModal = (postId) => {
    setActivePostId(postId);
    setModalVisible(true);
  };

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      const commentsRef = collection(db, "posts", activePostId, "comments");
      await addDoc(commentsRef, {
        text: newComment,
        trainerEmail: user.email,
        createdAt: serverTimestamp(),
      });
      setNewComment('');
    } catch (error) {
      console.error("Comment error:", error);
      Alert.alert("Error", "Could not post comment.");
    }
  };

  const renderPost = ({ item }) => {
    const isDiscovery = !!item.pokemonId;
    const trainerName = item.trainerEmail ? item.trainerEmail.split('@')[0].toUpperCase() : 'UNKNOWN';
    const timeString = item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'NOW';

    // Check if current user liked this post
    const user = auth.currentUser;
    const isLiked = item.likedBy && user && item.likedBy.includes(user.uid);
    const likeCount = item.likedBy ? item.likedBy.length : 0;

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
               <Text style={{fontSize: 16}}>👤</Text>
            </View>
            <Text style={styles.trainerName}>{trainerName}</Text>
          </View>
          <Text style={styles.timestamp}>{timeString}</Text>
        </View>

        <View style={styles.divider} />

        <View>
          {item.content ? (
            <Text style={styles.postContent}>{item.content}</Text>
          ) : null}

          {item.customImage && (
             <Image source={{ uri: item.customImage }} style={styles.customPostImage} resizeMode="cover" />
          )}

          {isDiscovery && (
            <View style={styles.discoveryRow}>
              <View style={styles.imageFrame}>
                 <Image source={{ uri: item.pokemonImage }} style={styles.postImage} resizeMode="contain" />
              </View>
              <View style={styles.discoveryTextContainer}>
                <Text style={styles.actionText}>CAPTURED DATA:</Text>
                <Text style={styles.pokemonName}>{item.pokemonName.toUpperCase()}</Text>
                <Text style={styles.idText}>ID: #{String(item.pokemonId).padStart(3, '0')}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.interactionRow}>
           <TouchableOpacity style={styles.iconBtnRow} onPress={() => handleLike(item)}>
             <Text style={styles.interactionIcon}>{isLiked ? "❤️" : "🤍"}</Text>
             <Text style={styles.interactionText}>{likeCount}</Text>
           </TouchableOpacity>

           <TouchableOpacity style={styles.iconBtnRow} onPress={() => openCommentModal(item.id)}>
             <Text style={styles.interactionIcon}>💬</Text>
             <Text style={styles.interactionText}>REPLY</Text>
           </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <Text style={styles.commentUser}>
        {item.trainerEmail ? item.trainerEmail.split('@')[0].toUpperCase() : 'UNKNOWN'}:
      </Text>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC0A2D" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.blueLightContainer}>
          <View style={styles.blueLight} />
          <View style={styles.blueLightReflection} />
        </View>
        <View style={styles.statusLights}>
          <View style={[styles.smallLight, { backgroundColor: '#FF0000' }]} />
          <View style={[styles.smallLight, { backgroundColor: '#F1C40F' }]} />
          <View style={[styles.smallLight, { backgroundColor: '#2ECC71' }]} />
        </View>
      </View>

      <Text style={styles.headerTitle}>GLOBAL FEED</Text>

      <View style={styles.screenBezel}>
        <View style={styles.innerScreen}>

          <View style={styles.inputAreaWrapper}>
            {selectedImage && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeImageBtn}>
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.prompt}>></Text>
              <TextInput
                style={styles.input}
                placeholder="BROADCAST MESSAGE..."
                placeholderTextColor="#555"
                value={newPostText}
                onChangeText={setNewPostText}
              />
              <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
                 <Text style={{fontSize: 20}}>📷</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendBtn} onPress={handlePost}>
                <Text style={styles.sendBtnText}>SEND</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
             <ActivityIndicator size="large" color="#333" style={{marginTop: 50}} />
          ) : (
            <FlatList
              data={posts}
              keyExtractor={item => item.id}
              renderItem={renderPost}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      {/* --- COMMENTS MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>COMMS LOG</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {loadingComments ? (
                <ActivityIndicator color="#333" />
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={item => item.id}
                  renderItem={renderCommentItem}
                  ListEmptyComponent={<Text style={styles.emptyComments}>No transmission data found.</Text>}
                  style={{marginBottom: 10}}
                />
              )}

              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Enter reply..."
                  placeholderTextColor="#666"
                  value={newComment}
                  onChangeText={setNewComment}
                />
                <TouchableOpacity style={styles.commentSendBtn} onPress={handleSendComment}>
                  <Text style={styles.commentSendText}>➤</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DC0A2D',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  blueLightContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    elevation: 5,
  },
  blueLight: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#28AAFD',
    borderWidth: 2,
    borderColor: '#191970',
  },
  blueLightReflection: {
    position: 'absolute',
    top: 10,
    left: 12,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  statusLights: {
    flexDirection: 'row',
    marginLeft: 15,
    gap: 8,
  },
  smallLight: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#000',
    elevation: 2,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  screenBezel: {
    flex: 1,
    backgroundColor: '#DEDEDE',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 15,
    borderBottomRightRadius: 45,
    elevation: 5,
  },
  innerScreen: {
    flex: 1,
    backgroundColor: '#98CB98',
    borderWidth: 3,
    borderColor: '#555',
    borderRadius: 5,
    padding: 10,
  },
  inputAreaWrapper: { marginBottom: 10 },
  previewContainer: { marginBottom: 10, alignItems: 'center', position: 'relative', alignSelf: 'flex-start' },
  imagePreview: { width: 80, height: 80, borderRadius: 5, borderWidth: 2, borderColor: '#555' },
  removeImageBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  removeImageText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)', borderWidth: 2, borderColor: '#444', borderRadius: 5, paddingHorizontal: 8, height: 45 },
  prompt: { color: '#333', fontSize: 16, fontWeight: 'bold', marginRight: 5, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  input: { flex: 1, color: '#000', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11, fontWeight: 'bold' },
  iconBtn: { padding: 5, marginRight: 5 },
  sendBtn: { backgroundColor: '#333', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 3 },
  sendBtnText: { color: '#98CB98', fontSize: 10, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  listContent: { paddingBottom: 10 },
  postCard: { backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 2, borderColor: '#444', borderRadius: 5, padding: 10, marginBottom: 10 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarContainer: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#DDD', justifyContent: 'center', alignItems: 'center', marginRight: 6, borderWidth: 1, borderColor: '#555' },
  trainerName: { fontWeight: 'bold', fontSize: 12, color: '#000', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  timestamp: { color: '#555', fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  divider: { height: 1, backgroundColor: '#666', marginVertical: 5, opacity: 0.3 },
  postContent: { color: '#000', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', lineHeight: 16, marginTop: 5, marginBottom: 5 },
  customPostImage: { width: '100%', height: 200, borderRadius: 5, borderWidth: 1, borderColor: '#888', marginTop: 5 },
  discoveryRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 5, padding: 5, borderWidth: 1, borderColor: '#888', marginTop: 5 },
  imageFrame: { width: 50, height: 50, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center', marginRight: 10, borderRadius: 3 },
  postImage: { width: 40, height: 40 },
  discoveryTextContainer: { flex: 1 },
  actionText: { fontSize: 8, color: '#444', fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  pokemonName: { fontSize: 14, fontWeight: '900', color: '#000', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 1 },
  idText: { fontSize: 10, color: '#444', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  interactionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 15 },
  iconBtnRow: { flexDirection: 'row', alignItems: 'center' },
  interactionIcon: { fontSize: 16, marginRight: 4 },
  interactionText: { fontSize: 10, color: '#444', fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  // --- MODAL STYLES ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContainer: { height: '60%', backgroundColor: '#DEDEDE', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, borderWidth: 4, borderColor: '#555' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 2, borderColor: '#AAA', paddingBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: '900', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#333' },
  closeText: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  modalContent: { flex: 1, backgroundColor: '#98CB98', borderRadius: 10, borderWidth: 2, borderColor: '#555', padding: 10 },
  commentItem: { marginBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', paddingBottom: 5 },
  commentUser: { fontWeight: 'bold', fontSize: 11, color: '#005', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  commentText: { fontSize: 12, color: '#000', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  emptyComments: { textAlign: 'center', marginTop: 20, color: '#555', fontStyle: 'italic', fontSize: 12 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, borderTopWidth: 2, borderTopColor: '#555', paddingTop: 10 },
  commentInput: { flex: 1, backgroundColor: '#FFF', borderRadius: 5, padding: 8, fontSize: 12, height: 40, borderWidth: 1, borderColor: '#555', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  commentSendBtn: { marginLeft: 10, backgroundColor: '#333', padding: 10, borderRadius: 5 },
  commentSendText: { color: '#FFF', fontSize: 14 }
});
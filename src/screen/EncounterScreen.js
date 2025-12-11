import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
  Easing,
  Platform,
  ActivityIndicator,
  Image,
  TextInput, // Added TextInput
  KeyboardAvoidingView // For better input handling
} from 'react-native';

// 1. Camera Imports
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

// 2. Firebase Imports
import { auth, db } from '../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { registerDiscovery } from '../api/gamification';

const { width, height } = Dimensions.get('window');

const EncounterScreen = ({ route, navigation }) => {
  const { pokemon } = route.params || { pokemon: null };
  const [caught, setCaught] = useState(false);
  const [catching, setCatching] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // New State
  const [postMessage, setPostMessage] = useState(""); // Message State

  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const ballAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestPermission();
    if (pokemon) {
      setPostMessage(`I just caught a Wild ${pokemon.name.toUpperCase()}!`);
    }
  }, [pokemon]);

  if (!pokemon) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No Pokémon data found.</Text>
      </View>
    );
  }

  if (!hasPermission) return <View style={styles.container}><Text style={styles.errorText}>No Camera Permission</Text></View>;
  if (device == null) return <View style={styles.container}><ActivityIndicator size="large" color="#FFF" /></View>;

  // --- POST TO FEED ---
  const handlePostToFeed = async () => {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "posts"), {
        pokemonName: pokemon.name,
        pokemonId: pokemon.id,
        pokemonImage: pokemon.image,
        trainerEmail: user.email,
        content: postMessage, // Use custom message
        createdAt: serverTimestamp(),
        likes: 0
      });

      Alert.alert(
        "Posted! 🌍",
        "Your catch is visible on the Global Feed.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("Feed Error:", error);
      Alert.alert("Error", "Could not post to feed.");
    }
  };

  const handleCatch = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in!");
      return;
    }

    setCatching(true);

    // Animate the Ball
    Animated.sequence([
      Animated.timing(ballAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(ballAnim, {
        toValue: 2,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start(async () => {
      try {
        await registerDiscovery(user.uid, pokemon);

        setCaught(true);
        setCatching(false);
        // Show the Custom Success Modal instead of Alert
        setShowSuccessModal(true);

      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Capture failed. Try again.");
        setCatching(false);
        ballAnim.setValue(0);
      }
    });
  };

  const ballTranslateY = ballAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -300, -300]
  });

  const ballScale = ballAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 0.5, 0]
  });

  const pokemonOpacity = ballAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [1, 1, 0]
  });

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />

      <View style={styles.arHud}>
          <Text style={styles.arText}>AR MODE: ACTIVE</Text>
          <Text style={styles.arText}>TARGET LOCKED</Text>
      </View>

      <View style={styles.targetContainer}>
        <Animated.Image
          source={{ uri: pokemon.image }}
          style={[styles.pokemonSprite, { opacity: pokemonOpacity }]}
        />
      </View>

      {/* Main Overlay (Controls) - Hide when success modal shows */}
      {!showSuccessModal && (
        <View style={styles.overlay}>
          <View style={styles.header}>
              <Text style={styles.wildText}>WILD ENCOUNTER!</Text>
              <View style={styles.pokemonTag}>
                  <Text style={styles.pokemonName}>{pokemon.name.toUpperCase()}</Text>
              </View>
          </View>

          <View style={styles.controls}>
             {!caught && !catching && (
                <TouchableOpacity style={styles.captureBtn} onPress={handleCatch}>
                  <View style={styles.innerBtn}>
                      <View style={styles.innerLine} />
                      <View style={styles.innerDot} />
                  </View>
                </TouchableOpacity>
             )}

             {catching && (
               <Animated.Image
                  source={{ uri: 'https://img.icons8.com/color/96/pokeball-2.png' }}
                  style={[
                    styles.thrownBall,
                    { transform: [{ translateY: ballTranslateY }, { scale: ballScale }] }
                  ]}
               />
             )}

             <Text style={styles.hintText}>
               {catching ? "Throwing..." : "Tap to throw Pokéball"}
             </Text>
          </View>
        </View>
      )}

      {/* SUCCESS MODAL OVERLAY */}
      {showSuccessModal && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>GOTCHA!</Text>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.successText}>
                {pokemon.name.toUpperCase()} was caught!
              </Text>

              <Text style={styles.label}>LEAVE A MESSAGE:</Text>
              <TextInput
                style={styles.input}
                value={postMessage}
                onChangeText={setPostMessage}
                placeholder="Write something..."
                placeholderTextColor="#666"
                multiline
              />

              <TouchableOpacity style={styles.postBtn} onPress={handlePostToFeed}>
                <Text style={styles.postBtnText}>POST TO FEED 🌍</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                 <Text style={styles.linkText}>Return to Map</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                 <Text style={styles.linkText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  errorText: { color: 'white', marginTop: 50, textAlign: 'center', fontSize: 16 },

  arHud: {
    position: 'absolute',
    top: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 5
  },
  arText: {
    color: '#00FF00',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 2
  },

  targetContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    marginTop: -80
  },
  pokemonSprite: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 20,
    zIndex: 10
  },
  header: { alignItems: 'center', marginTop: 40 },
  wildText: {
    color: '#fbbf24', fontSize: 18, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 10, textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 5
  },
  pokemonTag: {
    backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: '#333'
  },
  pokemonName: { color: '#333', fontWeight: 'bold', fontSize: 18 },

  controls: { alignItems: 'center', marginBottom: 20 },
  captureBtn: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center', elevation: 10, marginBottom: 10,
    borderWidth: 1, borderColor: '#DDD'
  },
  innerBtn: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#ff0000',
    borderWidth: 4, borderColor: '#333', justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden', position: 'relative'
  },
  innerLine: { width: '100%', height: 6, backgroundColor: '#333', position: 'absolute' },
  innerDot: {
    width: 20, height: 20, backgroundColor: 'white', borderRadius: 10, borderWidth: 3, borderColor: '#333', zIndex: 2
  },
  hintText: {
    color: '#fff', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4
  },

  thrownBall: {
    width: 60,
    height: 60,
    position: 'absolute',
    bottom: 20,
  },

  // --- SUCCESS MODAL STYLES ---
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    padding: 20
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#DC0A2D',
    borderRadius: 15,
    borderWidth: 4,
    borderColor: '#8B0000',
    overflow: 'hidden'
  },
  modalHeader: {
    backgroundColor: '#CC0000',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#8B0000'
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2
  },
  modalContent: {
    padding: 20,
    backgroundColor: '#DEDEDE'
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 5,
    padding: 10,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#000',
    marginBottom: 15
  },
  postBtn: {
    backgroundColor: '#28AAFD',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1C5D8D',
    elevation: 3
  },
  postBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#333'
  },
  linkText: {
    color: '#FFCB05',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 14
  }
});

export default EncounterScreen;
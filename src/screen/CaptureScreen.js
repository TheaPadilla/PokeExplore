import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import Voice from '@react-native-voice/voice';
import Share from 'react-native-share';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const CaptureScreen = ({ navigation }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognized, setRecognized] = useState('');
  const [error, setError] = useState('');
  const [capturedPhotos, setCapturedPhotos] = useState([
    {
      id: 1,
      emoji: '🌿',
      name: 'BULBASAUR',
      timestamp: 'Today 10:30 AM',
      type: 'GRASS',
    },
    {
      id: 2,
      emoji: '🔥',
      name: 'CHARMANDER',
      timestamp: 'Today 09:15 AM',
      type: 'FIRE',
    },
    {
      id: 3,
      emoji: '💧',
      name: 'SQUIRTLE',
      timestamp: 'Yesterday 3:45 PM',
      type: 'WATER',
    },
  ]);

  useEffect(() => {
    setupVoiceRecognition();
    return () => {
      Voice.destroy().catch(e => console.error(e));
    };
  }, []);

  // Setup voice recognition callbacks
  const setupVoiceRecognition = () => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechPartialResults = onSpeechPartialResults;
  };

  const onSpeechStart = () => {
    console.log('Speech started');
    setIsListening(true);
    setError('');
  };

  const onSpeechEnd = () => {
    console.log('Speech ended');
    setIsListening(false);
  };

  const onSpeechResults = results => {
    console.log('Speech results:', results);
    if (results && results.length > 0) {
      searchPokemonByVoice(results[0]);
    }
  };

  const onSpeechPartialResults = results => {
    console.log('Partial results:', results);
  };

  const onSpeechError = error => {
    console.error('Speech error:', error);
    setError(`Error: ${error.error}`);
    setIsListening(false);
  };

  // Start voice listening
  const startVoiceSearch = async () => {
    try {
      // Request microphone permission
      if (Platform.OS === 'ios') {
        const permission = await request(PERMISSIONS.IOS.MICROPHONE);
        if (permission !== RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Microphone access is required');
          return;
        }
      } else {
        const permission = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        if (permission !== RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Microphone access is required');
          return;
        }
      }

      await Voice.start('en-US');
      setIsListening(true);
    } catch (error) {
      console.error('Voice start error:', error);
      setError('Failed to start voice recognition');
    }
  };

  // Stop voice listening
  const stopVoiceSearch = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Voice stop error:', error);
    }
  };

  // Search Pokémon by voice input
  const searchPokemonByVoice = voiceInput => {
    const pokemonDatabase = [
      'BULBASAUR',
      'CHARMANDER',
      'SQUIRTLE',
      'PIKACHU',
      'PSYDUCK',
      'GROWLITHE',
      'PIDGEOT',
      'BELLSPROUT',
      'SUNKERN',
      'MAGIKARP',
    ];

    const inputLower = voiceInput.toLowerCase();
    const match = pokemonDatabase.find(
      name =>
        name.toLowerCase().includes(inputLower) ||
        inputLower.includes(name.toLowerCase()),
    );

    if (match) {
      setRecognized(match);
      Alert.alert('🎤 Voice Recognized', `You said: ${match}`, [
        {
          text: 'Add to Gallery',
          onPress: () => addPhotoToGallery(match),
        },
        { text: 'Close', style: 'cancel' },
      ]);
    } else {
      Alert.alert(
        '❌ Not Found',
        `Couldn't recognize: "${voiceInput}"\n\nTry saying: PIKACHU, BULBASAUR, CHARMANDER, etc.`,
      );
    }
  };

  // Capture and add photo to gallery (simulated)
  const capturePhoto = () => {
    const allPokemon = [
      { emoji: '🌿', name: 'BULBASAUR', type: 'GRASS' },
      { emoji: '🔥', name: 'CHARMANDER', type: 'FIRE' },
      { emoji: '💧', name: 'SQUIRTLE', type: 'WATER' },
      { emoji: '⚡', name: 'PIKACHU', type: 'ELECTRIC' },
      { emoji: '🦆', name: 'PSYDUCK', type: 'WATER' },
      { emoji: '🐕', name: 'GROWLITHE', type: 'FIRE' },
      { emoji: '🦅', name: 'PIDGEOT', type: 'NORMAL' },
    ];

    const randomPokemon =
      allPokemon[Math.floor(Math.random() * allPokemon.length)];

    const newPhoto = {
      id: capturedPhotos.length + 1,
      ...randomPokemon,
      timestamp: 'Just now',
    };

    setCapturedPhotos([newPhoto, ...capturedPhotos]);
    Alert.alert(
      '✅ Photo Captured',
      `${randomPokemon.name} saved to your AR Overlay Gallery!`,
    );
  };

  // Add recognized Pokémon to gallery
  const addPhotoToGallery = pokemonName => {
    const allPokemon = [
      { emoji: '🌿', name: 'BULBASAUR', type: 'GRASS' },
      { emoji: '🔥', name: 'CHARMANDER', type: 'FIRE' },
      { emoji: '💧', name: 'SQUIRTLE', type: 'WATER' },
      { emoji: '⚡', name: 'PIKACHU', type: 'ELECTRIC' },
      { emoji: '🦆', name: 'PSYDUCK', type: 'WATER' },
      { emoji: '🐕', name: 'GROWLITHE', type: 'FIRE' },
      { emoji: '🦅', name: 'PIDGEOT', type: 'NORMAL' },
    ];

    const pokemon = allPokemon.find(p => p.name === pokemonName);
    if (pokemon) {
      const newPhoto = {
        id: capturedPhotos.length + 1,
        ...pokemon,
        timestamp: 'Just now',
      };
      setCapturedPhotos([newPhoto, ...capturedPhotos]);
    }
  };

  // Share photo to social media
  const sharePhoto = async pokemon => {
    try {
      await Share.open({
        message: `Just caught ${pokemon.name} with PokeExplorer! 🎮 Check out my discoveries! #PokeExplore`,
        title: `Share ${pokemon.name}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Delete photo from gallery
  const deletePhoto = photoId => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      {
        text: 'Delete',
        onPress: () => {
          setCapturedPhotos(capturedPhotos.filter(p => p.id !== photoId));
          Alert.alert('✅ Deleted', 'Photo removed from gallery');
        },
        style: 'destructive',
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* AR Camera Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>📷 AR CAMERA</Text>

        <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
          <Text style={styles.captureText}>🎥 CAPTURE PHOTO</Text>
        </TouchableOpacity>

        <View style={styles.cameraPreview}>
          <Text style={styles.previewTitle}>📹 Camera Feed</Text>
          <Text style={styles.previewSubtitle}>(AR overlay active)</Text>
          <Text style={styles.previewHint}>
            Point your camera at a Pokémon or landmark to spawn an overlay
          </Text>
        </View>

        <View style={styles.arInfo}>
          <Text style={styles.arLabel}>AR OVERLAY INFO</Text>
          <Text style={styles.arDetail}>✓ Camera permission: Enabled</Text>
          <Text style={styles.arDetail}>✓ Sprite overlay: 2D Pokémon</Text>
          <Text style={styles.arDetail}>✓ Gyro detection: Active</Text>
        </View>
      </View>

      {/* Voice Search Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>🎤 VOICE SEARCH</Text>

        <TouchableOpacity
          style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
          onPress={isListening ? stopVoiceSearch : startVoiceSearch}
        >
          <Text style={styles.voiceText}>
            {isListening ? '⏺ LISTENING...' : '🎤 SPEAK POKÉMON NAME'}
          </Text>
        </TouchableOpacity>

        {recognized && (
          <View style={styles.recognizedBox}>
            <Text style={styles.recognizedLabel}>✓ RECOGNIZED</Text>
            <Text style={styles.recognizedName}>{recognized}</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorLabel}>⚠ {error}</Text>
          </View>
        )}

        <Text style={styles.voiceHint}>
          Try saying: PIKACHU, BULBASAUR, CHARMANDER, SQUIRTLE
        </Text>
      </View>

      {/* Gallery Section */}
      <View style={styles.section}>
        <View style={styles.galleryHeader}>
          <Text style={styles.sectionHeader}>📸 GALLERY</Text>
          <Text style={styles.galleryCount}>{capturedPhotos.length}</Text>
        </View>

        {capturedPhotos.length > 0 ? (
          <View style={styles.gallery}>
            {capturedPhotos.map(photo => (
              <View key={photo.id} style={styles.photoCardWrapper}>
                <TouchableOpacity
                  style={styles.photoCard}
                  onLongPress={() => deletePhoto(photo.id)}
                >
                  <Text style={styles.photoEmoji}>{photo.emoji}</Text>
                  <Text style={styles.photoName}>{photo.name}</Text>
                  <Text style={styles.photoType}>{photo.type}</Text>
                  <Text style={styles.photoTime}>{photo.timestamp}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareIconBtn}
                  onPress={() => sharePhoto(photo)}
                >
                  <Text style={styles.shareIcon}>📤</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyGallery}>
            <Text style={styles.emptyGalleryText}>
              📸 No photos yet. Capture or recognize a Pokémon!
            </Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>ℹ️ FEATURES</Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>
            🎥{' '}
            <Text style={styles.featureText}>
              Camera Capture: Take photos with AR overlays
            </Text>
          </Text>
          <Text style={styles.featureItem}>
            🎤{' '}
            <Text style={styles.featureText}>
              Voice Search: Speak Pokémon names
            </Text>
          </Text>
          <Text style={styles.featureItem}>
            📤{' '}
            <Text style={styles.featureText}>Share: Post to social media</Text>
          </Text>
          <Text style={styles.featureItem}>
            🗑️{' '}
            <Text style={styles.featureText}>
              Delete: Long-press photos to remove
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#065f46',
    paddingBottom: 20,
  },
  section: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#065f46',
  },
  sectionHeader: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'monospace',
    borderBottomWidth: 2,
    borderBottomColor: '#fbbf24',
    paddingBottom: 8,
  },
  captureButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  captureText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  cameraPreview: {
    backgroundColor: '#111827',
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  previewTitle: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewSubtitle: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 8,
  },
  previewHint: {
    color: '#4b5563',
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  arInfo: {
    backgroundColor: '#111827',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  arLabel: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'monospace',
  },
  arDetail: {
    color: '#d1d5db',
    fontSize: 11,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  voiceButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fbbf24',
    marginBottom: 12,
  },
  voiceButtonActive: {
    backgroundColor: '#fbbf24',
  },
  voiceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  recognizedBox: {
    backgroundColor: '#065f46',
    borderWidth: 2,
    borderColor: '#10b981',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  recognizedLabel: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  recognizedName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
    borderWidth: 2,
    borderColor: '#dc2626',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  errorLabel: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  voiceHint: {
    color: '#9ca3af',
    fontSize: 11,
    fontStyle: 'italic',
    fontFamily: 'monospace',
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  galleryCount: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoCardWrapper: {
    width: '30%',
    marginBottom: 12,
    position: 'relative',
  },
  photoCard: {
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#fbbf24',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  photoEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  photoName: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  photoType: {
    color: '#d1d5db',
    fontSize: 8,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  photoTime: {
    color: '#6b7280',
    fontSize: 7,
    marginTop: 2,
  },
  shareIconBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  shareIcon: {
    fontSize: 16,
  },
  emptyGallery: {
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#fbbf24',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyGalleryText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  featureList: {
    backgroundColor: '#111827',
    borderLeftWidth: 3,
    borderLeftColor: '#fbbf24',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  featureItem: {
    color: '#fbbf24',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  featureText: {
    color: '#d1d5db',
  },
});

export default CaptureScreen;

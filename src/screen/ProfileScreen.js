import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  FlatList,
  Image,
  Dimensions
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

const { width } = Dimensions.get('window');
const COLUMN_SIZE = (width - 60) / 3; // Calculate size for 3 columns

export default function ProfileScreen({ navigation }) {
  const userEmail = auth.currentUser?.email || "Trainer";
  const username = userEmail.split('@')[0]; // Extract name before @

  // Mock Data for Gallery (Requirement: "Save captures to a gallery")
  // In a real app, you would read these from RNFS or LocalStorage
  const [captures, setCaptures] = useState([
    { id: '1', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', type: 'electric' },
    { id: '2', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', type: 'fire' },
    { id: '3', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png', type: 'grass' },
    { id: '4', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', type: 'psychic' },
    { id: '5', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png', type: 'water' },
    { id: '6', img: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png', type: 'dragon' },
  ]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => console.log("User signed out"))
      .catch((error) => console.error("Logout Error:", error));
  };

  const renderGalleryItem = ({ item }) => (
    <View style={styles.galleryItemContainer}>
      <Image source={{ uri: item.img }} style={styles.galleryImage} />
      {/* Little type dot overlay */}
      <View style={[styles.typeDot, { backgroundColor: getTypeColor(item.type) }]} />
    </View>
  );

  const getTypeColor = (type) => {
    switch(type) {
      case 'fire': return '#F08030';
      case 'water': return '#6890F0';
      case 'grass': return '#78C850';
      case 'electric': return '#F8D030';
      default: return '#A8A878';
    }
  };

  return (
    <View style={styles.container}>
      {/* --- HEADER (Your Original Pokedex Lights) --- */}
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

      <Text style={styles.headerTitle}>TRAINER CARD</Text>

      {/* --- SCREEN 1: TRAINER STATS (Green Screen) --- */}
      <View style={styles.screenContainer}>
        <View style={styles.innerScreen}>

          <View style={styles.row}>
             <Image
                source={{ uri: 'https://img.icons8.com/color/96/pokeball-2.png' }}
                style={styles.avatar}
             />
             <View>
                <Text style={styles.label}>NAME</Text>
                <Text style={styles.trainerName}>{username.toUpperCase()}</Text>

                <View style={styles.statRow}>
                    <Text style={styles.label}>LEVEL: </Text>
                    <Text style={styles.statValue}>42</Text>
                </View>
                <View style={styles.statRow}>
                    <Text style={styles.label}>DEX: </Text>
                    <Text style={styles.statValue}>151</Text>
                </View>
             </View>
          </View>

          {/* Badges Section (Rubric Requirement) */}
          <View style={styles.badgesContainer}>
            <Text style={styles.label}>BADGES:</Text>
            <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: '#999' }]}><Text style={styles.badgeText}>Boulder</Text></View>
                <View style={[styles.badge, { backgroundColor: '#2980b9' }]}><Text style={styles.badgeText}>Cascade</Text></View>
                <View style={[styles.badge, { backgroundColor: '#e67e22' }]}><Text style={styles.badgeText}>Thunder</Text></View>
            </View>
          </View>

        </View>
      </View>

      {/* --- SCREEN 2: CAPTURE GALLERY (Black Screen like camera roll) --- */}
      <View style={styles.galleryLabelRow}>
         <Text style={styles.galleryLabel}>AR CAPTURES</Text>
         <Text style={styles.galleryCount}>{captures.length}/100</Text>
      </View>

      <View style={styles.galleryContainer}>
        <FlatList
          data={captures}
          numColumns={3} // 3x3 Grid Requirement
          keyExtractor={(item) => item.id}
          renderItem={renderGalleryItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      {/* --- FOOTER: CONTROLS --- */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DC0A2D', // Pokedex Red
    paddingTop: 50,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  blueLightContainer: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF',
  },
  blueLight: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E90FF',
    borderWidth: 2, borderColor: '#191970',
  },
  blueLightReflection: {
    position: 'absolute', top: 8, left: 10, width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.6)',
  },
  statusLights: { flexDirection: 'row', marginLeft: 15, gap: 8 },
  smallLight: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#000' },
  headerTitle: {
    color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
  },

  // --- Green Stats Screen ---
  screenContainer: {
    backgroundColor: '#DEDEDE', marginHorizontal: 20, borderRadius: 10, padding: 10,
    marginBottom: 15, borderBottomRightRadius: 35,
  },
  innerScreen: {
    backgroundColor: '#98CB98', borderWidth: 2, borderColor: '#555', borderRadius: 5, padding: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 60, height: 60, marginRight: 15 },
  label: { fontSize: 10, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#333' },
  trainerName: { fontSize: 18, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', marginBottom: 5 },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statValue: { fontSize: 12, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  // --- Badges ---
  badgesContainer: { marginTop: 5, borderTopWidth: 1, borderTopColor: '#555', paddingTop: 5 },
  badgeRow: { flexDirection: 'row', marginTop: 5, gap: 5 },
  badge: { width: 60, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  badgeText: { fontSize: 8, fontWeight: 'bold', color: '#FFF' },

  // --- Gallery Section ---
  galleryLabelRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 25, marginBottom: 5 },
  galleryLabel: { color: '#FFF', fontWeight: 'bold', fontFamily: 'monospace' },
  galleryCount: { color: '#fbbf24', fontFamily: 'monospace' },
  galleryContainer: {
    flex: 1, marginHorizontal: 20, backgroundColor: '#222', borderRadius: 8, padding: 5, borderWidth: 2, borderColor: '#555',
  },
  galleryItemContainer: {
    width: COLUMN_SIZE, height: COLUMN_SIZE, margin: 3, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden',
  },
  galleryImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  typeDot: { position: 'absolute', bottom: 5, right: 5, width: 10, height: 10, borderRadius: 5 },

  // --- Footer ---
  controlsContainer: { padding: 20 },
  logoutButton: {
    backgroundColor: '#FFCB05', paddingVertical: 12, borderRadius: 25, alignItems: 'center', borderWidth: 2, borderColor: '#C59E00',
  },
  logoutText: { color: '#333', fontWeight: 'bold', fontSize: 14, fontFamily: 'monospace' }
});
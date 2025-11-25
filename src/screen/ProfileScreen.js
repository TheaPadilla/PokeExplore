import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  FlatList
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

// Mock Data to simulate discovered Pokemon
const MOCK_DISCOVERIES = [
  { id: '001', name: 'BULBASAUR', status: 'CAUGHT', type: 'GRASS' },
  { id: '004', name: 'CHARMANDER', status: 'SEEN', type: 'FIRE' },
  { id: '007', name: 'SQUIRTLE', status: 'CAUGHT', type: 'WATER' },
  { id: '025', name: 'PIKACHU', status: 'CAUGHT', type: 'ELEC' },
  { id: '133', name: 'EEVEE', status: 'SEEN', type: 'NORMAL' },
];

export default function ProfileScreen({ navigation }) {
  const userEmail = auth.currentUser?.email || "Unknown Trainer";

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        // Navigation is handled automatically by App.js state listener
      })
      .catch((error) => {
        console.error("Logout Error:", error);
      });
  };

  const renderPokemonItem = ({ item }) => (
    <View style={styles.dexRow}>
      <Text style={styles.dexId}>#{item.id}</Text>
      <Text style={styles.dexName}>{item.name}</Text>
      <View style={[
        styles.statusBadge,
        item.status === 'CAUGHT' ? styles.badgeCaught : styles.badgeSeen
      ]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Lights */}
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

      {/* Main Green Screen Area */}
      <View style={styles.screenContainer}>
        <View style={styles.innerScreen}>

          {/* User Info Section */}
          <View style={styles.trainerInfoContainer}>
            <Text style={styles.label}>TRAINER ID:</Text>
            <Text style={styles.trainerName} numberOfLines={1} ellipsizeMode="middle">
              {userEmail.toUpperCase()}
            </Text>
            <View style={styles.divider} />
          </View>

          {/* Pokedex List Section */}
          <Text style={styles.sectionHeader}>RECENT DISCOVERIES</Text>
          <FlatList
            data={MOCK_DISCOVERIES}
            keyExtractor={(item) => item.id}
            renderItem={renderPokemonItem}
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Controls Area */}
      <View style={styles.controlsContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>MAP</Text>
          </TouchableOpacity>

          {/* Decorative D-Pad (Small) */}
          <View style={styles.miniDpad}>
            <View style={styles.dpadV} />
            <View style={styles.dpadH} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
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
  // --- Header Styles ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  blueLightContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  blueLight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E90FF',
    borderWidth: 2,
    borderColor: '#191970',
  },
  blueLightReflection: {
    position: 'absolute',
    top: 8,
    left: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  statusLights: {
    flexDirection: 'row',
    marginLeft: 15,
    gap: 8,
  },
  smallLight: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#000',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  // --- Screen Styles ---
  screenContainer: {
    flex: 1, // Take available space
    backgroundColor: '#DEDEDE', // Grey Bezel
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 15,
    borderBottomRightRadius: 35, // Asymmetric look
  },
  innerScreen: {
    flex: 1,
    backgroundColor: '#98CB98', // Retro Green
    borderWidth: 3,
    borderColor: '#555',
    borderRadius: 5,
    padding: 12,
  },
  // --- Trainer Info ---
  trainerInfoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  trainerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  divider: {
    height: 2,
    backgroundColor: '#333',
    marginTop: 5,
    opacity: 0.5,
  },
  // --- List Styles ---
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textDecorationLine: 'underline',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  listContainer: {
    flex: 1,
  },
  dexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dexId: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    width: 40,
    color: '#333',
  },
  dexName: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeCaught: {
    backgroundColor: '#FF0000', // Red pokeball color
  },
  badgeSeen: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  // --- Controls ---
  controlsContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#28AAFD', // Blue Button
    width: 100,
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1C5D8D',
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  // Mini D-Pad Visual
  miniDpad: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  dpadV: {
    position: 'absolute',
    left: 17,
    top: 5,
    width: 16,
    height: 40,
    backgroundColor: '#222',
    borderRadius: 2,
  },
  dpadH: {
    position: 'absolute',
    top: 17,
    left: 5,
    width: 40,
    height: 16,
    backgroundColor: '#222',
    borderRadius: 2,
  },
  // Logout Button
  logoutButton: {
    backgroundColor: '#FFCB05', // Pokemon Yellow
    width: '100%',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C59E00',
  },
  logoutText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  }
});
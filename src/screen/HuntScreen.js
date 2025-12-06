import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const HuntScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [nearbyPokemon, setNearbyPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [biomeType, setBiomeType] = useState('');
  // State to hold the watch ID for cleanup
  const [locationWatcherId, setLocationWatcherId] = useState(null);

  useEffect(() => {
    // 1. Request permission when component mounts
    requestLocationPermission();

    // 2. Cleanup function: Clear the watcher when the component unmounts
    return () => {
      if (locationWatcherId !== null) {
        Geolocation.clearWatch(locationWatcherId);
      }
    };
  }, [locationWatcherId]); // Depend on locationWatcherId to set up cleanup correctly

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        // Start watching location immediately after permission is granted
        watchLocation();
      } else {
        Alert.alert('Permission Denied', 'Enable location to use Hunt Mode');
        setLoading(false);
      }
    } catch (error) {
      console.error('Permission error:', error);
      setLoading(false);
    }
  };

  // 🔄 Watch current GPS location for real-time updates
  const watchLocation = () => {
    setLoading(true);

    // Clear any existing watch to prevent duplicates
    if (locationWatcherId !== null) {
        Geolocation.clearWatch(locationWatcherId);
    }

    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;

        // Only spawn new Pokemon if the location has changed significantly (e.g., 50m change)
        if (!location || Math.abs(location.latitude - latitude) > 0.0005 || Math.abs(location.longitude - longitude) > 0.0005) {
             setLocation({ latitude, longitude });
             // Re-spawn/check for Pokemon when location updates
             spawnPokemon(latitude, longitude);
        }
        setLoading(false);
      },
      error => {
        console.error('Location watch error:', error);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        distanceFilter: 10 // Update every 10 meters
      },
    );

    setLocationWatcherId(watchId); // Save the watch ID for cleanup
  };

  // Spawn Pokémon based on deterministic biome logic
  const spawnPokemon = (lat, lon) => {
    const biomes = {
      water: {
        type: 'WATER',
        pokemon: [
          { id: '007', name: 'SQUIRTLE', emoji: '💧', type: 'WATER' },
          { id: '054', name: 'PSYDUCK', emoji: '🦆', type: 'WATER' },
          { id: '129', name: 'MAGIKARP', emoji: '🐠', type: 'WATER' },
        ],
      },
      grass: {
        type: 'GRASS',
        pokemon: [
          { id: '001', name: 'BULBASAUR', emoji: '🌿', type: 'GRASS' },
          { id: '069', name: 'BELLSPROUT', emoji: '🌱', type: 'GRASS' },
          { id: '191', name: 'SUNKERN', emoji: '🌻', type: 'GRASS' },
        ],
      },
      urban: {
        type: 'URBAN',
        pokemon: [
          { id: '016', name: 'PIDGEOT', emoji: '🦅', type: 'NORMAL' },
          { id: '025', name: 'PIKACHU', emoji: '⚡', type: 'ELECTRIC' },
          { id: '058', name: 'GROWLITHE', emoji: '🐕', type: 'FIRE' },
        ],
      },
    };

    // --- Deterministic Biome Logic based on Coordinates ---
    let determinedBiomeKey;
    // Uses the integer part of scaled latitude to create zones
    const latInt = Math.floor(lat * 100);

    if ((latInt % 3) === 0) {
        determinedBiomeKey = 'water';
    } else if ((latInt % 3) === 1) {
        determinedBiomeKey = 'grass';
    } else {
        determinedBiomeKey = 'urban';
    }
    // --- End of Biome Logic ---

    const selectedBiome = biomes[determinedBiomeKey];
    setBiomeType(determinedBiomeKey.toUpperCase());

    const pokemonList = selectedBiome.pokemon;
    const spawned = pokemonList
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(poke => ({
        ...poke,
        distance: Math.floor(Math.random() * 500) + 100, // 100-600m
        // Position the Pokemon in a tight radius around the current location
        latitude: lat + (Math.random() - 0.5) * 0.003,
        longitude: lon + (Math.random() - 0.5) * 0.003,
      }));

    setNearbyPokemon(spawned);
  };

  // Handle Pokémon encounter
  const handleEncounter = pokemon => {
    Alert.alert(
      `🎯 Wild ${pokemon.name}!`,
      `A ${pokemon.type}-type Pokémon appeared!\nDistance: ${pokemon.distance}m`,
      [
        {
          text: 'Catch!',
          onPress: () => {
            Alert.alert('✅ Success!', `You caught ${pokemon.name}!`, [{ text: 'OK' }]);
          },
        },
        {
          text: 'Take Photo',
          onPress: () => {
            Alert.alert('📸', 'Navigating to camera...');
            navigation.navigate('Capture');
          },
        },
        { text: 'Run Away', style: 'cancel' },
      ],
    );
  };

  // Refresh location and spawn new Pokémon
  const handleRefresh = () => {
    if (location) {
        setLoading(true);
        // Re-spawn based on current location
        spawnPokemon(location.latitude, location.longitude);
        setTimeout(() => setLoading(false), 500); // Simulate loading time
    } else {
        // If location is null, try to restart the watching process
        watchLocation();
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#fbbf24" />
        <Text style={styles.loadingText}>Scanning for Pokémon...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          // Use 'region' to keep the map centered on the current location as it updates
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.005, // Closer zoom level
            longitudeDelta: 0.005,
          }}
          showsUserLocation={true} // Use built-in user location marker
        >
          {nearbyPokemon.map(poke => (
            <Marker
              key={poke.id}
              coordinate={{ latitude: poke.latitude, longitude: poke.longitude }}
              title={`🎯 ${poke.name}`}
              description={`${poke.type} • ${poke.distance}m away`}
              pinColor="red"
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.errorText}>Location unavailable</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
            <Text style={styles.refreshText}>🔄 RETRY LOCATION</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>🎯 NEARBY POKÉMON</Text>
          <Text style={styles.biomeLabel}>{biomeType}</Text>
        </View>

        {nearbyPokemon.length > 0 ? (
          <FlatList
            data={nearbyPokemon}
            keyExtractor={item => item.id}
            scrollEnabled={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pokemonItem}
                onPress={() => handleEncounter(item)}
              >
                <View style={styles.pokemonInfo}>
                  <Text style={styles.pokemonName}>{item.emoji} {item.name}</Text>
                  <Text style={styles.pokemonType}>{item.type}-TYPE</Text>
                </View>
                <View style={styles.pokemonRight}>
                  <Text style={styles.distance}>{item.distance}m</Text>
                  <TouchableOpacity
                    style={styles.encounterBtn}
                    onPress={() => handleEncounter(item)}
                  >
                    <Text style={styles.btnText}>ENCOUNTER</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.noPokemonText}>No Pokémon nearby yet...</Text>
        )}

        <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
          <Text style={styles.refreshText}>🔄 RESCAN FOR POKÉMON</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1f2937' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1f2937' },
  map: { flex: 0.65, borderBottomWidth: 4, borderBottomColor: '#fbbf24' },
  mapPlaceholder: { flex: 0.65, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#fbbf24' },
  errorText: { color: '#ef4444', fontSize: 16, fontFamily: 'monospace' },
  listContainer: { flex: 0.35, backgroundColor: '#111827', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  listTitle: { color: '#fbbf24', fontSize: 14, fontWeight: 'bold', fontFamily: 'monospace' },
  biomeLabel: { color: '#65a30d', fontSize: 11, fontWeight: 'bold', backgroundColor: '#1f2937', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontFamily: 'monospace' },
  pokemonItem: { backgroundColor: '#065f46', paddingVertical: 10, paddingHorizontal: 10, marginBottom: 8, borderRadius: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: '#fbbf24' },
  pokemonInfo: { flex: 1 },
  pokemonName: { color: '#fff', fontSize: 13, fontWeight: 'bold', fontFamily: 'monospace' },
  pokemonType: { color: '#d1d5db', fontSize: 11, marginTop: 2, fontFamily: 'monospace' },
  pokemonRight: { alignItems: 'flex-end' },
  distance: { color: '#fbbf24', fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' },
  encounterBtn: { backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, marginTop: 4, borderWidth: 1, borderColor: '#fff' },
  btnText: { color: '#fff', fontSize: 10, fontWeight: 'bold', fontFamily: 'monospace' },
  noPokemonText: { color: '#9ca3af', textAlign: 'center', fontFamily: 'monospace', marginVertical: 12 },
  refreshBtn: { backgroundColor: '#3b82f6', paddingVertical: 10, borderRadius: 6, alignItems: 'center', borderWidth: 2, borderColor: '#fff', marginTop: 8 },
  refreshText: { color: '#fff', fontWeight: 'bold', fontFamily: 'monospace', fontSize: 12 },
  loadingText: { color: '#fbbf24', marginTop: 12, fontFamily: 'monospace', fontSize: 14 },
});

export default HuntScreen;
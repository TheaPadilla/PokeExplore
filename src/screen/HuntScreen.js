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
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import PushNotification from 'react-native-push-notification';

const HuntScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [nearbyPokemon, setNearbyPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [biomeType, setBiomeType] = useState('');

  useEffect(() => {
    requestLocationPermission();
    setupNotifications();
  }, []);

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        getLocation();
      } else {
        Alert.alert('Permission Denied', 'Enable location to use Hunt Mode');
        setLoading(false);
      }
    } catch (error) {
      console.error('Permission error:', error);
      setLoading(false);
    }
  };

  // Get current GPS location
  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        spawnPokemon(latitude, longitude);
        setLoading(false);
      },
      error => {
        console.error('Location error:', error);
        Alert.alert('Error', 'Could not get your location. Try again.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 },
    );
  };

  // Setup push notifications
  const setupNotifications = () => {
    PushNotification.configure({
      onNotification(notification) {
        console.log('Notification received:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
    });
  };

  // Spawn Pokémon based on biome logic
  const spawnPokemon = (lat, lon) => {
    // Biome selection (randomized)
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

    const biomeKeys = Object.keys(biomes);
    const randomBiome = biomeKeys[Math.floor(Math.random() * biomeKeys.length)];
    const selectedBiome = biomes[randomBiome];
    setBiomeType(randomBiome.toUpperCase());

    // Randomly select 3 Pokémon from the biome
    const pokemonList = selectedBiome.pokemon;
    const spawned = pokemonList
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(poke => ({
        ...poke,
        distance: Math.floor(Math.random() * 500) + 100, // 100-600m
        latitude: lat + (Math.random() - 0.5) * 0.01,
        longitude: lon + (Math.random() - 0.5) * 0.01,
      }));

    setNearbyPokemon(spawned);
    triggerNotification(spawned[0].name, randomBiome);
  };

  // Trigger push notification
  const triggerNotification = (pokemonName, biome) => {
    PushNotification.localNotification({
      title: '⚡ Pokémon Nearby!',
      message: `A wild ${pokemonName} appeared in the ${biome}!`,
      playSound: true,
      soundName: 'default',
      vibrate: true,
    });
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
            Alert.alert('✅ Success!', `You caught ${pokemon.name}!`, [
              { text: 'OK' },
            ]);
            // TODO: Save to user's Pokedex
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
    setLoading(true);
    getLocation();
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
      {/* Map View */}
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {/* Player location marker */}
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="📍 Your Location"
            pinColor="blue"
          />

          {/* Pokémon spawn markers */}
          {nearbyPokemon.map(poke => (
            <Marker
              key={poke.id}
              coordinate={{
                latitude: poke.latitude,
                longitude: poke.longitude,
              }}
              title={`🎯 ${poke.name}`}
              description={`${poke.type} • ${poke.distance}m away`}
              pinColor="red"
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.errorText}>Location unavailable</Text>
        </View>
      )}

      {/* Nearby Pokémon List */}
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>🎯 NEARBY POKÉMON</Text>
          <Text style={styles.biomeLabel}>{biomeType}</Text>
        </View>

        {nearbyPokemon.length > 0 ? (
          <FlatList
            data={nearbyPokemon}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pokemonItem}
                onPress={() => handleEncounter(item)}
              >
                <View style={styles.pokemonInfo}>
                  <Text style={styles.pokemonName}>
                    {item.emoji} {item.name}
                  </Text>
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
          <Text style={styles.refreshText}>🔄 REFRESH</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2937',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f2937',
  },
  map: {
    flex: 0.65,
    borderBottomWidth: 4,
    borderBottomColor: '#fbbf24',
  },
  mapPlaceholder: {
    flex: 0.65,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#fbbf24',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    fontFamily: 'monospace',
  },
  listContainer: {
    flex: 0.35,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listTitle: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  biomeLabel: {
    color: '#65a30d',
    fontSize: 11,
    fontWeight: 'bold',
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  pokemonItem: {
    backgroundColor: '#065f46',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#fbbf24',
  },
  pokemonInfo: {
    flex: 1,
  },
  pokemonName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  pokemonType: {
    color: '#d1d5db',
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  pokemonRight: {
    alignItems: 'flex-end',
  },
  distance: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  encounterBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  btnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  noPokemonText: {
    color: '#9ca3af',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginVertical: 12,
  },
  refreshBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    marginTop: 8,
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  loadingText: {
    color: '#fbbf24',
    marginTop: 12,
    fontFamily: 'monospace',
    fontSize: 14,
  },
});

export default HuntScreen;

import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import { fetchPokemonDetails } from '../api/pokeapi';

// Helper to color code types
const TYPE_COLORS = {
  grass: '#78C850', fire: '#F08030', water: '#6890F0',
  bug: '#A8B820', normal: '#A8A878', poison: '#A040A0',
  electric: '#F8D030', ground: '#E0C068', fairy: '#EE99AC',
  fighting: '#C03028', psychic: '#F85888', rock: '#B8A038',
  ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8',
};

export default function DetailScreen({ route, navigation }) {
  // Safe check for params
  const { pokemonId } = route.params || {};
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pokemonId) return;

    const loadDetails = async () => {
      const data = await fetchPokemonDetails(pokemonId);
      setDetails(data);
      setLoading(false);
    };
    loadDetails();
  }, [pokemonId]);

  if (!pokemonId) {
    return (
      <View style={styles.container}>
        <Text style={{color: '#FFF'}}>Error: No Pokemon Selected</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent:'center'}]}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>◀ BACK</Text>
      </TouchableOpacity>

      <View style={styles.whiteScreen}>
        {details?.image && (
          <Image source={{ uri: details.image }} style={styles.mainImage} />
        )}
        <View style={styles.nameTag}>
          <Text style={styles.nameText}>#{details?.id} {details?.name?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.greenScreen}>
        <ScrollView>
          {/* Flavor Text */}
          <Text style={styles.flavorText}>{details?.description}</Text>

          {/* Types */}
          <View style={styles.section}>
            <Text style={styles.label}>TYPES:</Text>
            <View style={styles.row}>
              {details?.types?.map(t => (
                <View key={t} style={[styles.typeBadge, { backgroundColor: TYPE_COLORS[t] || '#777' }]}>
                  <Text style={styles.typeText}>{t.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Physical Stats */}
          <View style={styles.row}>
            <View style={styles.statBox}>
              <Text style={styles.label}>HEIGHT</Text>
              <Text style={styles.value}>{details?.height / 10} m</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.label}>WEIGHT</Text>
              <Text style={styles.value}>{details?.weight / 10} kg</Text>
            </View>
          </View>

          {/* Base Stats */}
          <View style={styles.section}>
            <Text style={styles.label}>BASE STATS:</Text>
            {details?.stats?.map(s => (
              <View key={s.stat.name} style={styles.statRow}>
                <Text style={styles.statName}>{s.stat.name.toUpperCase()}</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.statBar, { width: `${Math.min(s.base_stat, 100)}%` }]} />
                </View>
                <Text style={styles.statValue}>{s.base_stat}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DC0A2D', padding: 20 },
  backButton: { marginBottom: 10 },
  backText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // White area for Image
  whiteScreen: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#DEDEDE',
    elevation: 5,
  },
  mainImage: { width: 180, height: 180 },
  nameTag: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: -15,
  },
  nameText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  // Green area for Stats
  greenScreen: {
    flex: 1,
    backgroundColor: '#98CB98',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#555',
    padding: 15,
  },
  flavorText: { fontStyle: 'italic', marginBottom: 15, color: '#000' },
  section: { marginBottom: 15 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  row: { flexDirection: 'row', gap: 10 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 5 },
  typeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  statBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', padding: 5, borderRadius: 5, alignItems: 'center' },
  value: { fontWeight: 'bold', fontSize: 14 },

  // Stat Bars
  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statName: { width: 45, fontSize: 8, fontWeight: 'bold', color: '#333' },
  barContainer: { flex: 1, height: 8, backgroundColor: '#FFF', borderRadius: 4, marginHorizontal: 5 },
  statBar: { height: '100%', backgroundColor: '#28AAFD', borderRadius: 4 },
  statValue: { width: 25, fontSize: 10, fontWeight: 'bold', textAlign: 'right' },
});
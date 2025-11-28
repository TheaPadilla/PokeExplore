import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import { fetchPokemonDetails } from '../api/pokeapi';

const TYPE_COLORS = {
  grass: '#78C850', fire: '#F08030', water: '#6890F0',
  bug: '#A8B820', normal: '#A8A878', poison: '#A040A0',
  electric: '#F8D030', ground: '#E0C068', fairy: '#EE99AC',
  fighting: '#C03028', psychic: '#F85888', rock: '#B8A038',
  ghost: '#705898', ice: '#98D8D8', dragon: '#7038F8',
};

export default function DetailScreen({ route, navigation }) {
  const { pokemonId } = route.params || {};
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pokemonId) return;

    const loadDetails = async () => {
      setLoading(true); // Reset loading state when id changes
      const data = await fetchPokemonDetails(pokemonId);
      setDetails(data);
      setLoading(false);
    };
    loadDetails();
  }, [pokemonId]);

  if (!pokemonId) return null;

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent:'center'}]}>
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.flavorText}>{details?.description}</Text>

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

          {/* NEW: Evolution Chain Section */}
          <View style={styles.section}>
            <Text style={styles.label}>EVOLUTION CHAIN:</Text>
            <View style={styles.evoContainer}>
              {details?.evolutions?.map((evo, index) => (
                <React.Fragment key={evo.id}>
                  {index > 0 && <Text style={styles.arrow}>→</Text>}
                  <TouchableOpacity
                    style={styles.evoItem}
                    // Using .push instead of .navigate forces a new screen instance
                    // ensuring the useEffect runs again for the new ID
                    onPress={() => navigation.push('Detail', { pokemonId: evo.id })}
                  >
                    <Image source={{ uri: evo.image }} style={styles.evoImage} />
                    <Text style={styles.evoName}>{evo.name}</Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
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
  mainImage: { width: 150, height: 150 },
  nameTag: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 15,
    marginTop: -15,
  },
  nameText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

  greenScreen: {
    flex: 1,
    backgroundColor: '#98CB98',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#555',
    padding: 15,
  },
  flavorText: { fontStyle: 'italic', marginBottom: 15, color: '#000', fontSize: 12 },
  section: { marginBottom: 15 },
  label: { fontSize: 10, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 5 },
  typeText: { color: '#FFF', fontWeight: 'bold', fontSize: 10 },
  statBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)', padding: 5, borderRadius: 5, alignItems: 'center' },
  value: { fontWeight: 'bold', fontSize: 12 },

  statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statName: { width: 70, fontSize: 8, fontWeight: 'bold', color: '#333' },
  barContainer: { flex: 1, height: 6, backgroundColor: '#FFF', borderRadius: 4, marginHorizontal: 5 },
  statBar: { height: '100%', backgroundColor: '#28AAFD', borderRadius: 4 },
  statValue: { width: 25, fontSize: 10, fontWeight: 'bold', textAlign: 'right' },

  // Evolution Styles
  evoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    padding: 10,
  },
  evoItem: {
    alignItems: 'center',
  },
  evoImage: {
    width: 40,
    height: 40,
  },
  evoName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  arrow: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
});

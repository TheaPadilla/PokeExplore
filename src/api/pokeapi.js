import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Cache key for the main list
const LIST_CACHE_KEY = 'POKEMON_LIST_CACHE';

export const fetchPokemonList = async (limit = 151) => {
  try {
    // 1. Try to get data from Cache first (Offline Support)
    const cachedData = await AsyncStorage.getItem(LIST_CACHE_KEY);
    if (cachedData) {
      console.log('Loaded from Cache');
      return JSON.parse(cachedData);
    }

    // 2. If no cache, fetch from API
    console.log('Fetching from API...');
    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}`);
    const data = await response.json();

    // 3. Format data to include image URLs immediately (optimization)
    const formattedList = data.results.map((item, index) => {
      const id = index + 1;
      return {
        ...item,
        id,
        // Using high-quality official artwork
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      };
    });

    // 4. Save to Cache
    await AsyncStorage.setItem(LIST_CACHE_KEY, JSON.stringify(formattedList));
    return formattedList;

  } catch (error) {
    console.error("Error fetching list:", error);
    return [];
  }
};

export const fetchPokemonDetails = async (id) => {
  try {
    // Check if we have cached details for this specific ID
    const cacheKey = `POKEMON_DETAIL_${id}`;
    const cachedDetail = await AsyncStorage.getItem(cacheKey);
    if (cachedDetail) return JSON.parse(cachedDetail);

    // Fetch Basic Details
    const response = await fetch(`${BASE_URL}/pokemon/${id}`);
    const data = await response.json();

    // Fetch Species Data (for flavor text)
    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();

    // Find English flavor text
    const flavorTextEntry = speciesData.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    const description = flavorTextEntry
      ? flavorTextEntry.flavor_text.replace(/[\n\f]/g, ' ')
      : "No data available.";

    const details = {
      id: data.id,
      name: data.name,
      height: data.height,
      weight: data.weight,
      types: data.types.map(t => t.type.name),
      stats: data.stats,
      abilities: data.abilities.map(a => a.ability.name),
      description: description,
      image: data.sprites.other['official-artwork'].front_default,
    };

    // Cache this specific pokemon's details
    await AsyncStorage.setItem(cacheKey, JSON.stringify(details));
    return details;

  } catch (error) {
    console.error("Error fetching details:", error);
    return null;
  }
};
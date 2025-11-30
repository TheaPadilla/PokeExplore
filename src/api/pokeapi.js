import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://pokeapi.co/api/v2';
const LIST_CACHE_KEY = 'POKEMON_LIST_CACHE';

// Helper to extract ID from URL (e.g., "https://.../pokemon/1/" -> "1")
const getIdFromUrl = (url) => url.split('/')[6];

export const fetchPokemonList = async (limit = 151) => {
  try {
    const cachedData = await AsyncStorage.getItem(LIST_CACHE_KEY);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}`);
    const data = await response.json();

    const formattedList = data.results.map((item, index) => {
      const id = index + 1;
      return {
        ...item,
        id,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      };
    });

    await AsyncStorage.setItem(LIST_CACHE_KEY, JSON.stringify(formattedList));
    return formattedList;
  } catch (error) {
    console.error("Error fetching list:", error);
    return [];
  }
};

export const fetchPokemonDetails = async (id) => {
  try {
    const cacheKey = `POKEMON_DETAIL_${id}`;
    const cachedDetail = await AsyncStorage.getItem(cacheKey);
    if (cachedDetail) return JSON.parse(cachedDetail);

    // 1. Fetch Basic Pokemon Data
    const response = await fetch(`${BASE_URL}/pokemon/${id}`);
    const data = await response.json();

    // 2. Fetch Species Data (Flavor Text + Evolution URL)
    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();

    // 3. Fetch Evolution Chain
    const evoRes = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoRes.json();

    // 4. Parse Evolution Chain
    const evolutions = [];
    let currentEvo = evoData.chain;

    while (currentEvo) {
      const evoId = getIdFromUrl(currentEvo.species.url);
      evolutions.push({
        id: evoId,
        name: currentEvo.species.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoId}.png`
      });
      // Move to next evolution (taking the first path for simplicity)
      // This handles linear evolutions well (Bulbasaur -> Ivysaur -> Venusaur)
      currentEvo = currentEvo.evolves_to[0];
    }

    // 5. Get Flavor Text
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
      evolutions: evolutions, // New field added
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(details));
    return details;

  } catch (error) {
    console.error("Error fetching details:", error);
    return null;
  }
};
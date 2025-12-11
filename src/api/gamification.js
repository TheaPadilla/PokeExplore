import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const BADGES = {
  NOVICE: { id: 'novice', name: 'Novice Researcher', icon: '🥉', threshold: 5 },
  EXPERT: { id: 'expert', name: 'Expert Handler', icon: '🥈', threshold: 20 },
  MASTER: { id: 'master', name: 'Pokemon Master', icon: '🥇', threshold: 50 },
  TYPE_COLLECTOR: { id: 'collector', name: 'Type Collector', icon: '🌈', threshold: 10 },
};

const CHALLENGE_TYPES = ['grass', 'fire', 'water', 'bug', 'normal', 'poison', 'electric'];

// Helper to generate a random challenge
const generateDailyChallenge = () => {
  const targetType = CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)];
  const today = new Date().toDateString();

  return {
    date: today,
    description: `Log a ${targetType.toUpperCase()} type Pokémon`,
    targetType: targetType,
    completed: false,
    reward: 100 // Points reward
  };
};

// 1. Get or Create User Stats (Auto-Repair)
export const getUserStats = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // Check if daily challenge needs reset
    const data = userSnap.data();
    const today = new Date().toDateString();

    // Safety check: If dailyChallenge is missing or old, update it
    if (!data.dailyChallenge || data.dailyChallenge.date !== today) {
      const newChallenge = generateDailyChallenge();
      await updateDoc(userRef, { dailyChallenge: newChallenge });
      return { ...data, dailyChallenge: newChallenge };
    }
    return data;
  } else {
    // Initialize new user stats if they don't exist
    const newStats = {
      points: 0,
      discoveries: 0,
      badges: [],
      caughtPokemon: [],
      dailyChallenge: generateDailyChallenge(),
    };
    await setDoc(userRef, newStats);
    return newStats;
  }
};

// 4. Register a Discovery (Robust Version)
export const registerDiscovery = async (userId, pokemonDetails) => {
  const userRef = doc(db, 'users', userId);

  // 1. Ensure User Data Exists First
  // This calls the function above to create/repair the profile if needed
  await getUserStats(userId);

  // 2. Now fetch the guaranteed data
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  // Prevent duplicate points for same pokemon
  if (data.caughtPokemon && data.caughtPokemon.includes(pokemonDetails.id)) {
     return "Already Registered! (No new points)";
  }

  const updates = {
    discoveries: increment(1),
    points: increment(10),
    caughtPokemon: arrayUnion(pokemonDetails.id)
  };

  let message = "Discovery Logged! +10 pts";

  // Check Daily Challenge (Safe Check)
  const challenge = data.dailyChallenge;
  if (challenge && !challenge.completed && pokemonDetails.types && pokemonDetails.types.includes(challenge.targetType)) {
    updates['dailyChallenge.completed'] = true;
    updates.points = increment(10 + challenge.reward);
    message = `Challenge Complete! +${10 + challenge.reward} pts`;
  }

  // Check Badges
  const currentCount = (data.discoveries || 0) + 1;
  const newBadges = [];

  if (currentCount === BADGES.NOVICE.threshold) newBadges.push(BADGES.NOVICE.id);
  if (currentCount === BADGES.EXPERT.threshold) newBadges.push(BADGES.EXPERT.id);
  if (currentCount === BADGES.MASTER.threshold) newBadges.push(BADGES.MASTER.id);

  if (newBadges.length > 0) {
    updates.badges = arrayUnion(...newBadges);
    message += "\nNew Badge Earned!";
  }

  await updateDoc(userRef, updates);
  return message;
};

// 5. Release a Pokemon
export const releasePokemon = async (userId, pokemonId) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    caughtPokemon: arrayRemove(pokemonId)
  });
};
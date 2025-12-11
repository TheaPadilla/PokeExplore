import React, { createContext, useState, useContext } from 'react';

const PokemonContext = createContext();

export const PokemonProvider = ({ children }) => {
  // This state holds all the pokemon you have caught
  const [caughtPokemon, setCaughtPokemon] = useState([]);

  const addPokemon = (pokemon) => {
    const newCatch = {
      ...pokemon,
      uniqueId: Date.now(), // Unique ID so you can catch the same species multiple times
      captureDate: new Date().toLocaleDateString()
    };
    setCaughtPokemon((prev) => [newCatch, ...prev]);
  };

  return (
    <PokemonContext.Provider value={{ caughtPokemon, addPokemon }}>
      {children}
    </PokemonContext.Provider>
  );
};

export const usePokemon = () => useContext(PokemonContext);
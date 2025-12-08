// src/components/ARCamera.js
import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";

const ARCamera = forwardRef((props, ref) => {
  console.log("ARCamera mounted");

  const cameraRef = useRef(null);

  const devices = useCameraDevices();
  const backDevice = devices.back;

  const device = backDevice || devices[0] || null;

  const [permission, setPermission] = useState(null);

  // ⭐ Store random Pokémon ID
  const [spawnedPokemonId, setSpawnedPokemonId] = useState(null);

  // ⭐ Pick a random Pokémon on mount
  useEffect(() => {
    const randomId = [1, 4, 7, 25][Math.floor(Math.random() * 4)]; // Bulba, Char, Squirtle, Pikachu
    setSpawnedPokemonId(randomId);
  }, []);

  // Logging
  useEffect(() => {
    console.log("ALL DEVICES =", devices);
    console.log("BACK DEVICE =", backDevice);
    console.log("USED DEVICE =", device);
  }, [devices]);

  // Ask permission
  useEffect(() => {
    (async () => {
      try {
        const status = await Camera.requestCameraPermission();
        setPermission(status === "authorized" || status === "granted");
      } catch (e) {
        console.warn("Camera permission request error:", e);
        setPermission(false);
      }
    })();
  }, []);

  // ⭐ Expose functions to parent
  useImperativeHandle(ref, () => ({
    takePhoto: async (options) => {
      if (cameraRef.current) {
        return await cameraRef.current.takePhoto(options);
      }
    },
    getSpawnedPokemon: () => spawnedPokemonId, // VERY IMPORTANT
  }));

  if (permission === null || !device) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#fbbf24" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (permission === false) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: "#fff" }}>Camera permission denied. Enable it in Settings.</Text>
      </View>
    );
  }

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spawnedPokemonId}.png`;

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* AR Pokémon overlay */}
      <Image
        source={{ uri: spriteUrl }}
        style={styles.sprite}
        resizeMode="contain"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fbbf24",
    backgroundColor: "#000",
    marginBottom: 12,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 8,
  },
  sprite: {
    position: "absolute",
    width: 180,
    height: 180,
    left: "20%",
    top: "10%",
    opacity: 0.95,
  },
});

export default ARCamera;

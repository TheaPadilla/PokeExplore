import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./src/navigation/AuthStack";
import MainStack from "./src/navigation/MainStack";
import { auth } from "./src/firebase/firebase"; // Imports the auth instance

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Removed unnecessary parentheses around 'auth'.
    // 'auth' is the object instance, so we call its method directly.
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe; // cleanup on unmount
  }, []);

  if (loading) {
    // Return a splash screen or loading indicator while checking auth state
    // Note: For simplicity, returning null, but a full loading component is better practice.
    return null;
  }

  return (
    <NavigationContainer>
      {/* Renders MainStack if user is logged in, AuthStack otherwise */}
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
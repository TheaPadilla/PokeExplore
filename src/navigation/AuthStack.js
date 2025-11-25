import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screen/auth/LoginScreen";
import SignupScreen from "../screen/auth/SignupScreen";
import { auth } from '../firebase/firebase';
const Stack = createNativeStackNavigator();

function handleSignup(email, password) {
  // Use the imported 'auth' object here
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      console.log("User created:", userCredential.user);
    })
    .catch(error => {
      console.error("Signup failed:", error.message);
    });
}

export default function AuthStack() {
  /* * NOTE ON FIREBASE ERROR: The error "Cannot find module '../firebase/firebase'" 
   * needs to be fixed inside the imported screen components (LoginScreen.js 
   * and SignupScreen.js).
   * * If your screens are at 'src/screen/auth/', the correct import path inside 
   * those files must use two levels of '..':
   * * import { auth } from '../../firebase/firebase'; 
   */
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./src/screens/Home";
import Login from "./src/screens/Login";
import AddPost from "./src/screens/AddPost";
import Register from "./src/screens/Register";
import Profile from "./src/screens/Profile"; // Contoh layar lain untuk tab
import { ApolloProvider } from "@apollo/client";
import client from "./src/config/graphql";
import AuthContext from "./src/contexts/AuthContext";
import { useState } from "react";
import useIsSignedIn from "./src/hooks/useIsSignedIn";
import useIsSignedOut from "./src/hooks/useIsSignedOut";
import MyTabBar from "./src/components/MyTabBar";
import { AuthProvider } from "./src/contexts/AuthContext";
import Search from "./src/screens/Seacrh";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#000", // Header warna hitam
        },
        headerTintColor: "#fff", // Teks header warna putih
        tabBarStyle: {
          backgroundColor: "#000", // Bottom tab bar warna hitam
        },
        tabBarActiveTintColor: "#fff", // Warna aktif tab
        tabBarInactiveTintColor: "#888", // Warna tidak aktif tab
      }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Search" component={Search} />
      <Tab.Screen name="AddPost" component={AddPost} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const isSignedIn = useIsSignedIn(); // Hook to check if signed in
  const isSignedOut = useIsSignedOut(); // Hook to check if signed out

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: "#000", // Header warna hitam
          },
          headerTintColor: "#fff", // Teks header warna putih
          headerTitleStyle: {
            fontWeight: "bold", // Gaya teks header
          },
        }}
      >
        {isSignedIn ? (
          <>
            {/* Tab Navigator */}
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          </>
        ) : isSignedOut ? (
          <>
            {/* Auth Screens */}
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
          </>
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <AppNavigator /> {/* Router atau Komponen Utama */}
      </AuthProvider>
    </ApolloProvider>
  );
}

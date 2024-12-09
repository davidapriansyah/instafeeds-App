import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { gql, useMutation } from "@apollo/client";

const REGISTER = gql`
  mutation Register($newUser: RegisterInput!) {
    register(newUser: $newUser) {
      message
    }
  }
`;

export default function Register() {
  const navigation = useNavigation();
  const [register, { data, loading, error }] = useMutation(REGISTER);

  const [input, setInput] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const handleRegister = () => {
    register({
      variables: {
        newUser: input,
      },
    });
    navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, paddingBottom: 30 }}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 80 }]}
      >
        <Text style={styles.logo}>InstaFeeds</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#888"
          onChangeText={(text) =>
            setInput({
              ...input,
              name: text,
            })
          }
          value={input.name}
        />

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#888"
          onChangeText={(text) =>
            setInput({
              ...input,
              username: text,
            })
          }
          value={input.username}
        />

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#888"
          onChangeText={(text) =>
            setInput({
              ...input,
              email: text,
            })
          }
          value={input.email}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry
          onChangeText={(text) =>
            setInput({
              ...input,
              password: text,
            })
          }
          value={input.password}
        />

        <TouchableOpacity style={styles.registerButton}>
          <Text style={styles.registerButtonText} onPress={handleRegister}>
            Sign Up
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>
            Already have an account?{" "}
            <Text style={styles.loginLink}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingBottom: 30, // added bottom padding to prevent keyboard from covering button
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#222",
    borderRadius: 8,
    paddingHorizontal: 15,
    color: "#fff",
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: "#3498db",
    width: "100%",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginText: {
    color: "#888",
  },
  loginLink: {
    color: "#3498db",
  },
});

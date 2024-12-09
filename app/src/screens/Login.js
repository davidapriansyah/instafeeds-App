import { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AuthContext from "../contexts/AuthContext";
import { gql, useMutation } from "@apollo/client";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";

const LOGIN = gql`
  mutation Mutation($user: LoginInput) {
    login(user: $user) {
      access_token
    }
  }
`;

export default function Login() {
  const authContext = useContext(AuthContext);
  const [loginFn, { data, loading, error }] = useMutation(LOGIN);
  const navigation = useNavigation();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const access_token = await SecureStore.getItemAsync("access_token");
        if (access_token) {
          authContext.setIsLogin(true);
        } else {
          console.log("No token found");
        }
      } catch (err) {
        console.error("Error fetching token:", err);
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    if (data && data.login && data.login.access_token) {
      const saveToken = async () => {
        try {
          await SecureStore.setItemAsync(
            "access_token",
            data.login.access_token
          );
          authContext.setIsLogin(true);
        } catch (err) {
          console.error("Error saving token:", err);
        }
      };
      saveToken();
    }
  }, [data]);

  console.log(data);

  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      await loginFn({
        variables: {
          user: input,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>InstaFeeds</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone number, username or email"
        placeholderTextColor="#888"
        onChangeText={(text) => setInput({ ...input, email: text })}
        value={input.email}
        inputMode="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry={true}
        onChangeText={(text) => setInput({ ...input, password: text })}
        value={input.password}
      />

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => handleLogin()}
      >
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>OR</Text>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don’t have an account?</Text>
        <Pressable
          onPress={() => {
            navigation.navigate("Register");
          }}
        >
          <Text style={styles.signUpLink}> Sign Up.</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
    fontFamily: "Billabong", // You may need to load a custom font to get the Instagram logo style
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
  loginButton: {
    backgroundColor: "#3498db",
    width: "100%",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    color: "#888",
    marginVertical: 20,
  },
  signUpContainer: {
    flexDirection: "row",
  },
  signUpText: {
    color: "#888",
  },
  signUpLink: {
    color: "#3498db",
  },
});

import { gql, useMutation } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { GET_POST } from "./Home";

const ADD_POST = gql`
  mutation AddPost($newPost: PostInput!) {
    addPost(newPost: $newPost) {
      message
    }
  }
`;

export default function CreatePost() {
  const navigation = useNavigation();

  const [addPost, { data, loading, error }] = useMutation(ADD_POST, {
    refetchQueries: [GET_POST],
  });

  const [input, setInput] = useState({
    content: "",
    imgUrl: "",
    tags: [""],
  });

  // Reset form inputs when the component is re-mounted
  useEffect(() => {
    setInput({
      content: "",
      imgUrl: "",
      tags: [""],
    });
  }, []);

  const handleAdd = () => {
    addPost({
      variables: {
        newPost: input,
      },
    });
    navigation.navigate("Home");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.header}>Create a New Post</Text>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#ff4444"
            style={styles.loading}
          />
        )}

        {error && <Text style={styles.errorText}>{error.message}</Text>}

        <Text style={styles.label}>Content</Text>
        <TextInput
          value={input.content}
          style={styles.input}
          onChangeText={(text) =>
            setInput({
              ...input,
              content: text,
            })
          }
          placeholder="What's on your mind?"
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>Image URL</Text>
        <TextInput
          value={input.imgUrl}
          style={styles.input}
          onChangeText={(text) =>
            setInput({
              ...input,
              imgUrl: text,
            })
          }
          placeholder="Enter image URL"
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          value={input.tags}
          style={[styles.input, styles.inputDesc]}
          onChangeText={(text) =>
            setInput({
              ...input,
              tags: text.split(","),
            })
          }
          placeholder="e.g. #fun, #tech"
          placeholderTextColor="#aaa"
          multiline={true}
        />

        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Add Post</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
  },
  scrollView: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff", // White text for the header
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: "#fff", // White text for labels
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#444", // Dark border color
    backgroundColor: "#1a1a1a", // Dark input background
    marginBottom: 15,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    fontSize: 16,
    color: "#fff", // White text inside input fields
  },
  inputDesc: {
    height: 150,
  },
  button: {
    backgroundColor: "#ff4444", // Red button color
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff", // White text for the button
    fontSize: 18,
    fontWeight: "bold",
  },
  loading: {
    marginVertical: 20,
  },
  errorText: {
    color: "#ff4444", // Red error text
    fontSize: 16,
    marginBottom: 20,
  },
});

import React, { useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// GraphQL query for searching users
const SEARCH = gql`
  query SearchUserByName($nameSearch: SearchUser) {
    searchUserByName(nameSearch: $nameSearch) {
      username
      name
    }
  }
`;

export default function Search() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState(""); // State for user input
  const [searchUserByName, { data, loading, error }] = useLazyQuery(SEARCH, {
    fetchPolicy: "network-only", // Always fetch fresh data
  });

  // Execute the search query
  const handleSearch = () => {
    if (searchQuery.trim() === "") return; // Skip empty searches
    searchUserByName({
      variables: {
        nameSearch: {
          keyword: searchQuery,
        },
      },
    });
  };

  // Navigate to the selected user's profile
  const handleNavigateToProfile = (username) => {
    navigation.navigate("UserProfile", { username }); // Navigate to 'UserProfile' screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Users</Text>

      {/* Input Field */}
      <TextInput
        style={styles.input}
        placeholder="Enter a name or username..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
        onSubmitEditing={handleSearch} // Trigger search on Enter
      />

      {/* Loading State */}
      {loading && <Text style={styles.loading}>Searching...</Text>}

      {/* Error State */}
      {error && (
        <Text style={styles.error}>
          Error: {error.message || "Something went wrong"}
        </Text>
      )}

      {/* Results */}
      {data && data.searchUserByName.length > 0 ? (
        <FlatList
          data={data.searchUserByName}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => handleNavigateToProfile(item.username)}
            >
              <Text style={styles.username}>{item.username}</Text>
              {/* <Text style={styles.name}>{item.name}</Text> */}
            </TouchableOpacity>
          )}
        />
      ) : (
        data &&
        data.searchUserByName.length === 0 && (
          <Text style={styles.noResults}>No users found.</Text>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#000", // Background hitam
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#fff", // Teks putih
  },
  input: {
    borderWidth: 1,
    borderColor: "#444", // Border abu-abu gelap
    backgroundColor: "#222", // Background abu-abu gelap
    color: "#fff", // Teks putih
    padding: 8,
    marginBottom: 16,
    borderRadius: 8,
  },
  loading: {
    textAlign: "center",
    marginTop: 16,
    color: "#888", // Teks abu-abu
  },
  error: {
    textAlign: "center",
    marginTop: 16,
    color: "red", // Teks merah untuk error
  },
  noResults: {
    textAlign: "center",
    marginTop: 16,
    color: "#888", // Teks abu-abu untuk tidak ada hasil
  },
  userCard: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: "#111", // Kartu dengan warna hitam lebih terang
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333", // Border hitam terang
  },
  username: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff", // Teks putih
  },
  name: {
    fontSize: 14,
    color: "#aaa", // Teks abu-abu terang
  },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { gql, useQuery } from "@apollo/client";

export const GET_PROFILE = gql`
  query GetProfile {
    getProfile {
      username
      followingsDetail {
        name
      }
      followersDetail {
        name
      }
    }
  }
`;

export default function Profile() {
  const { data, loading, error } = useQuery(GET_PROFILE);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4444" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  const { username, followingsDetail, followersDetail } =
    data?.getProfile || {};

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        {/* Profile Picture */}
        <Image
          source={{
            uri: "https://fantech.id/wp-content/uploads/2023/11/luffy-1024x575.jpg", // Gambar Hardcoded
          }}
          style={styles.profileImage}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.username}>{username}</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Followers and Followings */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {followersDetail ? followersDetail.length : 0}
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {followingsDetail ? followingsDetail.length : 0}
          </Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Followers Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Followers</Text>
        {followersDetail && followersDetail.length > 0 ? (
          <FlatList
            data={followersDetail}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.itemText}>{item.name}</Text>
            )}
          />
        ) : (
          <Text style={styles.noDataText}>No followers yet!</Text>
        )}
      </View>

      {/* Followings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Following</Text>
        {followingsDetail && followingsDetail.length > 0 ? (
          <FlatList
            data={followingsDetail}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.itemText}>{item.name}</Text>
            )}
          />
        ) : (
          <Text style={styles.noDataText}>Not following anyone yet!</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  editProfileButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 14,
    color: "#bbb",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 10,
    fontWeight: "bold",
  },
  itemText: {
    fontSize: 16,
    color: "#fff",
  },
  noDataText: {
    fontSize: 16,
    color: "#bbb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
  },
});

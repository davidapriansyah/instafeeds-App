import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { gql, useMutation, useQuery } from "@apollo/client";
import * as SecureStore from "expo-secure-store";
import AuthContext from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
const { width } = Dimensions.get("window");

export const GET_POST = gql`
  query GetPost {
    getPost {
      _id
      author {
        username
      }
      content
      imgUrl
      comments {
        content
        username
      }
      likes {
        username
      }
      tags
    }
  }
`;

const LIKE = gql`
  mutation LikePost($like: LikeInput!) {
    likePost(like: $like) {
      message
    }
  }
`;

export const GET_PROFILE = gql`
  query GetProfile {
    getProfile {
      username
    }
  }
`;

export default function Home() {
  const navigation = useNavigation();
  const authContext = useContext(AuthContext);

  const { loading, error, data } = useQuery(GET_POST, {
    fetchPolicy: "network-only", // Selalu ambil data terbaru
  });
  const {
    loading: loadingProfile,
    error: errorProfile,
    data: profileData,
  } = useQuery(GET_PROFILE);

  const [like] = useMutation(LIKE);
  const [showLikes, setShowLikes] = useState(null);
  const [showComments, setShowComments] = useState(null);

  if (loading || loadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error || errorProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error: {error?.message || errorProfile?.message}
        </Text>
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("access_token");
      authContext.setIsLogin(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const username = profileData?.getProfile?.username;
  const handleLike = async (postId) => {
    if (!username) {
      console.error("User not authenticated.");
      return;
    }

    if (!postId) {
      console.error("Invalid post ID.");
      return;
    }

    try {
      // Cari apakah user sudah like berdasarkan cache
      const post = data?.getPost.find((post) => post._id === postId);
      const isLiked = post?.likes.some((like) => like.username === username);

      // Jika belum ada status valid, lanjutkan request
      await like({
        variables: {
          like: { postId },
        },
        optimisticResponse: {
          likePost: {
            __typename: "Mutation",
            message: isLiked ? "Unliked successfully" : "Liked successfully",
          },
        },
        update: (cache) => {
          const existingPosts = cache.readQuery({ query: GET_POST });

          const updatedPosts = existingPosts.getPost.map((post) => {
            if (post._id === postId) {
              return {
                ...post,
                likes: isLiked
                  ? post.likes.filter((like) => like.username !== username) // Unliking
                  : [...post.likes, { username }], // Liking
              };
            }
            return post;
          });

          cache.writeQuery({
            query: GET_POST,
            data: { getPost: updatedPosts },
          });
        },
      });
    } catch (err) {
      console.error("Error liking the post:", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>InstaFeeds</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data?.getPost || []}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            <View style={styles.postHeader}>
              <Text style={styles.username}>{item.author.username}</Text>
            </View>

            <Pressable
              onPress={() =>
                navigation.navigate("getPostById", {
                  id: item._id,
                })
              }
            >
              <Image
                source={{
                  uri: item.imgUrl || "https://via.placeholder.com/300",
                }}
                style={styles.postImage}
                resizeMode="cover"
              />
            </Pressable>

            <View style={styles.postDetails}>
              <Text style={styles.content}>{item.content}</Text>
              <Text style={styles.content}>{item.tags}</Text>
              <TouchableOpacity
                onPress={() => handleLike(item._id)}
                style={styles.likeButton}
              >
                <Ionicons
                  name={
                    item.likes.some((like) => like.username === username)
                      ? "heart"
                      : "heart-outline"
                  }
                  size={20}
                  color={
                    item.likes.some((like) => like.username === username)
                      ? "#ff4444"
                      : "#fff"
                  }
                />
                <Text style={styles.likes}>{item.likes.length} likes</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.commentsSection}>
              <TouchableOpacity
                onPress={() =>
                  setShowComments(showComments === item._id ? null : item._id)
                }
                style={styles.commentButton}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                <Text style={styles.commentText}>
                  {item.comments.length} comments
                </Text>
              </TouchableOpacity>

              {showLikes === item._id && (
                <View style={styles.showLikesContainer}>
                  {item.likes.map((like, index) => (
                    <Text key={index} style={styles.likeUsername}>
                      {like.username}
                    </Text>
                  ))}
                </View>
              )}

              {showComments === item._id && (
                <View style={styles.showCommentsContainer}>
                  {item.comments.map((comment, index) => (
                    <Text key={index} style={styles.comment}>
                      <Text style={styles.commentUsername}>
                        {comment.username}:{" "}
                      </Text>
                      {comment.content}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1a1a1a", // Darker header
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 14,
    color: "#ff4444",
    marginLeft: 5,
  },
  separator: {
    height: 10,
    backgroundColor: "#333",
  },
  postContainer: {
    backgroundColor: "#1a1a1a",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    marginHorizontal: 10,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
  postImage: {
    width: width - 20,
    height: 300,
    borderRadius: 8,
    marginBottom: 10,
  },
  postDetails: {
    paddingTop: 5,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  likes: {
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 5,
    color: "#fff",
  },
  content: {
    fontSize: 14,
    marginBottom: 5,
    color: "#ddd",
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: "#fff",
    marginLeft: 5,
  },
  commentsSection: {
    paddingTop: 5,
  },
  showLikesContainer: {
    paddingTop: 5,
  },
  showCommentsContainer: {
    paddingTop: 5,
  },
  comment: {
    flexDirection: "row",
    fontSize: 14,
    marginBottom: 3,
    color: "#ddd",
  },
  commentUsername: {
    fontWeight: "bold",
    color: "#fff",
  },
  likeUsername: {
    fontSize: 14,
    color: "#fff",
  },
});

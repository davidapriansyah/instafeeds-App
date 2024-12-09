import Posts from "../models/Post.js";
import redis from "../config/redis.js";

const typeDefs = `#graphql

  type Comment {
    content: String!
    username: String!
    createdAt: String
    updatedAt: String
  }

  type Like {
    username: String!
    createdAt: String
    updatedAt: String
  }
  
  type Author {
      _id: ID
    name: String
    username: String
    email: String
    }

  type Post {
    _id: ID!
    content: String!
    tags: [String]
    imgUrl: String
    authorId: ID!
    comments: [Comment]
    likes: [Like]
    createdAt: String
    updatedAt: String
    author: Author
  }

  type Response {
    message: String
  }

  input PostInput {
    content: String!
    tags: [String]
    imgUrl: String
  }

  input CommentInput {
    postId: ID!
    content: String!
  }

  input LikeInput {
    postId: ID!
  }

  type Query {
    getPost: [Post]
    getPostById(id: String) : Post
  }

  type Mutation {
    addPost(newPost: PostInput!): Response
    commentPost(comment: CommentInput!): Response
    likePost(like: LikeInput!): Response
  }
`;

const resolvers = {
  Query: {
    getPost: async (_, args, context) => {
      try {
        await context.authN();

        const cachedPosts = await redis.get("posts");
        // console.log(cachedPosts, "ini cached");
        if (cachedPosts) return JSON.parse(cachedPosts);
        // console.log("apa aja");
        const posts = await Posts.getPost();
        // console.log(posts);
        await redis.set("posts", JSON.stringify(posts));
        return posts;
      } catch (error) {
        throw new Error("Error retrieving posts");
      }
    },

    getPostById: async (_, args, context) => {
      try {
        await context.authN();
        const { id } = args;
        // console.log(id);

        const post = await Posts.getPostById(id);

        if (!post) {
          throw new Error("Post not found");
        }
        return post;
      } catch (error) {
        throw new Error("Error retrieving post by ID: " + error.message);
      }
    },
  },
  Mutation: {
    addPost: async (_, args, context) => {
      try {
        // Ensure the user is authenticated
        const user = await context.authN();
        // console.log(user);
        if (!user || !user.user._id) throw new Error("Authentication required");

        const { content, imgUrl, tags } = args.newPost;
        // console.log(user.user[0]._id, "ini usernya");
        const addPost = await Posts.addPost({
          content,
          imgUrl,
          tags,
          authorId: user.user._id,
        });

        await redis.del("posts");
        return addPost;
      } catch (error) {
        throw new Error("Error adding post: " + error.message);
      }
    },

    commentPost: async (_, args, context) => {
      try {
        // Ensure the user is authenticated
        const user = await context.authN();
        // console.log(user);
        if (!user || !user.user.username)
          throw new Error("Authentication required");

        const { postId, content } = args.comment;

        // Use the logged-in user's email as the username
        const response = await Posts.commentPost(postId, {
          content,
          username: user.user.username,
        });
        return response;
      } catch (error) {
        throw new Error("Error adding comment: " + error.message);
      }
    },

    likePost: async (_, args, context) => {
      try {
        // Ensure the user is authenticated
        const user = await context.authN();
        const { postId } = args.like;
        const username = user.user.username;

        // Use the logged-in user's email as the username
        const response = await Posts.likePost(postId, username);
        return response;
      } catch (error) {
        throw new Error("Error liking post: " + error.message);
      }
    },
  },
};

export { typeDefs, resolvers };

import User from "../models/User.js";
import { ObjectId } from "mongodb";

const typeDefs = `#graphql
  type User {
    _id: ID
    name: String
    username: String
    email: String
    followingsDetail : [Following]
    followersDetail : [Following]
  }

  type Following {
    _id: ID
    name: String
    username: String
    email: String
  }

  type GeneralResponse {
    message: String
  }

  type LoginResponse {
    access_token: String
  }

  input RegisterInput {
    name: String!
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input SearchUser {
    keyword: String!
  }

  type Query {
    getUserById(id: ID) : User
    getProfile: User
    searchUserByName(nameSearch: SearchUser): [User]
  }

  type Mutation {
      login(user: LoginInput): LoginResponse
    register(newUser: RegisterInput!): GeneralResponse
  }
`;

const resolvers = {
  Query: {
    // Login user

    // Get user profile
    getProfile: async (_, args, context) => {
      try {
        const { user } = await context.authN();
        // console.log(user, "ini usernya");
        const result = await User.findUserById(user._id);
        return result;
      } catch (error) {
        console.log(error);
        throw new Error("Failed to get profile");
      }
    },

    getUserById: async (_, args, context) => {
      try {
        await context.authN();
        const user = await User.findUserById(args.id);
        // console.log(user);
        return user;
      } catch (error) {
        console.log(error);
        throw new Error("Failed to get id" + error.message);
      }
    },

    // Search users by name
    searchUserByName: async (_, args, context) => {
      try {
        await context.authN();
        const { keyword } = args.nameSearch;
        const users = await User.searchUserByName(keyword);
        return users;
      } catch (error) {
        console.log(error);
        throw new Error("Failed to search users by name");
      }
    },
  },

  Mutation: {
    // Register a new user
    register: async (_, args) => {
      try {
        const { name, username, email, password } = args.newUser;

        const response = await User.register({
          name,
          username,
          email,
          password,
        });

        return response;
      } catch (error) {
        console.log(error);
        throw new Error(error.message);
      }
    },

    login: async (_, args) => {
      try {
        const { email, password } = args.user;

        const response = await User.login({ email, password });

        return response;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};

export { typeDefs, resolvers };

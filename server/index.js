import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import {
  typeDefs as userTypeDefs,
  resolvers as userResolvers,
} from "./schemas/userSchema.js";

import {
  typeDefs as postTypeDefs,
  resolvers as postResolvers,
} from "./schemas/postSchema.js";

import {
  typeDefs as followTypeDefs,
  resolvers as followResolvers,
} from "./schemas/followSchema.js";

import "dotenv/config";
import authentication from "./middlewares/authentication.js";

const server = new ApolloServer({
  introspection: true,
  typeDefs: [userTypeDefs, postTypeDefs, followTypeDefs],
  resolvers: [userResolvers, postResolvers, followResolvers],
});

const { url } = await startStandaloneServer(server, {
  context: async ({ req, res }) => {
    return {
      authN: async () => authentication(req),
    };
  },
  listen: { port: process.env.PORT },
});

console.log(`🚀  Server Always ready at: ${url}`);

import { ObjectId } from "mongodb";
import Follow from "../models/Follow.js";

const typeDefs = `#graphql
    type Follow {
        _id: ID!
        followingId: ID!
        followerId: ID!
        createdAt: String
        updatedAt: String
    }

    type GeneralResponse {
      message: String!
    }
    input FollowInput {
     followingId: String
    }

    type Mutation {
        followUser(input: FollowInput): GeneralResponse
    }
`;

const resolvers = {
  Mutation: {
    followUser: async (_, args, context) => {
      try {
        const user = await context.authN();
        // console.log(user);
        const { followingId } = args.input;
        const followerId = user.user._id;

        if (followerId.toString() === followingId) {
          throw new Error("You Can't follow yourself");
        }

        const response = await Follow.followUser({ followerId, followingId });
        return response;
      } catch (error) {
        throw new Error("Error processing" + error.message);
      }
    },
  },
};

export { typeDefs, resolvers };

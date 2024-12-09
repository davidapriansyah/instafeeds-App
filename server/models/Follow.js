import { db } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

export default class Follow {
  static getFollowCollection() {
    return db.collection("follows");
  }

  static async followUser({ followerId, followingId }) {
    if (!followerId || !followingId) {
      throw new Error("Both followerId and followingId are required");
    }

    const followCollection = this.getFollowCollection();
    const followInput = {
      followerId: new ObjectId(followerId),
      followingId: new ObjectId(followingId),
    };

    const existingFollow = await followCollection.findOne(followInput);

    if (existingFollow) {
      throw new Error("Follow Already Exist");
    }

    const follow = {
      followerId: new ObjectId(followerId),
      followingId: new ObjectId(followingId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await followCollection.insertOne(follow);
    return { message: "Follow Success" };
  }
}

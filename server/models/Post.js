import { db } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

export default class Posts {
  static getPostCollection() {
    return db.collection("posts");
  }

  static async getPost() {
    const collection = this.getPostCollection();
    const posts = await collection
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        {
          $sort: {
            updatedAt: -1,
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            "author.password": 0,
          },
        },
      ])
      .toArray();

    // console.log(posts[0], "ini posts model");
    return posts;
  }

  static async getPostById(id) {
    const collection = this.getPostCollection();
    // console.log(id, "ini id");
    const posts = await collection
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },

        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            "author.password": 0,
          },
        },
      ])
      .toArray();

    return posts[0];
  }

  static async addPost(payload) {
    const { content, tags, imgUrl, authorId } = payload; // Include authorId in payload

    // Validation
    if (!content) throw new Error("Content is required");

    const post = {
      content,
      tags: tags || [],
      imgUrl: imgUrl || "",
      authorId: new ObjectId(authorId), // Use the logged-in user's ID
      comments: [],
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = this.getPostCollection();
    const result = await collection.insertOne(post);
    return {
      message: "Successfully added post",
    };
  }

  static async commentPost(postId, comment) {
    const { content, username } = comment;

    if (!content) throw new Error("Comment content is required");
    if (!username) throw new Error("Username is required");

    const newComment = {
      content,
      username,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = this.getPostCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: newComment }, $set: { updatedAt: new Date() } }
    );

    return {
      message: "Successfully added comment",
    };
  }

  static async likePost(postId, username) {
    const collection = this.getPostCollection();

    if (!username) throw new Error("Username is required");

    //cek data yang mau di like
    const data = await collection.findOne({
      _id: new ObjectId(postId),
      "likes.username": username,
    });

    if (data) {
      throw new Error("You have already liked this post");
    }

    const newLike = {
      username,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(postId) },
      { $push: { likes: newLike } }
    );

    return { message: "Successfully liked the post" };
  }
}

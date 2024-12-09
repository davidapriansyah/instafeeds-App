import { ObjectId } from "mongodb";
import { db } from "../config/mongodb.js";
import { hash, compare } from "../helpers/bcrypt.js";
import { signToken } from "../helpers/jwt.js";
import Posts from "./Post.js";

export default class User {
  static getUserCollection() {
    return db.collection("users");
  }

  // validasi email
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Register User
  static async register(payload) {
    const { name, username, email, password } = payload;

    // validasi
    if (!username) {
      throw new Error("Username is required");
    }
    if (!name) {
      throw new Error("Name is required");
    }

    if (!email) {
      throw new Error("Email is required");
    }

    if (!password) {
      throw new Error("Password is required");
    }

    if (password.length < 5) {
      throw new Error("Password must be at least 5 characters long");
    }
    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    const collection = this.getUserCollection();

    // Check unique username and email
    const existingUser = await collection.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      throw new Error("Username or Email already in use");
    }

    // Insert new user
    const regist = await collection.insertOne({
      name,
      username,
      email,
      password: hash(password),
    });

    return {
      message: "Successfuly added new user",
    };
  }

  // Login User
  static async login({ email, password }) {
    const collection = this.getUserCollection();

    const user = await collection.findOne({ email });
    // console.log(email);
    // console.log(user);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    if (!compare(password, user.password)) {
      throw new Error("Invalid email or password");
    }

    const payload = {
      _id: user._id,
      email: user.email,
      username: user.username,
    };
    const access_token = signToken(payload);

    return { message: "Login successful", access_token };
  }

  static async findUserById(id) {
    const collection = this.getUserCollection();

    const users = await collection
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },

        // mencari data following
        {
          $lookup: {
            from: "follows",
            localField: "_id",
            foreignField: "followerId",
            as: "followings",
          },
        },

        //menampilkan data following
        {
          $lookup: {
            from: "users",
            localField: "followings.followingId",
            foreignField: "_id",
            as: "followingsDetail",
          },
        },

        {
          $project: {
            password: 0,
            followings: 0,
            "followingsDetail.password": 0,
          },
        },

        //untuk mencari siapa yang ngefollow user ini
        {
          $lookup: {
            from: "follows",
            localField: "_id",
            foreignField: "followingId",
            as: "followers",
          },
        },

        //menampilkan nama follower dari user
        {
          $lookup: {
            from: "users",
            localField: "followers.followerId",
            foreignField: "_id",
            as: "followersDetail",
          },
        },
        {
          $project: {
            followers: 0,
            "followersDetail.password": 0,
          },
        },
      ])
      .toArray();

    // if (users.length < 1) {
    //   throw new Error("User Not Found");
    // }

    return users[0];
  }

  static async searchUserByName(keyword) {
    const collection = this.getUserCollection();
    const query = {
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { username: { $regex: keyword, $options: "i" } },
      ],
    };
    const users = await collection.find(query).toArray();

    return users;
  }
}

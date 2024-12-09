import { verifyToken } from "../helpers/jwt.js";
import User from "../models/User.js";
async function authentication(req) {
  const token = req.headers.authorization;
  // console.log(token);
  if (!token) {
    throw new Error("Unauthorized");
  }

  const access_token = token.split(" ")[1];

  const payload = verifyToken(access_token);
  if (!payload) {
    throw new Error("Unauthorized");
  }

  const user = await User.findUserById(payload._id);
  if (!user) {
    throw new Error("Unauthorized");
  }
  // console.log(user);

  return {
    user,
  };
}

export default authentication;

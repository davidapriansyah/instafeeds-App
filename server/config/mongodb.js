import { MongoClient } from "mongodb";
import "dotenv/config";

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

const db = client.db("instagram");

export { db };

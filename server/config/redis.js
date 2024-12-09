import Redis from "ioredis";
import "dotenv/config";
//redis://default:cQ2DHgvXYlcEVYleS5ak4s9u6PPVrguN@redis-11187.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com:11187

const redis = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
});

export default redis;

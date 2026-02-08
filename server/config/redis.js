let redisClient;

async function initRedis() {
  if (redisClient) return redisClient;

  const { createClient } = await import("redis");

  redisClient = createClient({
    url: "redis://localhost:6379",
  });

  redisClient.on("connect", () => {
    console.log("Redis client connected");
  });

  redisClient.on("error", (err) => {
    console.error("Redis error", err);
  });

  await redisClient.connect();
  return redisClient;
}

module.exports = initRedis;

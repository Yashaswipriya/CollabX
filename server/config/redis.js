let pub;
let sub;

async function initRedis() {
  if (pub && sub) return { pub, sub };

  const { createClient } = await import('redis');

  pub = createClient({ url: process.env.REDIS_URL });
  sub = createClient({ url: process.env.REDIS_URL });

  pub.on('connect', () => {
    console.log('Redis publisher connected');
  });

  sub.on('connect', () => {
    console.log('Redis subscriber connected');
  });

  pub.on('error', console.error);
  sub.on('error', console.error);

  await pub.connect();
  await sub.connect();

  return { pub, sub };
}

module.exports = initRedis;


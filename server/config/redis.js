let pub;
let sub;

async function initRedis() {
  if (pub && sub) return { pub, sub };

  const { createClient } = await import('redis');

  pub = createClient({ url: 'redis://localhost:6379' });
  sub = createClient({ url: 'redis://localhost:6379' });

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


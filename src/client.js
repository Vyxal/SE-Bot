import { Client } from "stackchat.js";
import config from "./config.js";
import db from "./db.js";

const client = new Client();

await client.login(
  config.login.site,
  config.login.email,
  config.login.password
);

await db.init("users");

client.userLevel = async (user) => {
  if (user == client.userId) return Infinity;
  const entry = await db.users.findOne({ user });
  return entry?.level ?? 0;
};

client.setUserLevel = async (user, level) => {
  await db.users.findOneAndUpdate(
    { user },
    { $set: { level } },
    { upsert: true }
  );
};

client.setPing = async (user, ping) => {
  await db.users.findOneAndUpdate(
    { user },
    { $set: { ping } },
    { upsert: true }
  );
};

client.hyperping = async () => {
  const names = [];

  for (const { user } of await db.users.find({ ping: true }).toArray()) {
    try {
      const name = (await client.fetchUser(user)).name;
      if (name) names.push(name);
    } catch {}
  }

  return names;
};

client.isPrivileged = async (user) =>
  (await client.isOwner(user)) || (await client.userLevel(user)) >= 1;
client.isAdmin = async (user) =>
  (await client.isOwner(user)) || (await client.userLevel(user)) >= 2;
client.isOwner = async (user) => config.owners.indexOf(user) != -1;

export default client;

import { Client } from "discord.js";
import client from "./client.js";
import config from "./config.js";

export default null;

const dclient = new Client({ intents: 131071 });

let collecting = false;
let queue = [];

dclient.on("messageCreate", async (message) => {
  if (!message.guild || message.channel.id != config.relay_channel) return;
  if (!message.author || message.author.bot) return;

  queue.push(message);

  if (!collecting) {
    collecting = true;
    setTimeout(runQueue, 10000);
  }
});

async function runQueue() {
  let messages = queue;
  queue = [];
  collecting = false;

  if (messages.length == 0) return;

  await client.room.send(
    "[Discord Relay]\n" +
      messages
        .map((message) => `${message.author.tag}: ${message.content}`)
        .join("\n")
  );
}

dclient.login(config.discord_token);

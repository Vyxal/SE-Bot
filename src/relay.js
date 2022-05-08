import he from "he";
import fetch from "node-fetch";
import { parse } from "node-html-parser";
import client from "./client.js";
import config from "./config.js";
import db from "./db.js";

export default null;

db.init("relay");

async function getRelayMessage(message) {
  const entry = await db.relay.findOne({ se: message });
  return entry?.dc;
}

async function createRelayMessage(se, dc) {
  await db.relay.insertOne({ se, dc });
}

client.on("messageCreate", async (message) => {
  if (message.room_id != message.client.room.id) return;
  if (
    message.user_id == message.client.userId &&
    message.content.startsWith("<div class='full'>[Discord Relay]")
  ) {
    return;
  }

  const { avatar } = await client.fetchUser(message.user_id);

  const res = await fetch(config.discord_webhook + "?wait=true", {
    method: "POST",
    body: JSON.stringify({
      content: translate(message),
      allowed_mentions: { parse: [] },
      username: message.user_name,
      avatar_url: avatar,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  try {
    const { id } = await res.json();
    await createRelayMessage(message.message_id, id);
  } catch {}
});

client.on("messageUpdate", async (_, message) => {
  const id = await getRelayMessage(message.message_id);
  if (!id) return;

  let content;

  try {
    content = translate(message);
  } catch {
    return;
  }

  await fetch(config.discord_webhook + "/messages/" + id, {
    method: "PATCH",
    body: JSON.stringify({
      content,
      allowed_mentions: { parse: [] },
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
});

client.on("messageDelete", async (_, message) => {
  const id = await getRelayMessage(message.message_id);
  if (!id) return;

  await fetch(config.discord_webhook + "/messages/" + id, {
    method: "DELETE",
  });
});

client.on("messageMoveOut", async (message) => {
  const id = await getRelayMessage(message.message_id);
  if (!id) return;

  await fetch(config.discord_webhook + "/messages/" + id, {
    method: "DELETE",
  });
});

function translate(message) {
  return unparse(parse(message.content));
}

function unparse(node) {
  if (node.nodeType == 3) {
    return he
      .decode(node._rawText)
      .replaceAll("`", "\\`")
      .replaceAll("*", "\\*")
      .replaceAll("_", "\\_")
      .replaceAll("~", "\\~");
  }

  if (node.querySelector(".onebox.ob-image")) {
    return "https:" + node.querySelector("a").getAttribute("href");
  }

  if (node.querySelector("br")) {
    return node
      .querySelector(".full")
      .innerHTML.replaceAll(/\s*<\/?\s*br\s*>\s*/g, "\n");
  }

  if (node.nodeType == 1) {
    let inner =
      node.rawTagName == "code" || node.rawTagName == "pre"
        ? he.decode(node.childNodes[0]._rawText)
        : node.childNodes.map(unparse).join("");

    switch (node.rawTagName) {
      case "b":
        return `**${inner}**`;
      case "strike":
        return `~~${inner}~~`;
      case "i":
        return `_${inner}_`;
      case "code":
        if (inner.indexOf("``") != -1) {
          inner = inner.replaceAll("`", "`\u200b");
        }

        if (inner.indexOf("`") != -1) {
          if (inner[0] == "`") inner = " " + inner;
          if (inner[inner.length - 1] == "`") inner += " ";
        }

        return `\`\`${inner}\`\``;
      case "pre":
        if (inner.indexOf("```") != -1) {
          inner = inner.replaceAll("``", "``\u200b");
        }
        return `\`\`\`\n${inner}\n\`\`\``;
      case "a":
        return `[${inner}](<${node.getAttribute("href")}>)`;
      case "br":
        return "\n";
    }

    return inner;
  } else {
    return `[${node.nodeType} ?]`;
  }
}

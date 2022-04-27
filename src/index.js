import he from "he";

import client from "./client.js";
import commands from "./commands.js";
import config from "./config.js";

import _server from "./server.js";
import _relay from "./relay.js";

process.on("uncaughtException", (error) => console.error(error.stack ?? error));

let room = (client.room = await client.joinRoom(config.room ?? 1));

console.log(`VyxalBot has started in: ${await room.fetchName()}`);

const replies = new Map();

async function getResponse(message, edited) {
    if ((message.target_user_id ?? message.user_id) == client.userId) return;

    const match = he
        .decode(message.content)
        .match(/^(!!\/|@vyx(a(l(b(ot?)?)?)?)?\s)\s*(.+)\s*$/i);

    if (match) {
        const remainder = match[6].trim();
        const command = remainder.split(/\s/)[0];
        const args = remainder.substring(command.length).trim();

        const fn = commands[command] ?? commands._;

        if (fn) {
            return await fn(
                commands[command] ? args : remainder,
                `:${message.message_id} `,
                message,
                edited
            );
        }
    }
}

client.on("messageCreate", async (message) => {
    if (message.room_id != room.id) return;

    const response = await getResponse(message, false);

    if (response) {
        replies.set(message.message_id, await room.send(response));
    }
});

client.on("messageUpdate", async (_, message) => {
    if (message.room_id != room.id) return;

    const response = await getResponse(message, true);

    const target = replies.get(message.message_id);

    if (response) {
        try {
            if (!target) throw 0;
            await client.editMessage(room.id, target, response);
        } catch {
            replies.set(message.message_id, await room.send(response));
        }
    } else if (target) {
        await client.editMessage(
            room.id,
            target,
            `:${message.message_id} (the original command was edited and no longer exists)`
        );
    }
});

client.on("messageDelete", async (_, message) => {
    if (message.room_id != room.id) return;

    const target = replies.get(message.message_id);

    if (target) {
        try {
            await client.deleteMessage(room.id, target);
        } catch {}
    }
});

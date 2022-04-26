import crypto from "crypto";
import express from "express";
import bodyparser from "body-parser";
import http from "http";
import config from "./config.js";
import client from "./client.js";
import { linkRepo, linkUser } from "./format.js";

const app = express();

export default app;

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(bodyparser.raw());

app.use((req, _, next) => {
    if (!req.headers["x-hub-signature-256"]) return;

    const hmac = crypto.createHmac("sha256", config.github_secret);
    const data = hmac.update(JSON.stringify(req.body));
    const hex = data.digest("hex");

    if (hex == req.headers["x-hub-signature-256"].slice(7)) {
        next();
    } else {
        req.sendStatus(201);
    }
});

app.post("/fork", (req, res) => {
    console.log(req.data);

    if (req.data.repository.private) return;

    client.room.send(
        `${linkUser(req.data.sender.login)} forked ${linkRepo(
            req.data.repository
        )} into ${linkRepo(req.data.forkee)}`
    );
});

http.createServer(app).listen(parseInt(process.argv[2]) || 5666);

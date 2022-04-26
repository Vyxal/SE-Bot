import crypto from "crypto";
import express from "express";
import bodyparser from "body-parser";
import http from "http";
import config from "./config.js";
import client from "./client.js";
import { linkRef, linkRepo, linkUser } from "./format.js";

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

    if (hex != req.headers["x-hub-signature-256"].slice(7)) {
        return res.sendStatus(201);
    }

    next();
});

app.use((req, _, next) => {
    if (!req?.body?.repository || req.body.repository.private) {
        return res.sendStatus(201);
    }

    next();
});

app.post("/branch-tag-created", (req, _) => {
    if (req.body.ref_type == "branch") {
        client.room.send(
            `${linkUser(req.body.sender.login)} created branch ${linkRef(
                req.body.ref,
                req.body
            )}`
        );
    }
});

app.post("/fork", (req, _) => {
    client.room.send(
        `${linkUser(req.body.sender.login)} forked ${linkRepo(
            req.body.repository
        )} into ${linkRepo(req.body.forkee)}`
    );
});

app.use((_, res) => res.sendStatus(200));

http.createServer(app).listen(parseInt(process.argv[2]) || 5666);

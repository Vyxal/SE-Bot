import crypto from "crypto";
import express from "express";
import bodyparser from "body-parser";
import http from "http";
import config from "./config.js";

const app = express();

export default app;

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(bodyparser.raw());

app.use((req, _, next) => {
    const hmac = crypto.createHmac("sha256", config.github_secret);
    const data = hmac.update(JSON.stringify(req.body));
    const hex = data.digest("hex");

    if (hex == req.headers["x-hub-signature-256"].slice(7)) {
        next();
    } else {
        req.sendStatus(201);
    }
});

app.get("/fork", (req, res) => {
    console.log(req.body);
});

http.createServer(app).listen(parseInt(process.argv[2]) || 5666);

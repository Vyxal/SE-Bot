import express from "express";
import expressVerifyHmacSignature from "express-verify-hmac-signature";
import bodyparser from "body-parser";
import http from "http";
import config from "./config.js";

const app = express();

export default app;

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(bodyparser.raw());

app.use(
    expressVerifyHmacSignature({
        algorithm: "sha256",
        secret: config.github_secret,
        getDigest: (req) => req.headers["x-hub-signature-256"],
        getBody: (req) => (req.body ? JSON.stringify(req.body) : undefined),
        encoding: "base64",
        onFailure: (_req, res, _next) => {
            console.log("Invalid webhook signature.");
            res.sendStatus(404);
        },
    })
);

app.get("/fork", (req, res) => {
    console.log(req.body);
});

http.createServer(app).listen(parseInt(process.argv[2]) || 5666);

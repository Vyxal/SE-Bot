import express from "express";
import bodyparser from "body-parser";
import http from "http";

const app = express();

export default app;

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(bodyparser.raw());

app.use((req, res, next) => {
    console.log(req.headers);
    next();
});

app.get("/fork", (req, res) => {
    console.log(req.body);
});

http.createServer(app).listen(parseInt(process.argv[2]) || 5666);

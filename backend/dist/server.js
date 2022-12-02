"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = require("http");
const utils_1 = require("./utils");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const port = process.env.PORT || 5000;
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
/* mongo db setup */
mongoose_1.default.connect(process.env.MONGO_URI || "", {}, () => console.log("DB Connected"));
/* cors function */
app.use((req, res, next) => {
    res.header("access-control-allow-origin", "*");
    res.header("access-control-allow-headers", "*");
    res.header("access-control-allow-method", "GET, POST, PUT, DELETE");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});
/* Setup Routes */
app.get("/", (req, res) => {
    res.status(200).json("Disposable short url, life span of 24hrs");
});
app.use(routes_1.default);
/* handle 404 Error */
app.use((req, res, next) => {
    const err = new utils_1.StatusError("Page Not Found");
    err.status = 404;
    next(err);
});
/* Error handler */
app.use((err, req, res, next) => {
    if (!err.message)
        err.message = "Server error";
    res.status(err.status || 500).json({
        error: err,
    });
});
server.listen(port, () => console.log(`Server running on port ${port}`));

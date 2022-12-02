"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectUrl = exports.generateShortUrl = void 0;
const mongodb_1 = require("mongodb");
const short_unique_id_1 = __importDefault(require("short-unique-id"));
const url_1 = __importDefault(require("../models/url"));
const utils_1 = require("../utils");
// Generate short url
const generateShortUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = req.body.url || "";
    if (!url)
        return res.status(400).json({ error: "Please provide url" });
    // Check if url alreafy exists
    const shortUrl = yield url_1.default.findOne({ longUrl: url });
    if (shortUrl) {
        const data = (0, utils_1.urlData)(shortUrl, req);
        return res.json({ data });
    }
    if (!shortUrl) {
        const short = new short_unique_id_1.default({ length: 7 });
        let doc = new url_1.default({
            longUrl: url,
            shortUrl: short(),
        });
        try {
            doc = yield doc.save();
            // Success response
            const data = (0, utils_1.urlData)(doc, req);
            return res.status(201).json({ data });
        }
        catch (err) {
            // Todo: Regenerate shorturl if duplicate
            if (err instanceof mongodb_1.MongoError) {
                if (err.code == 11000) {
                    console.log(`${Date.now()}: Duplicate shorturl error`);
                    // Generate new short id
                    doc.shortUrl = short();
                    // Save 
                    doc.save((err, doc) => {
                        if (err)
                            return res.status(400).json({ error: err });
                        // Return successful response
                        const data = (0, utils_1.urlData)(doc, req);
                        return res.status(201).json({ data });
                    });
                }
            }
            else {
                return res.status(400).json({ error: err });
            }
        }
    }
});
exports.generateShortUrl = generateShortUrl;
// Redirect short url
const redirectUrl = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { short } = req.params;
    const err404 = (0, utils_1.generateError)("Url not found", 404);
    // Check if short ur exist 
    const shortUrl = yield url_1.default.findOne({ shortUrl: short });
    if (!shortUrl)
        return next(err404);
    const createdAt = shortUrl.createdAt;
    if (createdAt) {
        const today = Math.round(Date.now() / 1000);
        const timeInSeconds = Math.round((createdAt === null || createdAt === void 0 ? void 0 : createdAt.getTime()) / 1000);
        const lifeInSeconds = 24 * 3600;
        const expiryDate = timeInSeconds + lifeInSeconds;
        console.log(today, expiryDate);
        if (today > expiryDate) {
            shortUrl.delete();
            return next(err404);
        }
        // Redirect to long url
        return res.redirect(shortUrl.longUrl);
    }
    else {
        // Haa... nice try :)
        shortUrl.delete();
        return next(err404);
    }
});
exports.redirectUrl = redirectUrl;

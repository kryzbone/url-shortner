"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const urlSchema = new mongoose_1.Schema({
    longUrl: {
        type: String,
        trim: true,
        required: true
    },
    shortUrl: {
        type: String,
        trim: true,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});
const handleDuplicateError = (error, doc, next) => {
    console.log(error);
    if (error.code == 11000) {
        console.log("post save");
        doc.shortUrl = "asdfg";
        doc.save();
    }
    else {
        next();
    }
};
urlSchema.on("save", handleDuplicateError);
exports.default = (0, mongoose_1.model)("Url", urlSchema);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateError = exports.urlData = exports.StatusError = void 0;
class StatusError extends Error {
}
exports.StatusError = StatusError;
//  Generate url data for response
const urlData = (data, req) => {
    return {
        longUrl: data.longUrl,
        shortUrl: `${req.headers.host}/${data.shortUrl}`,
    };
};
exports.urlData = urlData;
// Generate Error
const generateError = (msg, status) => {
    const err = new StatusError();
    err.message = msg;
    err.status = status;
    return err;
};
exports.generateError = generateError;

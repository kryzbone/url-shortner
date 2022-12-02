import { Request } from "express"
import Url, {IUrl} from "../models/url"



class StatusError extends Error {
    status: number | undefined
} 

interface UrlData {
    longUrl: string,
    shortUrl: string
}

//  Generate url data for response
const urlData = (data: IUrl, req: Request): UrlData => {
    return {
        longUrl: data.longUrl,
        shortUrl: `${req.headers.host}/${data.shortUrl}`,
    }
}


// Generate Error
const generateError = (msg: string, status: number): StatusError => {
    const err =  new StatusError()
    err.message = msg
    err.status = status
    return err
}

export {StatusError, urlData, generateError}
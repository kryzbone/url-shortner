import { Response, Request, NextFunction } from "express"
import { MongoError, Document } from "mongodb";
import { nextTick } from "process";
import ShortUniqueId from 'short-unique-id';

import Url from '../models/url'
import { generateError, urlData } from "../utils";


// Generate short url
export const generateShortUrl = async (req: Request, res: Response) => {
    const url = req.body.url || ""
    if (!url) return res.status(400).json({error: "Please provide url"})
   
    // Check if url alreafy exists
    const shortUrl  = await Url.findOne({longUrl: url}) 
    if(shortUrl) {
        const data = urlData(shortUrl, req)
        return res.json({data})
    }

    if (!shortUrl) {
        const short = new ShortUniqueId({ length: 7 })

        let doc = new Url({
            longUrl: url,
            shortUrl: short(),
        })
        try {
            doc = await doc.save()
            // Success response
            const data = urlData(doc, req)
            return res.status(201).json({data})
        } catch (err) {
            // Todo: Regenerate shorturl if duplicate
            if (err instanceof MongoError) {
                if (err.code == 11000) {
                    console.log(`${Date.now()}: Duplicate shorturl error`)
                    // Generate new short id
                    doc.shortUrl = short()
                    // Save 
                    doc.save((err, doc) => {
                        if (err) return res.status(400).json({error:err})
                        // Return successful response
                        const data = urlData(doc, req)
                        return res.status(201).json({data})
                    })
                }
            } else {
                return res.status(400).json({error: err})
            }   
        }
    }
}



// Redirect short url
export const redirectUrl = async (req: Request, res: Response, next: NextFunction) => {
    const {short} = req.params
    const err404 = generateError("Url not found", 404)

    // Check if short ur exist 
    const shortUrl: Document | null = await Url.findOne({shortUrl: short})
    if (!shortUrl) return next(err404)

    const createdAt = shortUrl.createdAt
    if(createdAt) {
        const today = Math.round(Date.now() / 1000)
        const timeInSeconds = Math.round(createdAt?.getTime() / 1000)
        const lifeInSeconds = 24 * 3600
        const expiryDate = timeInSeconds + lifeInSeconds
        console.log(today, expiryDate)
        if (today > expiryDate) {
            shortUrl.delete()
            return next(err404)
        }
        // Redirect to long url
        return res.redirect(shortUrl.longUrl)
    }else {
        // Haa... nice try :)
        shortUrl.delete()
        return next(err404)
    }  
}
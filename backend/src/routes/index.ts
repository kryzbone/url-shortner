import { Router } from "express";
import {generateShortUrl, redirectUrl} from '../controllers'

const router = Router()

router.get("/:short", redirectUrl)
router.post("/generate-short-url", generateShortUrl)


export default router
require("dotenv").config()
import express from "express"
import mongoose from "mongoose"
import {createServer} from "http"
import {StatusError} from "./utils"
import urlRouter from './routes'

const app = express()
const server = createServer(app)

const port = process.env.PORT || 5000

app.use(express.urlencoded({extended:true}))
app.use(express.json())

/* mongo db setup */
mongoose.connect(process.env.MONGO_URI || "", {}, () => console.log("DB Connected"))

/* cors function */
app.use((req, res, next) => {
    res.header("access-control-allow-origin", "*");
    res.header("access-control-allow-headers", "*");
    res.header("access-control-allow-method", "GET, POST, PUT, DELETE")

    if(req.method === "OPTIONS") {
        return res.sendStatus(200)
    }
    next()
})

/* Setup Routes */
app.get("/", (req, res) => {
    res.status(200).json("Disposable short url, life span of 24hrs")
})
app.use(urlRouter)

/* handle 404 Error */
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const err = new StatusError("Page Not Found")
    err.status = 404
    next(err)
})

/* Error handler */
app.use((err: StatusError, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!err.message) err.message = "Server error"
    res.status(err.status || 500).json({
        error: err,
    })
})

server.listen(port, () => console.log(`Server running on port ${port}`))


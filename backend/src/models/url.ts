import { MongoError, Document } from "mongodb";
import { Schema, model, Error, CallbackError } from "mongoose";


export interface IUrl {
    longUrl: string,
    shortUrl: string,
    createdAt?: Date
    updatedAt?: Date
}


const urlSchema = new Schema({
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
})



const handleDuplicateError = (error: Error, doc: Document, next: (err?: CallbackError) => void) => {  
    console.log(error)
    if ((error as MongoError).code == 11000) {
      console.log("post save")
      doc.shortUrl = "asdfg"
      doc.save()
    } else {
      next();
    }
  };

urlSchema.on("save",  handleDuplicateError)


export default model("Url", urlSchema)
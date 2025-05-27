import mongoose, { Document, Schema } from "mongoose" // Added Types for better type hinting

// Define interfaces for Chat and Message documents
interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId
  sender: string // Or mongoose.Types.ObjectId if you have a User model
  content: string
  createdAt: Date
  updatedAt: Date
}

// Define the Message Schema
const MessageSchema: Schema = new Schema({
  chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  sender: { type: String, required: true }, // Or Schema.Types.ObjectId
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Create and export the Mongoose models
const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema)

export type { IMessage }
export { Message }

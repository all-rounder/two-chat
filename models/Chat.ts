import mongoose, { Document, Schema } from "mongoose" // Added Types for better type hinting

interface IChat extends Document {
  participants: string[] // Or mongoose.Types.ObjectId[] if you have a User model
  title: string // Added title field
  createdAt: Date
  updatedAt: Date
}

// Define the Chat Schema
const ChatSchema: Schema = new Schema({
  participants: [{ type: String, required: true }], // Or Schema.Types.ObjectId
  title: { type: String, default: "New Chat" }, // Added title field with a default value
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema)

export type { IChat }
export { Chat }

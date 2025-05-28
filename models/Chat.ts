import mongoose, { Document, Schema, Types } from "mongoose" // Added Types for better type hinting

interface IChat extends Document {
  participants: string[] // Or mongoose.Types.ObjectId[] if you have a User model
  title: string // Added title field
  createdAt: Date
  updatedAt: Date
  starred: boolean
}

// Define the interface for a Chat document
// export interface IChat extends Document {
//   _id: Types.ObjectId // Use Types.ObjectId for Mongoose IDs
//   participants: Types.ObjectId[] // Array of user IDs
//   messages: Types.ObjectId[] // Array of message IDs
//   title: string // Title of the chat
//   createdAt: Date // Timestamp for creation
//   updatedAt: Date // Timestamp for last update
//   starred: boolean // Added starred field
// }

const ChatSchema: Schema = new Schema({
  participants: [{ type: String, required: true }], // Or Schema.Types.ObjectId
  title: { type: String, default: "New Chat" }, // Added title field with a default value
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  starred: { type: Boolean, default: false },
})

// // Define the Chat Schema
// const ChatSchema: Schema = new Schema(
//   {
//     participants: [
//       { type: Schema.Types.ObjectId, ref: "User", required: true },
//     ],
//     messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
//     title: { type: String, required: true },
//     starred: { type: Boolean, default: false }, // Added starred field with default
//   },
//   { timestamps: true }
// ) // Mongoose will add createdAt and updatedAt timestamps

const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema)

export type { IChat }
export { Chat }

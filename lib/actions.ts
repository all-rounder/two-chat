import { Types } from "mongoose" // Added Types for better type hinting
import { dbConnect } from "@/lib/dbConnect"
import { IChat, Chat } from "@/models/Chat"
import { IMessage, Message } from "@/models/Message"

// --- CRUD Functions for Chat ---

/**
 * Create a new chat.
 * @param participants - An array of participant IDs (or strings).
 * @returns The newly created chat document.
 */
export const createChat = async (
  participants: string[],
  title: string
): Promise<IChat> => {
  await dbConnect() // Ensure connection is established
  const chat = new Chat({ participants, title })
  await chat.save()
  return chat
}

/**
 * Get a chat by its ID.
 * @param chatId - The ID of the chat.
 * @returns The chat document or null if not found.
 */
export const getChatById = async (
  chatId: string | Types.ObjectId
): Promise<IChat | null> => {
  await dbConnect() // Ensure connection is established
  return Chat.findById(chatId).exec()
}

/**
 * Get all chats for a specific user.
 * @param userId - The ID (or string) of the user.
 * @returns An array of chat documents.
 */
export const getUserChats = async (userId: string): Promise<IChat[]> => {
  await dbConnect() // Ensure connection is established
  console.log("Fetching chats by userId...")
  return Chat.find({ participants: userId }).exec()
}

/**
 * Update a chat by its ID.
 * @param chatId - The ID of the chat.
 * @param updates - The updates to apply to the chat.
 * @returns The updated chat document or null if not found.
 */
export const updateChat = async (
  chatId: string | Types.ObjectId,
  updates: Partial<IChat>
): Promise<IChat | null> => {
  await dbConnect() // Ensure connection is established
  return Chat.findByIdAndUpdate(chatId, updates, { new: true }).exec()
}

/**
 * Delete a chat by its ID and all associated messages.
 * @param chatId - The ID of the chat.
 * @returns The deleted chat document or null if not found.
 */
export const deleteChat = async (
  chatId: string | Types.ObjectId
): Promise<IChat | null> => {
  await dbConnect() // Ensure connection is established
  // Delete all messages associated with the chat
  await Message.deleteMany({ chatId: chatId }).exec()
  // Delete the chat itself
  return Chat.findByIdAndDelete(chatId).exec()
}

// --- CRUD Functions for Message ---

/**
 * Create a new message.
 * @param chatId - The ID of the chat the message belongs to.
 * @param sender - The sender's ID (or string).
 * @param content - The content of the message.
 * @returns The newly created message document.
 */
export const createMessage = async (
  chatId: string | Types.ObjectId,
  sender: string,
  content: string
): Promise<IMessage> => {
  await dbConnect() // Ensure connection is established
  const message = new Message({ chatId, sender, content })
  await message.save()
  return message
}

/**
 * Get all messages for a specific chat.
 * @param chatId - The ID of the chat.
 * @returns An array of message documents.
 */
export const getMessagesByChatId = async (
  chatId: string | Types.ObjectId
): Promise<IMessage[]> => {
  await dbConnect() // Ensure connection is established
  return Message.find({ chatId }).sort({ createdAt: 1 }).exec() // Sort by creation date
}

/**
 * Get a message by its ID.
 * @param messageId - The ID of the message.
 * @returns The message document or null if not found.
 */
export const getMessageById = async (
  messageId: string | Types.ObjectId
): Promise<IMessage | null> => {
  await dbConnect() // Ensure connection is established
  return Message.findById(messageId).exec()
}

/**
 * Update a message by its ID.
 * @param messageId - The ID of the message.
 * @param updates - The updates to apply to the message (e.g., content).
 * @returns The updated message document or null if not found.
 */
export const updateMessage = async (
  messageId: string | Types.ObjectId,
  updates: Partial<IMessage>
): Promise<IMessage | null> => {
  await dbConnect() // Ensure connection is established
  return Message.findByIdAndUpdate(messageId, updates, { new: true }).exec()
}

/**
 * Delete a message by its ID.
 * @param messageId - The ID of the message.
 * @returns The deleted message document or null if not found.
 */
export const deleteMessage = async (
  messageId: string | Types.ObjectId
): Promise<IMessage | null> => {
  await dbConnect() // Ensure connection is established
  return Message.findByIdAndDelete(messageId).exec()
}

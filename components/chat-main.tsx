"use client"

import { ChatHeader } from "./chat-header"
import { Message } from "./message"
import { MessageInput } from "./message-input"
// import { ChatMessage } from "@/types"

// Import IMessage from mongoose or define a compatible interface
import { IMessage } from "@/models/Message" // Assuming this path is correct

// Define an interface for the Message object as expected by ChatMain/Message components
// This maps IMessage fields and potentially adds UI-specific fields like a formatted timestamp
interface UIMessage {
  // Use IMessage structure fields needed for display
  _id?: string // Optional, could use Mongoose ObjectId or leave undefined for new messages
  content: string
  sender: string // Maps to IMessage.sender
  // Add UI-specific fields
  isUser: boolean // Derived from sender
  timestamp: string // Formatted timestamp for display
}

interface ChatMainProps {
  // Use the new interface here
  currentMessages: IMessage[] // Receive IMessage[] from page.tsx
  isLoading: boolean
  onSendMessage: (message: string) => Promise<void>
  onOpenChatList: () => void
  models: string[]
  selectedModel: string
  onSelectModel: (model: string) => void
}

export function ChatMain({
  currentMessages,
  isLoading,
  onSendMessage,
  onOpenChatList,
  models,
  selectedModel,
  onSelectModel,
}: ChatMainProps) {
  // Map IMessage objects to UIMessage objects for rendering
  const uiMessages: UIMessage[] = currentMessages.map((msg) => ({
    _id: msg._id?.toString(), // Map ObjectId to string
    content: msg.content,
    sender: msg.sender,
    isUser: msg.sender !== "bot", // Assuming 'user123' is the user sender ID
    // Format the timestamp for display - use createdAt from Mongoose model
    timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }))

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-full overflow-hidden">
      <ChatHeader
        onOpenChatList={onOpenChatList}
        models={models}
        selectedModel={selectedModel}
        onSelectModel={onSelectModel}
      />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {uiMessages.map(
          (
            message,
            index // Iterate over mapped uiMessages
          ) => (
            <Message
              key={message._id || index} // Use message._id for key if available, fallback to index
              isUser={message.isUser}
              content={message.content}
              timestamp={message.timestamp}
            />
          )
        )}
        {currentMessages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 pt-10">
            Send a message to start the conversation.
          </div>
        )}
      </div>

      <MessageInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  )
}

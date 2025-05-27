"use client"

import { useState, useEffect } from "react"
import { ChatList } from "@/components/chat-list"
import { ChatMain } from "@/components/chat-main"
import { Sidebar } from "@/components/sidebar"

import { Types } from "mongoose" // Added Types for better type hinting
import { IChat } from "@/models/Chat"
import { IMessage } from "@/models/Message"

// Import Mongoose types (IChat, IMessage) and Types for ObjectId
// Remove import of CRUD functions and dbConnect as they are now used in API routes
import { getMessagesByChatId } from "@/lib/actions" // Adjust the import path if necessary

// Ensure you have types/index.ts with Chat and ChatMessage interfaces
// If not using a separate types file, you can define them here, but let's use the imported ones
// We will primarily use IChat and IMessage directly now.

// Placeholder for a user ID. In a real app, this would come from authentication.
const PLACEHOLDER_USER_ID = "user_2xcQKaXfA2hc5k9R492Lqqvshl5"

export default function HomePage() {
  // Use IChat type for allChats
  const [allChats, setAllChats] = useState<IChat[]>([])
  // currentChatId can be string or Types.ObjectId, using string for state simplicity
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChatListOpen, setIsChatListOpen] = useState(false) // For mobile view
  // Add state for selected model and list of models
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.0-flash") // Default model
  const availableModels = [
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-pro-preview-05-06",
    "gemini-2.0-flash",
  ] // List of available models

  // Add state for messages of the currently active chat
  const [currentMessages, setCurrentMessages] = useState<IMessage[]>([])

  // Load chats from the database on component mount using API route
  // useEffect(() => {
  //   const fetchChats = async () => {
  //     setIsLoading(true)
  //     try {
  //       // Fetch chats from the API route
  //       console.log("Fetching chats...")
  //       const response = await fetch(`/api/chats?userId=${PLACEHOLDER_USER_ID}`)

  //       if (!response.ok) {
  //         throw new Error(`Failed to fetch chats: ${response.status}`)
  //       }
  //       const chats: IChat[] = await response.json()
  //       setAllChats(chats)
  //       console.log("Fetching chats successfully")

  //       // Set the current chat to the most recently updated one
  //       if (chats.length > 0) {
  //         const sortedChats = [...chats].sort(
  //           (a, b) =>
  //             new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  //         )
  //         if (sortedChats[0]) {
  //           setCurrentChatId(sortedChats[0]._id.toString()) // Use _id from Mongoose
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch chats:", error)
  //       setAllChats([]) // Clear chats on error
  //       // Optionally set an error state to display a message to the user
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   fetchChats()
  // }, []) // Empty dependency array means this runs once on mount

  // Effect to load messages when the current chat changes using API route
  // useEffect(() => {
  //   const fetchMessages = async () => {
  //     if (currentChatId) {
  //       setIsLoading(true)
  //       console.log("Fetching messages...")
  //       try {
  //         // Fetch messages from the API route
  //         const response = await fetch(`/api/chats/${currentChatId}/messages`)
  //         if (!response.ok) {
  //           throw new Error(`Failed to fetch messages: ${response.status}`)
  //         }
  //         const messages: IMessage[] = await response.json()
  //         setCurrentMessages(messages)
  //       } catch (error) {
  //         console.error(
  //           "Failed to fetch messages for chat:",
  //           currentChatId,
  //           error
  //         )
  //         setCurrentMessages([]) // Clear messages on error
  //         // Optionally set an error state
  //       } finally {
  //         setIsLoading(false)
  //       }
  //     } else {
  //       setCurrentMessages([]) // Clear messages if no chat is selected
  //     }
  //   }

  //   fetchMessages()
  // }, [currentChatId]) // Rerun when currentChatId changes

  const getCurrentTime = () => {
    // This is now less relevant as timestamp comes from DB,
    // but keeping for display consistency if the Message component uses it.
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    // setIsChatListOpen(false); // Close sidebar on mobile after selection - handled by onMobileChatInteraction
    // Messages will be loaded by the useEffect hook
  }

  const handleNewChat = async () => {
    setIsLoading(true)
    try {
      // Create a new chat using the API route
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants: [PLACEHOLDER_USER_ID] }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create new chat: ${response.status}`)
      }
      const newChat: IChat = await response.json()

      // Add the new chat to the state and set it as current
      setAllChats((prevChats) => [newChat, ...prevChats])
      setCurrentChatId(newChat._id.toString())
      setCurrentMessages([]) // Clear messages for the new chat

      // setIsChatListOpen(false); // Close sidebar on mobile after new chat - handled by onMobileChatInteraction
      return newChat._id.toString() // Return new ID
    } catch (error) {
      console.error("Failed to create new chat:", error)
      // Handle error, maybe show a message to the user
      return null // Indicate creation failed
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (messageContent: string) => {
    let tempCurrentChatId = currentChatId

    if (!tempCurrentChatId) {
      // If no chat is selected, start a new one
      tempCurrentChatId = await handleNewChat() // Await the new chat creation
      if (!tempCurrentChatId) {
        console.error("Cannot send message, failed to create a new chat.")
        return
      }
    }

    const userMessageContent = messageContent.trim()
    if (!userMessageContent) return // Don't send empty messages

    // Optimistically add the user message to the state
    // We don't have the actual _id or createdAt/updatedAt from the DB yet,
    // so we create a temporary object that looks like IMessage for the UI.
    const optimisticUserMessage: IMessage = {
      _id: new Types.ObjectId(), // Assign a temporary ObjectId for the optimistic update
      chatId: new Types.ObjectId(tempCurrentChatId),
      sender: PLACEHOLDER_USER_ID, // Assuming this matches the sender value in the API route
      content: userMessageContent,
      createdAt: new Date(), // Use current date/time as a placeholder
      updatedAt: new Date(), // Use current date/time as a placeholder
      // timestamp: getCurrentTime(), // If Message component needs a formatted timestamp
    } as IMessage // Cast to IMessage to match state type structure

    // Update state with the optimistic message
    setCurrentMessages((prevMessages) => [
      ...prevMessages,
      optimisticUserMessage,
    ])
    setIsLoading(true)

    try {
      // Send message to the API route that handles saving and LLM call
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: tempCurrentChatId,
          message: userMessageContent,
          model: selectedModel,
        }), // Include chatId and selectedModel
      })

      if (!response.ok) {
        // If API call fails, we might want to remove the optimistic message
        // or mark it as failed. For simplicity here, we just log the error.
        throw new Error(`Failed to send message: ${response.status}`)
      }
      const data = await response.json()
      const botResponseContent = data.response

      // After successful API call (user message saved, bot message saved), re-fetch messages
      // to get the actual state from the database including correct _id, createdAt, etc.
      const updatedMessages = await getMessagesByChatId(tempCurrentChatId)
      setCurrentMessages(updatedMessages)
    } catch (error) {
      console.error("Error sending message:", error)
      // Handle error: Maybe add an error message to the UI
      const errorMessageContent =
        "Sorry, an error occurred while sending your message. Please try again."
      const errorMessage: IMessage = {
        _id: new Types.ObjectId(), // Temp ID for UI
        chatId: new Types.ObjectId(tempCurrentChatId),
        sender: "bot", // Or an 'error' sender type
        content: errorMessageContent,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IMessage
      setCurrentMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setIsLoading(false)
      // After sending a message, refresh the chat list to update 'updatedAt' and sorting
      const response = await fetch(`/api/chats?userId=${PLACEHOLDER_USER_ID}`)
      if (response.ok) {
        const updatedChats: IChat[] = await response.json()
        setAllChats(updatedChats)
      } else {
        console.error("Failed to refresh chat list after sending message")
      }
    }
  }

  // Find the active chat by ID for display purposes (mainly for title)
  const activeChat = allChats.find(
    (chat) => chat._id.toString() === currentChatId
  )

  const handleMobileChatInteraction = () => {
    setIsChatListOpen(false)
  }

  // Note: The ChatList component expects a 'Chat' type with an 'id' property.
  // We need to map the Mongoose '_id' to 'id' when passing data to ChatList.
  const chatsForChatList = allChats.map((chat) => ({
    ...chat,
    id: chat._id.toString(), // Map _id to id
    messages: [], // ChatList doesn't need full messages array
  }))

  return (
    <main className="flex h-screen overflow-hidden bg-gray-100">
      {/* ChatList (Sidebar) - Always visible on md and up, toggleable on smaller screens */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:flex md:h-full
          ${isChatListOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar />
        <ChatList
          chats={chatsForChatList} // Pass mapped chats
          activeChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onMobileChatInteraction={handleMobileChatInteraction}
        />
      </div>

      {/* Overlay for mobile when ChatList is open */}
      {isChatListOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsChatListOpen(false)}
        ></div>
      )}

      {/* ChatMain Content */}
      <div className="flex-1 flex flex-col h-full">
        <ChatMain
          key={currentChatId} // Re-mounts ChatMain when chat changes (clears input, etc.)
          currentMessages={currentMessages} // Pass messages from currentMessages state
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onOpenChatList={() => setIsChatListOpen(true)}
          // Pass model props to ChatMain
          models={availableModels}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
      </div>
    </main>
  )
}

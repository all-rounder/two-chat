"use client"

import { useState, useEffect } from "react"
import { ChatList } from "@/components/chat-list"
import { ChatMain } from "@/components/chat-main"
import { Sidebar } from "@/components/sidebar"
import { IChat } from "@/models/Chat"
import { IMessage } from "@/models/Message"
import { Types } from "mongoose"

interface ChatAppProps {
  initialChats: IChat[]
  userId: string
}

export default function ChatApp({ initialChats, userId }: ChatAppProps) {
  const [allChats, setAllChats] = useState<IChat[]>(initialChats)
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    initialChats.length > 0 ? initialChats[0]._id.toString() : null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isChatListOpen, setIsChatListOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.0-flash")
  const availableModels = [
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-pro-preview-05-06",
    "gemini-2.0-flash",
  ]
  const [currentMessages, setCurrentMessages] = useState<IMessage[]>([])

  // Fetch messages when currentChatId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (currentChatId) {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/chats/${currentChatId}/messages`)
          if (!response.ok)
            throw new Error(`Failed to fetch messages: ${response.status}`)
          const messages: IMessage[] = await response.json()
          setCurrentMessages(messages)
        } catch (error) {
          console.error(
            "Failed to fetch messages for chat:",
            currentChatId,
            error
          )
          setCurrentMessages([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setCurrentMessages([])
      }
    }
    fetchMessages()
  }, [currentChatId])

  const chatsForChatList = allChats.map((chat) => ({
    ...chat,
    id: chat._id.toString(),
    messages: [],
  }))

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
  }

  const handleMobileChatInteraction = () => {
    setIsChatListOpen(false)
  }

  const handleNewChat = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: [userId],
          title: "New Chat",
        }),
      })
      if (!response.ok)
        throw new Error(`Failed to create new chat: ${response.status}`)
      const newChat: IChat = await response.json()
      setAllChats((prevChats) => [newChat, ...prevChats])
      setCurrentChatId(newChat._id.toString())
      setCurrentMessages([])
      return newChat._id.toString()
    } catch (error) {
      console.error("Failed to create new chat:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (messageContent: string) => {
    let tempCurrentChatId = currentChatId

    if (!tempCurrentChatId) {
      tempCurrentChatId = await handleNewChat()
      if (!tempCurrentChatId) {
        console.error("Cannot send message, failed to create a new chat.")
        return
      }
    }

    const userMessageContent = messageContent.trim()
    if (!userMessageContent) return

    const optimisticUserMessage: IMessage = {
      _id: new Types.ObjectId(),
      chatId: new Types.ObjectId(tempCurrentChatId),
      sender: userId,
      content: userMessageContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IMessage

    setCurrentMessages((prevMessages) => [
      ...prevMessages,
      optimisticUserMessage,
    ])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: tempCurrentChatId,
          message: userMessageContent,
          model: selectedModel,
        }),
      })

      if (!response.ok)
        throw new Error(`Failed to send message: ${response.status}`)
      // Optionally use the response here if needed
      const updatedMessages = await fetch(
        `/api/chats/${tempCurrentChatId}/messages`
      )
      if (!updatedMessages.ok)
        throw new Error(
          `Failed to fetch updated messages: ${updatedMessages.status}`
        )
      const updatedMessagesData = await updatedMessages.json()
      setCurrentMessages(updatedMessagesData)
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: IMessage = {
        _id: new Types.ObjectId(),
        chatId: new Types.ObjectId(tempCurrentChatId),
        sender: "bot",
        content:
          "Sorry, an error occurred while sending your message. Please try again.",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as IMessage
      setCurrentMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setIsLoading(false)
      // Refresh chat list after sending message
      const response = await fetch(`/api/chats?userId=${userId}`)
      if (response.ok) {
        const updatedChats: IChat[] = await response.json()
        setAllChats(updatedChats)
      } else {
        console.error("Failed to refresh chat list after sending message")
      }
    }
  }

  const handleUpdateChatTitle = (chatId: string, newTitle: string) => {
    setAllChats((prevChats) =>
      prevChats.map((chat) =>
        chat._id.toString() === chatId ? { ...chat, title: newTitle } : chat
      )
    )
  }

  return (
    <main className="flex h-screen overflow-hidden bg-gray-100">
      {/* ChatList (Sidebar) */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:flex md:h-full
          ${isChatListOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar />
        <ChatList
          chats={chatsForChatList}
          activeChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onMobileChatInteraction={handleMobileChatInteraction}
          onUpdateChatTitle={handleUpdateChatTitle}
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
          key={currentChatId}
          currentMessages={currentMessages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onOpenChatList={() => setIsChatListOpen(true)}
          models={availableModels}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
        />
      </div>
    </main>
  )
}

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
  const [selectedModel, setSelectedModel] = useState<string>(
    "gemini-2.5-flash-preview-05-20"
  )
  const availableModels = [
    "gemini-2.5-flash-preview-05-20",
    "gemini-2.5-pro-preview-05-06",
    "gemini-2.0-flash",
  ]
  const [currentMessages, setCurrentMessages] = useState<IMessage[]>([])
  const [isNewChatPending, setIsNewChatPending] = useState(false)

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

  // Map IChat to ChatForList, ensuring 'starred' is included
  const chatsForChatList = allChats.map((chat) => ({
    ...chat,
    id: chat._id.toString(),
    messages: [], // ChatList doesn't need messages
    starred: chat.starred || false, // Ensure starred is included
  }))

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId)
    setIsNewChatPending(false)
  }

  const handleMobileChatInteraction = () => {
    setIsChatListOpen(false)
  }

  // Only clear UI and set pending flag, don't create chat yet
  const handleNewChat = () => {
    setCurrentChatId(null)
    setCurrentMessages([])
    setIsNewChatPending(true)
  }

  const handleSendMessage = async (messageContent: string) => {
    let tempCurrentChatId = currentChatId

    const userMessageContent = messageContent.trim()
    if (!userMessageContent) return

    setIsLoading(true)

    // If new chat is pending, create it first
    if (isNewChatPending) {
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
        tempCurrentChatId = newChat._id.toString()
        setCurrentChatId(tempCurrentChatId)
        setIsNewChatPending(false)
      } catch (error) {
        console.error("Failed to create new chat:", error)
        setIsLoading(false)
        return
      }
    }

    // Optimistically add user message
    const optimisticUserMessage: IMessage = {
      _id: new Types.ObjectId(),
      chatId: tempCurrentChatId
        ? new Types.ObjectId(tempCurrentChatId)
        : new Types.ObjectId(),
      sender: userId,
      content: userMessageContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as IMessage

    setCurrentMessages((prevMessages) => [
      ...prevMessages,
      optimisticUserMessage,
    ])

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
        chatId: tempCurrentChatId
          ? new Types.ObjectId(tempCurrentChatId)
          : new Types.ObjectId(),
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

  // Function to handle chat deletion and update state
  const handleChatDeleted = (chatId: string) => {
    setAllChats((prevChats) =>
      prevChats.filter((chat) => chat._id.toString() !== chatId)
    )

    // If the deleted chat was the current one, reset the current chat
    if (currentChatId === chatId) {
      setCurrentChatId(null)
      setCurrentMessages([]) // Clear messages for the deleted chat
      // If there are still chats left after deletion, select the first one
      if (
        allChats.filter((chat) => chat._id.toString() !== chatId).length > 0
      ) {
        setCurrentChatId(
          allChats
            .filter((chat) => chat._id.toString() !== chatId)[0]
            ._id.toString()
        )
      } else {
        setIsNewChatPending(true) // If no chats left, prepare for new chat
      }
    }
  }

  // Function to handle starring/unstarring a chat and update state
  const handleToggleStar = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: true }), // Body might be ignored by backend toggle logic, but good practice
      })

      if (!response.ok) {
        throw new Error("Failed to toggle chat star status")
      }

      const updatedChat: IChat = await response.json()

      // Update the allChats state with the updated chat
      setAllChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id.toString() === updatedChat._id.toString()
            ? updatedChat
            : chat
        )
      )
    } catch (error) {
      console.error("Error toggling chat star status:", error)
      // Optional: Show an error message to the user
    }
  }

  // Separate starred and unstarred chats
  const starredChats = chatsForChatList.filter((chat) => chat.starred)
  const unstarredChats = chatsForChatList.filter((chat) => !chat.starred)

  // Group unstarred chats by date
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)

  const groupedUnstarredChats = unstarredChats.reduce(
    (acc, chat) => {
      const chatDate = new Date(chat.updatedAt)
      if (chatDate >= today) {
        acc.today.push(chat)
      } else if (chatDate >= yesterday) {
        acc.yesterday.push(chat)
      } else if (chatDate >= sevenDaysAgo) {
        acc.previous7Days.push(chat)
      } else {
        acc.older.push(chat)
      }
      return acc
    },
    { today: [], yesterday: [], previous7Days: [], older: [] } as {
      today: ChatForList[]
      yesterday: ChatForList[]
      previous7Days: ChatForList[]
      older: ChatForList[]
    }
  )

  // Sort unstarred chats within each group
  for (const group in groupedUnstarredChats) {
    groupedUnstarredChats[group as keyof typeof groupedUnstarredChats].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  // Sort starred chats by update date (most recent first)
  starredChats.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )

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
          chats={chatsForChatList} // Pass all chats, ChatList will handle rendering logic
          activeChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          onMobileChatInteraction={handleMobileChatInteraction}
          onUpdateChatTitle={handleUpdateChatTitle}
          onChatDeleted={handleChatDeleted}
          onToggleStar={handleToggleStar} // Pass the new handler
          starredChats={starredChats} // Pass separated starred chats
          groupedUnstarredChats={groupedUnstarredChats} // Pass grouped unstarred chats
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
          key={currentChatId || (isNewChatPending ? "new" : "none")}
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

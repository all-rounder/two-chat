"use client"

import { Button } from "@/components/ui/button"
import {
  Bot,
  ChevronDown,
  Cpu,
  Crown,
  Lightbulb,
  PanelLeftClose,
  Pencil,
  ShoppingCart,
  Zap,
} from "lucide-react"
import { useState } from "react"

// Define an interface for the Chat object as expected by ChatList,
// mapping Mongoose's _id to a local 'id' property for convenience in this component
interface ChatForList {
  id: string // Mapped from IChat._id
  title: string
  updatedAt: Date
  // Add other properties from IChat if needed by ChatList, e.g., createdAt
}

interface ChatListProps {
  // Use the new interface here
  chats: ChatForList[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onMobileChatInteraction?: () => void
  onUpdateChatTitle?: (chatId: string, newTitle: string) => void
}

export function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onMobileChatInteraction,
  onUpdateChatTitle,
}: ChatListProps) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 7)

  const groupedChats = chats.reduce(
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
      today: ChatForList[] // Use the new interface
      yesterday: ChatForList[] // Use the new interface
      previous7Days: ChatForList[] // Use the new interface
      older: ChatForList[] // Use the new interface
    }
  )

  for (const group in groupedChats) {
    groupedChats[group as keyof typeof groupedChats].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }

  const handleChatSelection = (chatId: string) => {
    onSelectChat(chatId)
    if (onMobileChatInteraction) {
      onMobileChatInteraction()
    }
  }

  const handleNewChatClick = () => {
    onNewChat()
    if (onMobileChatInteraction) {
      onMobileChatInteraction()
    }
  }

  // Add state for editing
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>("")

  // Function to handle title update
  const handleTitleUpdate = async (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) return
    // Call PATCH API
    await fetch(`/api/chats/${chatId}/title`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    })
    setEditingChatId(null)
    setEditingTitle("")
    // Update local state via parent callback
    if (onUpdateChatTitle) {
      onUpdateChatTitle(chatId, newTitle)
    }
  }

  const renderChatGroup = (title: string, chatsToRender: ChatForList[]) => {
    if (chatsToRender.length === 0) return null
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-2">
          {chatsToRender.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center text-sm p-2 rounded cursor-pointer hover:bg-gray-50 ${
                chat.id === activeChatId
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600"
              }`}
              onClick={() => handleChatSelection(chat.id)}
            >
              {editingChatId === chat.id ? (
                <input
                  className="flex-1 mr-2 px-1 py-0.5 border rounded"
                  value={editingTitle}
                  autoFocus
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleTitleUpdate(chat.id, editingTitle)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleTitleUpdate(chat.id, editingTitle)
                    } else if (e.key === "Escape") {
                      setEditingChatId(null)
                      setEditingTitle("")
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <span className="flex-1">
                    {chat.title &&
                    typeof chat.title === "string" &&
                    chat.title.length > 35
                      ? chat.title.substring(0, 32) + "..."
                      : chat.title || "Untitled Chat"}
                  </span>
                  <button
                    className="ml-2 p-1 hover:bg-gray-200 rounded"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingChatId(chat.id)
                      setEditingTitle(chat.title || "")
                    }}
                    title="Edit title"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full md:w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Bot size={32} className="text-blue-600" />
          <span className="font-semibold text-lg">TwoChat</span>
          <Button variant="ghost" size="sm" className="ml-auto">
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 space-y-2 border-b border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600"
          onClick={handleNewChatClick}
        >
          <Cpu className="w-4 h-4" />
          New chat
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600"
        >
          <ShoppingCart className="w-4 h-4" />
          GPT Store
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600"
        >
          <Lightbulb className="w-4 h-4" />
          Custom Instructions
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderChatGroup("Today", groupedChats.today)}
        {renderChatGroup("Yesterday", groupedChats.yesterday)}
        {renderChatGroup("Previous 7 Days", groupedChats.previous7Days)}
        {renderChatGroup("Older", groupedChats.older)}
        {chats.length === 0 && (
          <p className="text-sm text-gray-500 text-center">
            No chats yet. Start a new conversation!
          </p>
        )}
      </div>

      {/* Upgrade Plan */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">
              Upgrade Plan
            </div>
            <div className="text-xs text-gray-600">Get GPT-8 and more</div>
          </div>
        </div>
      </div>
    </div>
  )
}

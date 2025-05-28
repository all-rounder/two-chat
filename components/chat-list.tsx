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
  PanelLeftOpen,
  Ellipsis,
  Star,
} from "lucide-react"
import { useState } from "react"

// Added imports for dropdown menu
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Define an interface for the Chat object as expected by ChatList,
// mapping Mongoose's _id to a local 'id' property for convenience in this component
interface ChatForList {
  id: string // Mapped from IChat._id
  title: string
  updatedAt: Date
  starred: boolean // Added starred field
}

interface ChatListProps {
  // Use the new interface here
  chats: ChatForList[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onMobileChatInteraction?: () => void
  onUpdateChatTitle?: (chatId: string, newTitle: string) => void
  onChatDeleted: (chatId: string) => void
  onToggleStar: (chatId: string) => void // New prop for toggling star
  starredChats: ChatForList[] // New prop for starred chats
  groupedUnstarredChats: {
    // New prop for grouped unstarred chats
    today: ChatForList[]
    yesterday: ChatForList[]
    previous7Days: ChatForList[]
    older: ChatForList[]
  }
}

export function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onMobileChatInteraction,
  onUpdateChatTitle,
  onChatDeleted,
  onToggleStar,
  starredChats,
  groupedUnstarredChats,
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

  // Add state for collapsing the chat list
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)

  const toggleChatList = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Function to handle chat deletion
  const handleDeleteChat = async (chatId: string) => {
    // Optional: Add a confirmation dialog here
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete chat")
        }

        console.log(`Chat ${chatId} deleted successfully`)
        // Call the parent callback to update the state
        onChatDeleted(chatId)
      } catch (error) {
        console.error("Error deleting chat:", error)
        // Optional: Show an error message to the user
      }
    }
  }

  // Helper function to render a single chat item
  const renderChatItem = (chat: ChatForList) => (
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="ml-2 p-1 hover:bg-gray-200 rounded"
                onClick={(e) => e.stopPropagation()} // Prevent chat selection when opening dropdown
                title="Chat options"
              >
                <Ellipsis className="w-4 h-4" /> {/* Ellipsis icon */}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStar(chat.id) // Call the toggle star function
                }}
              >
                {chat.starred ? "Unstar" : "Star"}{" "}
                {/* Change text based on starred status */}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingChatId(chat.id)
                  setEditingTitle(chat.title || "")
                }}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteChat(chat.id) // Call the delete function
                }}
                className="text-red-600" // Optional: style delete option
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  )

  const renderChatGroup = (title: string, chatsToRender: ChatForList[]) => {
    if (chatsToRender.length === 0) return null
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-2">
          {chatsToRender.map((chat) => renderChatItem(chat))} {/* Use helper */}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-full md:w-80"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div
          className={`flex items-center gap-2 ${
            isCollapsed ? "justify-center gap-0" : ""
          }`}
        >
          {!isCollapsed && <Bot size={32} className="text-blue-600" />}
          {!isCollapsed && (
            <span className="font-semibold text-lg">TwoChat</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={`${isCollapsed ? "" : "ml-auto"}`}
            onClick={toggleChatList}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      {!isCollapsed && (
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
      )}

      {/* Chat History */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Starred Chats Section */}
          {starredChats.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />{" "}
                  {/* Star icon for section header */}
                  Starred
                </h3>
              </div>
              <div className="space-y-2">
                {starredChats.map((chat) => renderChatItem(chat))}{" "}
                {/* Render starred chats */}
              </div>
            </div>
          )}

          {/* Unstarred Chat History Sections */}
          {renderChatGroup("Today", groupedUnstarredChats.today)}
          {renderChatGroup("Yesterday", groupedUnstarredChats.yesterday)}
          {renderChatGroup(
            "Previous 7 Days",
            groupedUnstarredChats.previous7Days
          )}
          {renderChatGroup("Older", groupedUnstarredChats.older)}

          {chats.length === 0 && ( // Show message if total chats is 0
            <p className="text-sm text-gray-500 text-center">
              No chats yet. Start a new conversation!
            </p>
          )}
        </div>
      )}

      {/* Upgrade Plan */}
      {!isCollapsed && (
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
      )}
    </div>
  )
}

"use client"

import type React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MessageProps {
  isUser: boolean
  content: string | React.ReactNode
  timestamp: string
  avatar?: string
}

export function Message({ isUser, content, timestamp, avatar }: MessageProps) {
  return (
    <div className="flex gap-3">
      {isUser ? (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={avatar || "/placeholder.svg?height=32&width=32"} />
          <AvatarFallback className="bg-gray-900 text-white">U</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">S</span>
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{isUser ? "You" : "slothGPT"}</span>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <div className="text-gray-700">
          {typeof content === "string" ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, ArrowUp, Loader2 } from "lucide-react"

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>
  isLoading: boolean
}

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isLoading) return

    await onSendMessage(message)
    setMessage("")
  }

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message TwoChat..."
            className="pr-20 py-3 rounded-full border-gray-300"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full p-2"
              disabled={isLoading}
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-full p-2 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4 text-white" />
              )}
            </Button>
          </div>
        </form>
        <p className="text-xs text-gray-500 text-center mt-2">
          TwoChat can make mistakes. Check our Terms & Conditions.
        </p>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ChevronDown,
  Sun,
  Moon,
  MoreHorizontal,
  Settings,
  Menu,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ChatHeaderProps {
  onOpenChatList?: () => void
  models: string[]
  selectedModel: string
  onSelectModel: (model: string) => void
}

export function ChatHeader({
  onOpenChatList,
  models,
  selectedModel,
  onSelectModel,
}: ChatHeaderProps) {
  return (
    <header className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        {onOpenChatList && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={onOpenChatList}
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        <div className="flex items-center gap-4">
          <Select onValueChange={onSelectModel} value={selectedModel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggles */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Sun className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Moon className="w-4 h-4" />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}

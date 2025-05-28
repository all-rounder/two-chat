"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  BarChart3,
  User,
  Calendar,
  Zap,
  Bell,
  Settings,
} from "lucide-react"

export function Sidebar() {
  return (
    <div className="w-16 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center p-4">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">T</span>
        </div>
      </div>

      {/* Navigation Icons */}
      <div className="flex-1 flex flex-col items-center py-4 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-gray-600 hover:text-gray-900"
        >
          <Home className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-gray-600 hover:text-gray-900"
        >
          <BarChart3 className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-gray-600 hover:text-gray-900"
        >
          <User className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-gray-600 hover:text-gray-900"
        >
          <Calendar className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-gray-600 hover:text-gray-900"
        >
          <Zap className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-gray-600 hover:text-gray-900"
        >
          <Bell className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center pb-4 space-y-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-gray-600 hover:text-gray-900"
        >
          <Settings className="w-5 h-5" />
        </Button>
        <Avatar className="w-8 h-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback className="bg-orange-500 text-white text-xs">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

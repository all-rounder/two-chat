"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Volume2, Copy, RotateCcw, ThumbsDown, ExternalLink } from "lucide-react"

interface ImageResponseProps {
  imageUrl: string
  currentImage: number
  totalImages: number
}

export function ImageResponse({ imageUrl, currentImage, totalImages }: ImageResponseProps) {
  return (
    <div>
      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Generated response"
          className="w-full h-48 object-cover rounded"
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Button variant="ghost" size="sm" className="p-1">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span>
          {currentImage}/{totalImages}
        </span>
        <Button variant="ghost" size="sm" className="p-1">
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="p-1">
          <Volume2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="p-1">
          <Copy className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="p-1">
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="p-1">
          <ThumbsDown className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="p-1">
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

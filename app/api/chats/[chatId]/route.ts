import { deleteChat, getChatById, toggleChatStar } from "@/lib/actions" // Assuming getChatById might be useful later
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = await params.chatId

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      )
    }

    const deletedChat = await deleteChat(chatId)

    if (!deletedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, chatId: deletedChat.id })
  } catch (error) {
    console.error("Error deleting chat:", error)
    return NextResponse.json({ error: "Error deleting chat" }, { status: 500 })
  }
}

// Optional: Add a GET handler for retrieving a single chat
export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = await params.chatId

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      )
    }

    const chat = await getChatById(chatId)

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error("Error fetching chat:", error)
    return NextResponse.json({ error: "Error fetching chat" }, { status: 500 })
  }
}

// PATCH handler for updating chat properties (specifically starring)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = await params.chatId
    const body = await request.json()
    const { starred } = body // Expecting { starred: boolean } in the body for now, could expand later

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      )
    }

    // For toggling star, we can just call toggleChatStar action
    // If you want to set a specific star status, you'd modify toggleChatStar or create a new action
    const updatedChat = await toggleChatStar(chatId)

    if (!updatedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error("Error updating chat:", error)
    return NextResponse.json({ error: "Error updating chat" }, { status: 500 })
  }
}

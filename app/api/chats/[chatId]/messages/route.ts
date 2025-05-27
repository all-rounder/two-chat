import { NextResponse } from "next/server"
import { getMessagesByChatId } from "@/lib/actions"

// GET /api/chats/[chatId]/messages - Fetch messages for a specific chat
export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      )
    }

    const messages = await getMessagesByChatId(chatId)
    return NextResponse.json(messages)
  } catch (error) {
    console.error(`Error fetching messages for chat ${params.chatId}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

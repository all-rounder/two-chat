import { NextResponse } from "next/server"
import { getUserChats, createChat } from "@/lib/actions" // Assuming lib/mongoose.ts is in your project root

// GET /api/chats - Fetch all chats for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const chats = await getUserChats(userId)
    console.log("Got chats")
    return NextResponse.json(chats)
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    )
  }
}

// POST /api/chats - Create a new chat
export async function POST(request: Request) {
  try {
    const { participants, title } = await request.json()

    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return NextResponse.json(
        { error: "Participants array is required and cannot be empty" },
        { status: 400 }
      )
    }

    const newChat = await createChat(participants, title)
    return NextResponse.json(newChat, { status: 201 })
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    )
  }
}

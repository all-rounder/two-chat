import { NextResponse } from "next/server"
import { updateChat } from "@/lib/actions"

export async function PATCH(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params
    const { title } = await request.json()

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const updatedChat = await updateChat(chatId, { title })
    if (!updatedChat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    return NextResponse.json(updatedChat, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update chat title" },
      { status: 500 }
    )
  }
}

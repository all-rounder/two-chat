import { GoogleGenAI } from "@google/genai"
import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/dbConnect"
import { createMessage, updateChat } from "@/lib/actions" // Import necessary functions

// Initialize the Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" })

export async function POST(request: Request) {
  try {
    await dbConnect() // Ensure database connection is established

    const { chatId, message, model } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        { error: "Chat ID is required" },
        { status: 400 }
      )
    }
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message content is required and must be a string" },
        { status: 400 }
      )
    }
    if (!model || typeof model !== "string") {
      return NextResponse.json(
        { error: "Model is required and must be a string" },
        { status: 400 }
      )
    }

    // In a real app, get the actual userId from the authenticated session
    const userId = "user_2xcQKaXfA2hc5k9R492Lqqvshl5" // Use the same placeholder ID as on the client

    // 1. Save the user message to the database
    await createMessage(chatId, userId, message)

    // 2. Update the chat's updatedAt timestamp
    await updateChat(chatId, { updatedAt: new Date() })

    // 3. Call your LLM service (existing logic)
    // This part depends on your LLM integration.
    // Example placeholder:
    // const llmResponse = await callLlmApi(message, model); // Replace with your actual LLM call
    // For now, let's simulate a bot response:

    const response = await genAI.models.generateContent({
      model: model,
      contents: message,
    })

    const llmResponse = response.text

    // 4. Save the bot response to the database
    // Check if llmResponse is valid before saving
    if (llmResponse && typeof llmResponse === "string") {
      await createMessage(chatId, "bot", llmResponse) // Assuming 'bot' is the sender ID for the assistant
      // Update the chat's updatedAt timestamp again after bot response
      await updateChat(chatId, { updatedAt: new Date() })
    } else {
      console.warn("LLM returned an invalid response:", llmResponse)
      // Optionally save an error message from the bot side
      await createMessage(
        chatId,
        "bot",
        "Sorry, I received an invalid response from the AI."
      )
    }

    // 5. Return the bot response to the client
    return NextResponse.json({ response: llmResponse }) // Return the actual LLM response
  } catch (error) {
    console.error("Error processing chat message:", error)
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    )
  }
}

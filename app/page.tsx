import { auth, currentUser } from "@clerk/nextjs/server" // Adjust import path as needed for Clerk
import { getUserChats } from "@/lib/actions" // You may need to implement this
import ChatApp from "@/components/chat-app"

// Placeholder for a user ID. In a real app, this would come from authentication.
const PLACEHOLDER_USER_ID = "user_2xcQKaXfA2hc5k9R492Lqqvshl5"

export default async function HomePage() {
  // Get the userId from auth() -- if null, the user is not signed in
  const { userId } = await auth()
  console.log("userId", userId)

  // Protect the route by checking if the user is signed in
  if (!userId) {
    return <div>Please log in to view your chats.</div>
  }

  // Get the Backend API User object when you need access to the user's information
  const user = await currentUser()
  console.log("Welcome, ", user?.username)

  // Fetch initial chat list for this user
  const userChats = await getUserChats(userId)

  // Fom stackoverlow.com
  // you should before passing data to page for use data, convert to string and so to json
  const initialChats = JSON.parse(JSON.stringify(userChats))

  return <ChatApp initialChats={initialChats} userId={userId} />
}

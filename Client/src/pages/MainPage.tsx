import { useEffect, useState } from "react"
import type { User } from "../types"

function MainPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(localStorage.getItem("user_data") ? JSON.parse(localStorage.getItem("user_data") as string) : null)
  }, [])

  return (
    <>
      <h1 className="text-3xl font-bold underline">
        Hello, {user ? user.firstName : "Guest"}!
      </h1>
    </>
  )
}

export default MainPage

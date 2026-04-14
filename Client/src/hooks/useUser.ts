import { useEffect, useState } from "react"
import type { User } from "../types"

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(localStorage.getItem("user_data") ? JSON.parse(localStorage.getItem("user_data") as string) : null)
  }, [])

  return {
    user
  }
}
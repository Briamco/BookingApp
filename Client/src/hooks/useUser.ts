import { useAuth } from "../context/AuthContext"

export const useUser = () => {
  const { user } = useAuth()

  return {
    user
  }
}
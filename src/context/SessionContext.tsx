import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import LoadingPage from "../pages/LoadingPage"
import type { Session, User } from "@supabase/supabase-js"
import { supabase } from "../app/supabaseClient"

const SessionContext = createContext<{
  session: Session | null
  user: User | null
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
}>({
  session: null,
  user: null,
  setUser: () => {
    // Empty
  },
  setSession: () => {
    // Empty
  },
})

export const useSession = () => {
  return useContext(SessionContext)
}

export const useLogout = () => {
  const { setSession, setUser } = useContext(SessionContext)
  return async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
  }
}

export const useUser = () => {
  const { user } = useContext(SessionContext)
  return user
}

type Props = { children: ReactNode }
export const SessionProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authStateListener = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      authStateListener.data.subscription.unsubscribe()
    }
  }, [])

  return (
    <SessionContext.Provider value={{ session, user, setUser, setSession }}>
      {isLoading ? <LoadingPage /> : children}
    </SessionContext.Provider>
  )
}

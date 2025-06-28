import { createContext, useContext, useEffect, useState } from "react"
import LoadingPage from "../pages/LoadingPage"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "../app/supabaseClient"

const SessionContext = createContext<{
  session: Session | null
  user: User | null
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
}>({
  session: null,
  user: null,
  setUser: () => {},
  setSession: () => {},
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

type Props = { children: React.ReactNode }
export const SessionProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authStateListener = supabase.auth.onAuthStateChange(
      async (_, session) => {
        console.log("Setting user sesssion:", session)
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      },
    )

    return () => {
      authStateListener.data.subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <SessionContext.Provider value={{ session, user, setUser, setSession }}>
      {isLoading ? <LoadingPage /> : children}
    </SessionContext.Provider>
  )
}

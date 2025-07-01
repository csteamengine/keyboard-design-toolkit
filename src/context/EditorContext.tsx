import type { ReactNode } from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { supabase } from "../app/supabaseClient"
import type { Keyboard } from "../types/KeyboardTypes"
import { useSession } from "./SessionContext"
import type { PostgrestError } from "@supabase/supabase-js"
import { setKeyboard } from "../app/editorSlice.tsx"
import { useAppDispatch } from "../app/hooks.ts"

type EditorContextType = {
  keyboards: Keyboard[]
  fetchKeyboards: () => Promise<{
    data: Keyboard[] | null
    error: PostgrestError | null
  }>
  fetchKeyboard: (id: string) => Promise<{
    data: Keyboard | null
    error: PostgrestError | null
  }>
  createKeyboard: (input: Partial<Keyboard>) => Promise<{
    data: Keyboard | null
    error: PostgrestError | null
  }>
  updateKeyboard: (
    id: string,
    updates: Partial<Keyboard>,
  ) => Promise<{
    data: Keyboard | null
    error: PostgrestError | null
  }>
  deleteKeyboard: (id: string) => Promise<{
    success: boolean
    error: PostgrestError | null
  }>
}

const EditorContext = createContext<EditorContextType>({
  keyboards: [],
  fetchKeyboards: async () => ({ data: null, error: null }),
  fetchKeyboard: async () => ({ data: null, error: null }),
  createKeyboard: async () => ({ data: null, error: null }),
  updateKeyboard: async () => ({ data: null, error: null }),
  deleteKeyboard: async () => ({ success: false, error: null }),
})

// Custom hooks
export const useFetchKeyboards = () => useContext(EditorContext).fetchKeyboards
export const useFetchKeyboard = () => useContext(EditorContext).fetchKeyboard
export const useCreateKeyboard = () => useContext(EditorContext).createKeyboard
export const useUpdateKeyboard = () => useContext(EditorContext).updateKeyboard
export const useDeleteKeyboard = () => useContext(EditorContext).deleteKeyboard

type Props = { children: ReactNode }

export const EditorProvider = ({ children }: Props) => {
  const { user } = useSession()
  const [keyboards, setKeyboards] = useState<Keyboard[]>([])
  const dispatch = useAppDispatch()

  const fetchKeyboards = useCallback(async () => {
    const { data, error } = await supabase
      .from("keyboards")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) {
      setKeyboards(data)
    }

    return { data, error }
  }, [])

  const fetchKeyboard = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("keyboards")
      .select("*")
      .eq("id", id)
      .single()

    return { data, error }
  }, [])

  const createKeyboard = useCallback(
    async (input: Partial<Keyboard>) => {
      if (!user) return { data: null, error: null }

      const { data, error } = await supabase
        .from("keyboards")
        .insert({ ...input, user_id: user.id })
        .select()
        .single()

      if (data) {
        setKeyboards(prev => [data, ...prev])
      }

      return { data, error }
    },
    [user],
  )

  const updateKeyboard = useCallback(
    async (id: string, updates: Partial<Keyboard>) => {
      const { data, error } = await supabase
        .from("keyboards")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (data) {
        setKeyboards(prev =>
          prev.map(k => (k.id === id ? { ...k, ...data } : k)),
        )
      }

      return { data, error }
    },
    [],
  )

  const deleteKeyboard = useCallback(async (id: string) => {
    const { error } = await supabase.from("keyboards").delete().eq("id", id)

    if (!error) {
      setKeyboards(prev => prev.filter(k => k.id !== id))
    }

    return { success: !error, error }
  }, [])

  return (
    <EditorContext.Provider
      value={{
        keyboards,
        fetchKeyboards,
        fetchKeyboard,
        createKeyboard,
        updateKeyboard,
        deleteKeyboard,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

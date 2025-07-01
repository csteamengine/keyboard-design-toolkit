import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { Node } from "@xyflow/react"
import { RootState } from "./store"

export type KeyboardLayout = unknown // Replace with actual layout type if known

export type Keyboard = {
  id: string
  name: string
  description?: string
  user_id: string
  created_at: string
  updated_at: string
  reactflow?: KeyboardLayout
  settings?: Record<string, unknown>
}

interface EditorState {
  keyboard: Keyboard | null
  selectedNodes: Node[] | null
}

const initialState: EditorState = {
  keyboard: null,
  selectedNodes: [],
}

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setKeyboard(state, action: PayloadAction<Keyboard>) {
      state.keyboard = action.payload
    },
    clearKeyboard(state) {
      state.keyboard = null
    },
    setSelectedNodes(state, action: PayloadAction<Node[] | null>) {
      state.selectedNodes = action.payload
    },
  },
})

export const { setKeyboard, clearKeyboard, setSelectedNodes } =
  editorSlice.actions

export const selectSelectedNodes = (state: RootState) =>
  state.editor.selectedNodes

export default editorSlice.reducer

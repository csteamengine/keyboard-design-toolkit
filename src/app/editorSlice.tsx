import type { PayloadAction } from "@reduxjs/toolkit"
import { createSlice } from "@reduxjs/toolkit"
import type { RootState } from "./store"
import type { Keyboard } from "../types/KeyboardTypes.ts"

type EditorState = {
  keyboard: Keyboard | null
}

const initialState: EditorState = {
  keyboard: null,
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
  },
})

export const { setKeyboard, clearKeyboard } = editorSlice.actions

export const selectKeyboard = (state: RootState): Keyboard | null =>
  state.editor.keyboard

export default editorSlice.reducer

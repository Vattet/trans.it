"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type Language = "en" | "fr"

interface LanguageStore {
  language: Language
  setLanguage: (language: Language) => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "en" as Language,
      setLanguage: (language: Language) => set({ language }),
    }),
    {
      name: "tranzit-language",
    },
  ),
)

export const useLanguage = () => {
  const { language, setLanguage } = useLanguageStore()
  return { language, setLanguage }
}

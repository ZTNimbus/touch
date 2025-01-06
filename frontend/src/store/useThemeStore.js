import { create } from "zustand";

const useThemeStore = create((set) => {
  return {
    theme: localStorage.getItem("chat-theme") || "night",

    setTheme: (theme) => {
      localStorage.setItem("chat-theme", theme);
      set({ theme });
    },
  };
});

export default useThemeStore;

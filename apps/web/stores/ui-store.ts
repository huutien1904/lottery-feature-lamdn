import { create } from "zustand";

/** Example global UI slice — extend as the shell grows (sidebar, modals, etc.). */
export const useUiStore = create<{
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

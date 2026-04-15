import { create } from 'zustand'

interface UiState {
  isProfileEditOpen: boolean
  activeTimelineTab: 'following' | 'global'
  activeProfileTab: 'tweets' | 'likes'
  activeSearchTab: 'users' | 'tweets'
  isTweetModalOpen: boolean
  setIsProfileEditOpen: (v: boolean) => void
  setActiveTimelineTab: (v: 'following' | 'global') => void
  setActiveProfileTab: (v: 'tweets' | 'likes') => void
  setActiveSearchTab: (v: 'users' | 'tweets') => void
  setIsTweetModalOpen: (v: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  isProfileEditOpen: false,
  activeTimelineTab: 'following',
  activeProfileTab: 'tweets',
  activeSearchTab: 'users',
  isTweetModalOpen: false,
  setIsProfileEditOpen: (v) => set({ isProfileEditOpen: v }),
  setActiveTimelineTab: (v) => set({ activeTimelineTab: v }),
  setActiveProfileTab: (v) => set({ activeProfileTab: v }),
  setActiveSearchTab: (v) => set({ activeSearchTab: v }),
  setIsTweetModalOpen: (v) => set({ isTweetModalOpen: v }),
}))

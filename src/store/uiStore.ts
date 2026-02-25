import { create } from 'zustand'

interface UIStore {
  // Panel izquierdo
  activeTab: 'project' | 'furniture' | 'params' | 'modules' | 'materials'
  setActiveTab: (tab: UIStore['activeTab']) => void

  // Visor 3D
  showDoors: boolean
  toggleDoors: () => void
  showDimensions: boolean
  toggleDimensions: () => void
  cameraView: 'perspective' | 'front' | 'side' | 'top'
  setCameraView: (view: UIStore['cameraView']) => void

  // Panel inferior
  bottomTab: 'bom' | 'cutlist' | 'cost'
  setBottomTab: (tab: UIStore['bottomTab']) => void
  bottomPanelHeight: number
  setBottomPanelHeight: (h: number) => void

  // BOM mode
  bomMode: 'single' | 'consolidated'
  setBomMode: (mode: UIStore['bomMode']) => void
}

export const useUIStore = create<UIStore>()((set) => ({
  // Panel izquierdo
  activeTab: 'project',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Visor 3D
  showDoors: true,
  toggleDoors: () => set((state) => ({ showDoors: !state.showDoors })),
  showDimensions: true,
  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),
  cameraView: 'perspective',
  setCameraView: (view) => set({ cameraView: view }),

  // Panel inferior
  bottomTab: 'bom',
  setBottomTab: (tab) => set({ bottomTab: tab }),
  bottomPanelHeight: 280,
  setBottomPanelHeight: (h) => set({ bottomPanelHeight: h }),

  // BOM mode
  bomMode: 'single',
  setBomMode: (mode) => set({ bomMode: mode }),
}))

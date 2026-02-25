import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, Furniture, FurnitureTypeId, Currency, FurnitureResult, WardrobeParams, MaterialMap, FinishMap } from '@/engine/types'
import { generateId as genId } from '@/utils/generateId'
import {
  generateWardrobeParts,
  inferWardrobeHardware,
  generateBOM,
  generateCutList,
  calculateCost,
} from '@/engine'
import { MATERIALS } from '@/data/materials'
import { FINISHES } from '@/data/finishes'

interface ProjectStore {
  // Estado
  projects: Project[]
  activeProjectId: string | null

  // Getters derivados
  activeProject: () => Project | null
  activeFurnitures: () => Furniture[]

  // Acciones — Proyectos
  createProject: (name: string, currency?: Currency) => Project
  loadProject: (id: string) => void
  deleteProject: (id: string) => void
  updateProjectName: (name: string) => void
  updateProjectMargin: (margin: number) => void

  // Acciones — Muebles
  addFurniture: (type: FurnitureTypeId, name: string) => Furniture
  updateFurniture: (id: string, updates: Partial<Furniture>) => void
  duplicateFurniture: (id: string) => Furniture | null
  deleteFurniture: (id: string) => void
  setActiveFurniture: (id: string | null) => void
  activeFurnitureId: string | null

  // Motor paramétrico
  computeFurnitureResult: (furnitureId: string, materialMap?: MaterialMap, finishMap?: FinishMap) => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      activeFurnitureId: null,

      activeProject: () => {
        const { projects, activeProjectId } = get()
        return projects.find(p => p.id === activeProjectId) ?? null
      },

      activeFurnitures: () => {
        return get().activeProject()?.furnitures ?? []
      },

      createProject: (name, currency = 'USD') => {
        const now = new Date().toISOString()
        const project: Project = {
          id: genId(),
          name,
          currency,
          profitMargin: 30,
          createdAt: now,
          updatedAt: now,
          furnitures: [],
        }
        set(state => ({
          projects: [...state.projects, project],
          activeProjectId: project.id,
          activeFurnitureId: null,
        }))
        return project
      },

      loadProject: (id) => {
        set({ activeProjectId: id, activeFurnitureId: null })
      },

      deleteProject: (id) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        }))
      },

      updateProjectName: (name) => {
        const { activeProjectId } = get()
        if (!activeProjectId) return
        set(state => ({
          projects: state.projects.map(p =>
            p.id === activeProjectId
              ? { ...p, name, updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      updateProjectMargin: (profitMargin) => {
        const { activeProjectId } = get()
        if (!activeProjectId) return
        set(state => ({
          projects: state.projects.map(p =>
            p.id === activeProjectId
              ? { ...p, profitMargin, updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      addFurniture: (type, name) => {
        const { activeProjectId } = get()
        const defaultParams = getDefaultParams(type)
        const furniture: Furniture = {
          id: genId(),
          projectId: activeProjectId ?? '',
          name,
          furnitureType: type,
          params: defaultParams,
          modules: [],
          position: { x: 0, y: 0, z: 0 },
          rotationY: 0,
        }
        set(state => ({
          projects: state.projects.map(p =>
            p.id === activeProjectId
              ? {
                  ...p,
                  furnitures: [...p.furnitures, furniture],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          activeFurnitureId: furniture.id,
        }))
        // Cálculo automático del resultado tras crear el mueble
        get().computeFurnitureResult(furniture.id)
        return furniture
      },

      updateFurniture: (id, updates) => {
        const { activeProjectId } = get()
        set(state => ({
          projects: state.projects.map(p =>
            p.id === activeProjectId
              ? {
                  ...p,
                  furnitures: p.furnitures.map(f =>
                    f.id === id ? { ...f, ...updates } : f
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }))
        // Re-cálculo automático solo cuando cambian params o modules
        // (no cuando el update ES el resultado calculado — evita bucle infinito)
        if (updates.params !== undefined || updates.modules !== undefined) {
          get().computeFurnitureResult(id)
        }
      },

      duplicateFurniture: (id) => {
        const project = get().activeProject()
        const original = project?.furnitures.find(f => f.id === id)
        if (!original) return null
        const copy: Furniture = {
          ...original,
          id: genId(),
          name: `${original.name} (copia)`,
          position: { ...original.position, x: original.position.x + 100 },
        }
        set(state => ({
          projects: state.projects.map(p =>
            p.id === get().activeProjectId
              ? {
                  ...p,
                  furnitures: [...p.furnitures, copy],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          activeFurnitureId: copy.id,
        }))
        return copy
      },

      deleteFurniture: (id) => {
        const { activeProjectId, activeFurnitureId } = get()
        set(state => ({
          projects: state.projects.map(p =>
            p.id === activeProjectId
              ? {
                  ...p,
                  furnitures: p.furnitures.filter(f => f.id !== id),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          activeFurnitureId: activeFurnitureId === id ? null : activeFurnitureId,
        }))
      },

      setActiveFurniture: (id) => {
        set({ activeFurnitureId: id })
      },

      computeFurnitureResult: (furnitureId, materialMap = MATERIALS, finishMap = FINISHES) => {
        // 1. Encuentra el mueble en el proyecto activo
        const furniture = get().activeProject()?.furnitures.find(f => f.id === furnitureId)
        if (!furniture) return

        // 2. Solo ropero en Fase 1
        if (furniture.furnitureType !== 'wardrobe') return

        // 3. Genera piezas
        const parts = generateWardrobeParts(
          furnitureId,
          furniture.params as WardrobeParams,
          furniture.modules,
          materialMap,
          'mdf_18',  // material por defecto
          'raw',     // acabado por defecto
        )

        // 4. Infiere herrajes
        const hardware = inferWardrobeHardware(
          furnitureId,
          furniture.params as WardrobeParams,
          furniture.modules,
        )

        // 5. Genera BOM
        const project = get().activeProject()!
        const bom = generateBOM(furnitureId, parts, hardware, materialMap, finishMap)

        // 6. Genera CutList
        const cutList = generateCutList(furnitureId, parts, materialMap)

        // 7. Calcula costo
        const cost = calculateCost(furnitureId, bom, project.profitMargin)

        // 8. Construye FurnitureResult
        const result: FurnitureResult = { parts, bom, cutList, hardware, cost }

        // 9. Actualiza el mueble en el store (sin triggear otro auto-cálculo)
        get().updateFurniture(furnitureId, { result })
      },
    }),
    {
      name: 'furniture-studio-projects',
      // Solo persistimos los proyectos, no el estado transitorio de UI
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    }
  )
)

// ─── Helpers ─────────────────────────────────────────────────

function getDefaultParams(type: FurnitureTypeId) {
  switch (type) {
    case 'wardrobe':
      return {
        totalWidth: 1200,
        totalHeight: 2400,
        totalDepth: 600,
        boardThickness: 18,
        backPanelThickness: 6,
        hasBack: true,
        hasSocle: true,
        socleHeight: 100,
        doorType: 'hinged' as const,
        hangingRailHeight: 1600,
      }
    case 'kitchen_base':
      return {
        totalWidth: 600,
        totalHeight: 870,
        totalDepth: 600,
        boardThickness: 18,
        backPanelThickness: 6,
        hasBack: true,
        hasSocle: true,
        socleHeight: 100,
        doorType: 'hinged' as const,
        hasCountertop: true,
        countertopThickness: 30,
        countertopOverhang: 20,
      }
    case 'kitchen_wall':
      return {
        totalWidth: 600,
        totalHeight: 600,
        totalDepth: 300,
        boardThickness: 18,
        backPanelThickness: 6,
        hasBack: true,
        doorType: 'hinged' as const,
        mountingHeight: 1400,
      }
  }
}



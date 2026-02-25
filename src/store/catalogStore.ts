import { create } from 'zustand'
import type { Material, Finish, MaterialMap, FinishMap } from '@/engine/types'
import { MATERIALS } from '@/data/materials'
import { FINISHES } from '@/data/finishes'

interface CatalogStore {
  materials: MaterialMap
  finishes: FinishMap
  getMaterial: (id: string) => Material | undefined
  getFinish: (id: string) => Finish | undefined
  getMaterialList: () => Material[]
  getFinishList: () => Finish[]
}

export const useCatalogStore = create<CatalogStore>()(() => ({
  materials: MATERIALS,
  finishes: FINISHES,

  getMaterial: (id: string) => MATERIALS[id],
  getFinish: (id: string) => FINISHES[id],

  getMaterialList: () => Object.values(MATERIALS),
  getFinishList: () => Object.values(FINISHES),
}))

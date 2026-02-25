import type { Material, MaterialMap } from '@/engine/types'

// Todos los tableros en mm: 1220 × 2440
// standardSheetWidth y standardSheetLength son literales de tipo en Material

const sheet = {
  standardSheetWidth: 1220 as const,
  standardSheetLength: 2440 as const,
}

export const MATERIALS: MaterialMap = {
  mdf_15: {
    id: 'mdf_15',
    name: { es: 'MDF 15mm', en: 'MDF 15mm' },
    type: 'mdf',
    standardThicknesses: [15],
    density: 700,
    pricePerSqm: 10.0,
    ...sheet,
  } satisfies Material,

  mdf_18: {
    id: 'mdf_18',
    name: { es: 'MDF 18mm', en: 'MDF 18mm' },
    type: 'mdf',
    standardThicknesses: [18],
    density: 700,
    pricePerSqm: 12.0,
    ...sheet,
  } satisfies Material,

  mdf_25: {
    id: 'mdf_25',
    name: { es: 'MDF 25mm', en: 'MDF 25mm' },
    type: 'mdf',
    standardThicknesses: [25],
    density: 700,
    pricePerSqm: 16.0,
    ...sheet,
  } satisfies Material,

  melamine_18: {
    id: 'melamine_18',
    name: { es: 'Melamina 18mm', en: 'Melamine 18mm' },
    type: 'melamine',
    standardThicknesses: [18],
    density: 750,
    pricePerSqm: 14.0,
    ...sheet,
  } satisfies Material,

  plywood_18: {
    id: 'plywood_18',
    name: { es: 'Plywood 18mm', en: 'Plywood 18mm' },
    type: 'plywood',
    standardThicknesses: [18],
    density: 600,
    pricePerSqm: 18.0,
    ...sheet,
  } satisfies Material,

  hdf_3: {
    id: 'hdf_3',
    name: { es: 'HDF 3mm', en: 'HDF 3mm' },
    type: 'hdf',
    standardThicknesses: [3],
    density: 900,
    pricePerSqm: 4.0,
    ...sheet,
  } satisfies Material,

  hdf_6: {
    id: 'hdf_6',
    name: { es: 'HDF 6mm', en: 'HDF 6mm' },
    type: 'hdf',
    standardThicknesses: [6],
    density: 900,
    pricePerSqm: 6.0,
    ...sheet,
  } satisfies Material,

  solid_pine_18: {
    id: 'solid_pine_18',
    name: { es: 'Pino macizo 18mm', en: 'Solid Pine 18mm' },
    type: 'solid_wood',
    standardThicknesses: [18],
    density: 500,
    pricePerSqm: 28.0,
    ...sheet,
  } satisfies Material,

  solid_oak_20: {
    id: 'solid_oak_20',
    name: { es: 'Roble macizo 20mm', en: 'Solid Oak 20mm' },
    type: 'solid_wood',
    standardThicknesses: [20],
    density: 720,
    pricePerSqm: 65.0,
    ...sheet,
  } satisfies Material,
}

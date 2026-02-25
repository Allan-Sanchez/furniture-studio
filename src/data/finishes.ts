import type { Finish, FinishMap } from '@/engine/types'

export const FINISHES: FinishMap = {
  raw: {
    id: 'raw',
    name: { es: 'Natural', en: 'Raw' },
    colorHex: '#D2B48C',
    commercialName: 'Natural / Raw',
  } satisfies Finish,

  white: {
    id: 'white',
    name: { es: 'Blanco Polar', en: 'Polar White' },
    colorHex: '#FFFFFF',
    commercialName: 'Blanco Polar / Polar White',
  } satisfies Finish,

  black: {
    id: 'black',
    name: { es: 'Negro Mate', en: 'Matte Black' },
    colorHex: '#1C1C1C',
    commercialName: 'Negro Mate / Matte Black',
  } satisfies Finish,

  gray_light: {
    id: 'gray_light',
    name: { es: 'Gris Claro', en: 'Light Gray' },
    colorHex: '#D9D9D9',
    commercialName: 'Gris Claro / Light Gray',
  } satisfies Finish,

  gray_dark: {
    id: 'gray_dark',
    name: { es: 'Gris Oscuro', en: 'Dark Gray' },
    colorHex: '#5A5A5A',
    commercialName: 'Gris Oscuro / Dark Gray',
  } satisfies Finish,

  beige: {
    id: 'beige',
    name: { es: 'Beige Arena', en: 'Sand Beige' },
    colorHex: '#E8D5B7',
    commercialName: 'Beige Arena / Sand Beige',
  } satisfies Finish,

  oak_natural: {
    id: 'oak_natural',
    name: { es: 'Roble Natural', en: 'Natural Oak' },
    colorHex: '#C19A6B',
    commercialName: 'Roble Natural / Natural Oak',
  } satisfies Finish,

  oak_dark: {
    id: 'oak_dark',
    name: { es: 'Roble Oscuro', en: 'Dark Oak' },
    colorHex: '#6B3A2A',
    commercialName: 'Roble Oscuro / Dark Oak',
  } satisfies Finish,

  walnut: {
    id: 'walnut',
    name: { es: 'Nogal', en: 'Walnut' },
    colorHex: '#5D3A1A',
    commercialName: 'Nogal / Walnut',
  } satisfies Finish,

  cherry: {
    id: 'cherry',
    name: { es: 'Cerezo', en: 'Cherry' },
    colorHex: '#9B3A3A',
    commercialName: 'Cerezo / Cherry',
  } satisfies Finish,

  pine_natural: {
    id: 'pine_natural',
    name: { es: 'Pino Natural', en: 'Natural Pine' },
    colorHex: '#DEB887',
    commercialName: 'Pino Natural / Natural Pine',
  } satisfies Finish,

  wenge: {
    id: 'wenge',
    name: { es: 'Wengué', en: 'Wenge' },
    colorHex: '#3D2B1F',
    commercialName: 'Wengué / Wenge',
  } satisfies Finish,

  navy: {
    id: 'navy',
    name: { es: 'Azul Marino', en: 'Navy Blue' },
    colorHex: '#1B3A5C',
    commercialName: 'Azul Marino / Navy Blue',
  } satisfies Finish,

  olive: {
    id: 'olive',
    name: { es: 'Verde Olivo', en: 'Olive Green' },
    colorHex: '#6B7C45',
    commercialName: 'Verde Olivo / Olive Green',
  } satisfies Finish,

  terracotta: {
    id: 'terracotta',
    name: { es: 'Terracota', en: 'Terracotta' },
    colorHex: '#C4622D',
    commercialName: 'Terracota / Terracotta',
  } satisfies Finish,

  cream: {
    id: 'cream',
    name: { es: 'Crema', en: 'Cream' },
    colorHex: '#FFFDD0',
    commercialName: 'Crema / Cream',
  } satisfies Finish,

  anthracite: {
    id: 'anthracite',
    name: { es: 'Antracita', en: 'Anthracite' },
    colorHex: '#383E42',
    commercialName: 'Antracita / Anthracite',
  } satisfies Finish,

  bordeaux: {
    id: 'bordeaux',
    name: { es: 'Burdeos', en: 'Bordeaux' },
    colorHex: '#722F37',
    commercialName: 'Burdeos / Bordeaux',
  } satisfies Finish,

  sage: {
    id: 'sage',
    name: { es: 'Salvia', en: 'Sage Green' },
    colorHex: '#8F9779',
    commercialName: 'Salvia / Sage Green',
  } satisfies Finish,

  sand: {
    id: 'sand',
    name: { es: 'Arena', en: 'Sand' },
    colorHex: '#C2B280',
    commercialName: 'Arena / Sand',
  } satisfies Finish,
}

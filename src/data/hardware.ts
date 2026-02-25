import type { HardwareType } from '@/engine/types'

export interface HardwareCatalogItem {
  id: string
  type: HardwareType
  name: { es: string; en: string }
  unitPrice: number
  unit: string
}

export const HARDWARE_CATALOG: Record<string, HardwareCatalogItem> = {
  hinge_35: {
    id: 'hinge_35',
    type: 'hinge',
    name: { es: 'Bisagra cazoleta 35mm', en: 'Cup hinge 35mm' },
    unitPrice: 1.50,
    unit: 'unidad',
  },

  hinge_35_soft: {
    id: 'hinge_35_soft',
    type: 'hinge',
    name: { es: 'Bisagra cazoleta 35mm cierre suave', en: 'Soft-close cup hinge 35mm' },
    unitPrice: 3.50,
    unit: 'unidad',
  },

  slide_basic_450: {
    id: 'slide_basic_450',
    type: 'drawer_slide',
    name: { es: 'Corredera básica 450mm (par)', en: 'Basic drawer slide 450mm (pair)' },
    unitPrice: 8.00,
    unit: 'par',
  },

  slide_basic_500: {
    id: 'slide_basic_500',
    type: 'drawer_slide',
    name: { es: 'Corredera básica 500mm (par)', en: 'Basic drawer slide 500mm (pair)' },
    unitPrice: 9.00,
    unit: 'par',
  },

  slide_soft_450: {
    id: 'slide_soft_450',
    type: 'drawer_slide',
    name: { es: 'Corredera soft-close 450mm (par)', en: 'Soft-close drawer slide 450mm (pair)' },
    unitPrice: 15.00,
    unit: 'par',
  },

  slide_soft_500: {
    id: 'slide_soft_500',
    type: 'drawer_slide',
    name: { es: 'Corredera soft-close 500mm (par)', en: 'Soft-close drawer slide 500mm (pair)' },
    unitPrice: 17.00,
    unit: 'par',
  },

  handle_bar_128: {
    id: 'handle_bar_128',
    type: 'handle',
    name: { es: 'Jalador barra 128mm', en: 'Bar handle 128mm' },
    unitPrice: 4.00,
    unit: 'unidad',
  },

  handle_bar_256: {
    id: 'handle_bar_256',
    type: 'handle',
    name: { es: 'Jalador barra 256mm', en: 'Bar handle 256mm' },
    unitPrice: 6.00,
    unit: 'unidad',
  },

  handle_knob: {
    id: 'handle_knob',
    type: 'handle',
    name: { es: 'Jalador tipo botón', en: 'Knob handle' },
    unitPrice: 2.50,
    unit: 'unidad',
  },

  shelf_pin_5: {
    id: 'shelf_pin_5',
    type: 'shelf_pin',
    name: { es: 'Pin estante 5mm', en: 'Shelf pin 5mm' },
    unitPrice: 0.25,
    unit: 'unidad',
  },

  rail_support: {
    id: 'rail_support',
    type: 'hanging_rail_support',
    name: { es: 'Soporte barra colgar', en: 'Hanging rail support' },
    unitPrice: 3.50,
    unit: 'unidad',
  },

  sliding_rail_kit: {
    id: 'sliding_rail_kit',
    type: 'sliding_door_rail',
    name: { es: 'Kit riel corredero (par rieles)', en: 'Sliding door rail kit (pair)' },
    unitPrice: 25.00,
    unit: 'kit',
  },
}

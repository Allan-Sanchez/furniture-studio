/**
 * Genera un ID único corto (9 caracteres alfanuméricos)
 * Suficiente para identificadores de proyecto/mueble en localStorage
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

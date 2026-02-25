// ============================================================
// FURNITURE STUDIO — services/storage.ts
// Persistencia en localStorage e import/export JSON
// ============================================================

import type { Project } from '@/engine/types'

const STORAGE_KEY = 'furniture-studio-v1'

// ─── LocalStorage ────────────────────────────────────────────

/**
 * Serializa y guarda la lista de proyectos en localStorage.
 */
export function saveProjectsToStorage(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch (err) {
    console.error('[storage] Error al guardar proyectos:', err)
  }
}

/**
 * Lee y parsea la lista de proyectos desde localStorage.
 * Retorna [] si no existe o si el JSON es inválido.
 */
export function loadProjectsFromStorage(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Project[]
  } catch (err) {
    console.error('[storage] Error al cargar proyectos:', err)
    return []
  }
}

/**
 * Elimina la clave de proyectos del localStorage.
 */
export function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ─── Export JSON ──────────────────────────────────────────────

/**
 * Descarga un proyecto como archivo `.fstudio.json`.
 * Usa el DOM (solo válido en browser).
 */
export function exportProjectAsJSON(project: Project): void {
  const json = JSON.stringify(project, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const filename = `${slugify(project.name)}.fstudio.json`
  triggerDownload(url, filename)

  // Libera la URL de objeto después de la descarga
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

// ─── Import JSON ──────────────────────────────────────────────

/**
 * Abre un file picker para importar un proyecto desde un archivo `.fstudio.json`.
 * Retorna el proyecto parseado, o `null` si el usuario cancela o hay error.
 */
export function importProjectFromJSON(): Promise<Project | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.fstudio.json'

    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const text = e.target?.result
          if (typeof text !== 'string') {
            resolve(null)
            return
          }
          const project = JSON.parse(text) as Project
          resolve(project)
        } catch (err) {
          console.error('[storage] Error al parsear JSON:', err)
          resolve(null)
        }
      }

      reader.onerror = () => {
        console.error('[storage] Error al leer el archivo')
        resolve(null)
      }

      reader.readAsText(file)
    })

    // Si el usuario cierra el diálogo sin elegir archivo
    // el evento 'change' no dispara — resolvemos null con un timeout
    input.addEventListener('cancel', () => resolve(null))

    input.click()
  })
}

// ─── Export todos los proyectos ───────────────────────────────

/**
 * Exporta todos los proyectos del localStorage como un único JSON de backup.
 * Útil para respaldar toda la sesión de trabajo.
 */
export function exportAllProjectsAsJSON(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const projects: Project[] = raw ? (JSON.parse(raw) as Project[]) : []

    const backup = {
      exportedAt: new Date().toISOString(),
      version: 1,
      projects,
    }

    const json = JSON.stringify(backup, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    triggerDownload(url, `furniture-studio-backup-${timestamp}.json`)

    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  } catch (err) {
    console.error('[storage] Error al exportar todos los proyectos:', err)
  }
}

// ─── Helpers privados ─────────────────────────────────────────

/** Convierte un nombre en slug seguro para nombre de archivo */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // elimina diacríticos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'proyecto'
}

/** Crea un enlace <a> temporal y dispara la descarga */
function triggerDownload(url: string, filename: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

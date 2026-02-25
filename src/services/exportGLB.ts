// ============================================================
// FURNITURE STUDIO — services/exportGLB.ts
// Exportación de la escena 3D en formato GLB
// ============================================================
// Usa GLTFExporter de Three.js (importado de forma lazy para
// evitar penalizar el bundle cuando no se usa la función).
// ============================================================

import type { Object3D } from 'three'

/**
 * Exporta un Object3D de Three.js (o una Scene) como archivo GLB.
 * Usa importación dinámica de GLTFExporter para no cargar Three.js addons
 * en el bundle principal.
 *
 * @param scene    — Objeto 3D o Scene a exportar
 * @param filename — Nombre del archivo (por defecto: "furniture.glb")
 */
export async function exportSceneAsGLB(
  scene: Object3D,
  filename = 'furniture.glb',
): Promise<void> {
  // Importación lazy — solo se carga cuando se llama a esta función
  const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js')

  const exporter = new GLTFExporter()

  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        try {
          // El resultado es un ArrayBuffer cuando binary=true
          if (!(result instanceof ArrayBuffer)) {
            reject(new Error('[exportGLB] Se esperaba ArrayBuffer (binary=true)'))
            return
          }

          const blob = new Blob([result], { type: 'model/gltf-binary' })
          const url = URL.createObjectURL(blob)

          const a = document.createElement('a')
          a.href = url
          a.download = filename
          a.style.display = 'none'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)

          setTimeout(() => URL.revokeObjectURL(url), 10_000)
          resolve()
        } catch (err) {
          reject(err)
        }
      },
      (error) => {
        reject(new Error(`[exportGLB] Error del exportador: ${String(error)}`))
      },
      { binary: true },
    )
  })
}

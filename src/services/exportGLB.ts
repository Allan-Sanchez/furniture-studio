// ============================================================
// FURNITURE STUDIO — services/exportGLB.ts
// Exportación de la escena 3D en formato GLB con materiales reales
// ============================================================
// Construye una escena THREE.js manualmente (sin Canvas r3f)
// usando MeshStandardMaterial con el color correcto por pieza.
//
// Jerarquía de color por pieza:
//   1. part.finishId → FINISHES[finishId].colorHex
//   2. part.materialId → MATERIALS[materialId].colorHex (si existe)
//   3. partColor(part) — fallback categórico de FurnitureParts
// ============================================================
//
// Import del GLTFExporter:
//   'three/addons/exporters/GLTFExporter.js'
//   mapea (vía package.json exports) a:
//   'three/examples/jsm/exporters/GLTFExporter.js'
//   Ambos paths son equivalentes en three@0.183.
// ============================================================

import * as THREE from 'three'
import type { Furniture, Project, Part } from '@/engine/types'
import { FINISHES } from '@/data/finishes'
import { MATERIALS } from '@/data/materials'
import { partColor, partScale, partPosition } from '@/scene/FurnitureParts'

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Resuelve el color hex para una pieza siguiendo la jerarquía:
 *   finishId → materialId → partColor fallback
 */
function resolvePartColor(part: Part): string {
  // 1. Acabado (finish) — prioridad máxima
  if (part.finishId && part.finishId !== 'raw') {
    const finish = FINISHES[part.finishId]
    if (finish?.colorHex) return finish.colorHex
  }

  // 2. Material — colorHex no existe en la interfaz Material estándar,
  //    pero algunos materiales tienen color implícito por tipo.
  //    Fallback por tipo de material:
  if (part.materialId) {
    const mat = MATERIALS[part.materialId]
    if (mat) {
      switch (mat.type) {
        case 'hdf':         return '#D4C5A9'  // crema HDF
        case 'melamine':    return '#E8E0D4'  // crema melamina
        case 'plywood':     return '#C8A97A'  // madera triplay
        case 'solid_wood':  return '#B8864E'  // madera maciza
        default:            return '#C8C0B8'  // MDF gris neutro
      }
    }
  }

  // 3. Fallback categórico
  return partColor(part)
}

/**
 * Descarga un ArrayBuffer como archivo .glb
 */
function downloadArrayBuffer(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], { type: 'model/gltf-binary' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * Construye un THREE.Group con todos los meshes de un mueble.
 * Reutiliza partScale y partPosition de FurnitureParts.
 */
function buildFurnitureGroup(furniture: Furniture): THREE.Group {
  const group = new THREE.Group()
  group.name = furniture.name

  const { result } = furniture
  if (!result || result.parts.length === 0) return group

  // Expandir piezas por quantity (igual que FurnitureModel)
  const expandedParts: { part: Part; unitIndex: number }[] = []
  for (const part of result.parts) {
    for (let q = 0; q < part.quantity; q++) {
      expandedParts.push({ part, unitIndex: q })
    }
  }

  const geometryCache = new Map<string, THREE.BoxGeometry>()
  const materialCache = new Map<string, THREE.MeshStandardMaterial>()

  for (const { part, unitIndex } of expandedParts) {
    const scale = partScale(part)
    const position = partPosition(part, unitIndex, furniture)
    const color = resolvePartColor(part)

    // Reusar geometría idéntica
    const geoKey = `${scale[0]}_${scale[1]}_${scale[2]}`
    let geometry = geometryCache.get(geoKey)
    if (!geometry) {
      geometry = new THREE.BoxGeometry(scale[0], scale[1], scale[2])
      geometryCache.set(geoKey, geometry)
    }

    // Reusar material del mismo color
    let material = materialCache.get(color)
    if (!material) {
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.6,
        metalness: 0.05,
      })
      materialCache.set(color, material)
    }

    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = part.partCode
      ? `${part.partCode}_${part.label}`
      : part.label

    mesh.position.set(position[0], position[1], position[2])
    // scale ya está aplicado en la geometría, no en la escala del mesh
    // (consistente con el render r3f que usa scale en el mesh con geom [1,1,1])
    // Aquí usamos geometría pre-escalada, así que mesh.scale = [1,1,1]

    group.add(mesh)
  }

  // Posición global del grupo (igual que FurnitureModel)
  group.position.set(
    furniture.position.x / 1000,
    furniture.position.y / 1000,
    furniture.position.z / 1000,
  )
  group.rotation.y = (furniture.rotationY * Math.PI) / 180

  return group
}

/**
 * Exporta un THREE.Object3D como GLB y lo descarga.
 */
async function exportObject3DasGLB(
  object: THREE.Object3D,
  filename: string,
): Promise<void> {
  // Import lazy — solo carga three/addons cuando se invoca
  const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js')
  const exporter = new GLTFExporter()

  return new Promise((resolve, reject) => {
    exporter.parse(
      object,
      (result) => {
        try {
          if (!(result instanceof ArrayBuffer)) {
            reject(new Error('[exportGLB] Se esperaba ArrayBuffer (binary=true)'))
            return
          }
          downloadArrayBuffer(result, filename)
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

// ─── API pública ──────────────────────────────────────────────

/**
 * Exporta todos los muebles del proyecto activo como un solo archivo GLB.
 * Descarga como "{projectName}.glb"
 */
export async function exportProjectGLB(project: Project): Promise<void> {
  const scene = new THREE.Scene()
  scene.name = project.name

  for (const furniture of project.furnitures) {
    const group = buildFurnitureGroup(furniture)
    scene.add(group)
  }

  const filename = `${project.name.replace(/[^a-z0-9_\-]/gi, '_')}.glb`
  await exportObject3DasGLB(scene, filename)
}

/**
 * Exporta un solo mueble como GLB.
 * Descarga como "{furniture.name}.glb"
 */
export async function exportFurnitureGLB(furniture: Furniture): Promise<void> {
  const group = buildFurnitureGroup(furniture)
  const filename = `${furniture.name.replace(/[^a-z0-9_\-]/gi, '_')}.glb`
  await exportObject3DasGLB(group, filename)
}

/**
 * @deprecated Usar exportProjectGLB o exportFurnitureGLB en su lugar.
 * Mantiene compatibilidad con código anterior que recibía un Object3D externo.
 */
export async function exportSceneAsGLB(
  scene: THREE.Object3D,
  filename = 'furniture.glb',
): Promise<void> {
  await exportObject3DasGLB(scene, filename)
}

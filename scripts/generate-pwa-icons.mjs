/**
 * Genera íconos PWA placeholder para public/icon-192.png y public/icon-512.png.
 * Requiere solo módulos built-in de Node.js — sin dependencias externas.
 *
 * Uso: node scripts/generate-pwa-icons.mjs
 *
 * Para cambiar el logo: reemplazá public/icon-192.png y public/icon-512.png
 * con tus archivos PNG finales. El manifest.ts no necesita modificarse.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

// CRC32
const crcTable = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  crcTable[i] = c
}
function crc32(buf) {
  let crc = 0xffffffff
  for (const byte of buf) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])))
  return Buffer.concat([len, typeBytes, data, crcBuf])
}

/**
 * Genera un PNG cuadrado de color sólido con esquinas redondeadas (simuladas).
 * @param {number} size - Tamaño en píxeles (ej: 192)
 * @param {number} r - Rojo (0-255)
 * @param {number} g - Verde (0-255)
 * @param {number} b - Azul (0-255)
 */
function generatePNG(size, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // RGBA (para transparencia en esquinas)

  const radius = Math.round(size * 0.2) // 20% border-radius
  const cx = size / 2
  const cy = size / 2

  const rowBytes = size * 4 // RGBA
  const raw = Buffer.alloc((rowBytes + 1) * size)

  for (let y = 0; y < size; y++) {
    raw[y * (rowBytes + 1)] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      const i = y * (rowBytes + 1) + 1 + x * 4

      // Calcular si el píxel está dentro del rectángulo redondeado
      const dx = Math.max(radius - x, 0, x - (size - 1 - radius))
      const dy = Math.max(radius - y, 0, y - (size - 1 - radius))
      const inside = (dx * dx + dy * dy) <= (radius * radius)

      if (inside) {
        raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = 255
      } else {
        raw[i] = 0; raw[i + 1] = 0; raw[i + 2] = 0; raw[i + 3] = 0 // transparent
      }
    }
  }

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// Color primario de Graser: #1A56DB = rgb(26, 86, 219)
const R = 26, G = 86, B = 219

mkdirSync('public', { recursive: true })
writeFileSync('public/icon-192.png', generatePNG(192, R, G, B))
writeFileSync('public/icon-512.png', generatePNG(512, R, G, B))

console.log('✓ public/icon-192.png generado')
console.log('✓ public/icon-512.png generado')
console.log('')
console.log('Para cambiar el logo: reemplazá estos archivos con tus PNGs finales.')

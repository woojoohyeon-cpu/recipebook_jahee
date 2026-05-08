/**
 * PWA 아이콘 생성 스크립트
 * 실행: npm install sharp -D && node scripts/create-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgPath = resolve(root, 'public/icons/icon.svg')
const svg = readFileSync(svgPath)

mkdirSync(resolve(root, 'public/icons'), { recursive: true })

await sharp(svg).resize(192, 192).png().toFile(resolve(root, 'public/icons/icon-192.png'))
console.log('✓ icon-192.png')

await sharp(svg).resize(512, 512).png().toFile(resolve(root, 'public/icons/icon-512.png'))
console.log('✓ icon-512.png')

await sharp(svg).resize(180, 180).png().toFile(resolve(root, 'public/icons/apple-touch-icon.png'))
console.log('✓ apple-touch-icon.png')

console.log('\nPWA 아이콘 생성 완료!')

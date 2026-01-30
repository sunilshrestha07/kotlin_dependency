import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'app/db/db.json')

export interface DB {
  categories: any[]
  dependencies: any[]
  guides: any[]
}

export function readDb(): DB {
  try {
    const data = fs.readFileSync(dbPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading DB:', error)
    return { categories: [], dependencies: [], guides: [] }
  }
}

export function writeDb(data: DB) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error writing DB:', error)
  }
}

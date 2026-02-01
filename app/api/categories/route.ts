import { NextResponse } from 'next/server'
import { readDb, writeDb } from '../../db/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const db = readDb()

  if (id) {
    const category = db.categories.find(c => c.id === id)
    return NextResponse.json(category ? [category] : [])
  }

  return NextResponse.json(db.categories)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = readDb()

    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const newCategory = {
      ...body,
      id: body.id || body.name.toLowerCase().replace(/\s+/g, '-'),
      dependencies: []
    }

    db.categories.push(newCategory)
    writeDb(db)

    return NextResponse.json(newCategory)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

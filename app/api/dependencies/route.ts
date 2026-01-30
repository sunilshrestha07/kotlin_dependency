import { NextResponse } from 'next/server'
import { readDb, writeDb } from '../../db/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')
  const db = readDb()

  if (categoryId) {
    const filtered = db.dependencies.filter(d => d.categoryId === categoryId)
    return NextResponse.json(filtered)
  }

  return NextResponse.json(db.dependencies)
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const db = readDb()

    const index = db.dependencies.findIndex(d => d.id === body.id)
    if (index !== -1) {
      db.dependencies[index] = { ...db.dependencies[index], ...body }
      writeDb(db)
      return NextResponse.json(db.dependencies[index])
    }

    return NextResponse.json({ error: 'Dependency not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update dependency' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const db = readDb()

    // Simple ID generation if not provided
    if (!body.id) {
      body.id = body.name.toLowerCase().replace(/\s+/g, '-')
    }

    db.dependencies.push(body)
    writeDb(db)

    return NextResponse.json(body)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create dependency' }, { status: 500 })
  }
}

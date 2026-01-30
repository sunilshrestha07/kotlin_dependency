import { NextResponse } from 'next/server'
import { readDb, writeDb } from '../../db/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')
  const db = readDb()

  if (categoryId) {
    const filtered = db.guides.filter(g => g.categoryId === categoryId)
    return NextResponse.json(filtered)
  }

  return NextResponse.json(db.guides)
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const db = readDb()

    const index = db.guides.findIndex(g => g.id === body.id)
    if (index !== -1) {
      db.guides[index] = { ...db.guides[index], ...body }
      writeDb(db)
      return NextResponse.json(db.guides[index])
    }

    // If guide doesn't exist but has categoryId, maybe create it?
    // For now assuming update only for existing guides, or creating if not found and ID provided.
    if (body.id && body.categoryId) {
       db.guides.push(body)
       writeDb(db)
       return NextResponse.json(body)
    }

    return NextResponse.json({ error: 'Guide not found' }, { status: 404 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update guide' }, { status: 500 })
  }
}

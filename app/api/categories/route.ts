import { NextResponse } from 'next/server'
import { readDb } from '../../db/utils'

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

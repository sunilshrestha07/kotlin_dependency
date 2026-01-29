import { NextResponse } from 'next/server'
import db from '../../db/db.json'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')

  if (categoryId) {
    const filtered = db.guides.filter(g => g.categoryId === categoryId)
    return NextResponse.json(filtered)
  }

  return NextResponse.json(db.guides)
}

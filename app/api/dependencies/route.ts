import { NextResponse } from 'next/server'
import db from '../../db/db.json'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get('categoryId')

  if (categoryId) {
    const filtered = db.dependencies.filter(d => d.categoryId === categoryId)
    return NextResponse.json(filtered)
  }

  return NextResponse.json(db.dependencies)
}

export async function POST(request: Request) {
  const body = await request.json()
  // In a real app with a DB, we would save here.
  // For static hosting/Vercel with JSON file, we can't easily persist to disk in production.
  // We'll return the object to simulate success for the UI session.
  return NextResponse.json(body)
}

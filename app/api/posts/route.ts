import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

const DB_PATH = path.join(process.cwd(), 'app/db/db.json')

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    const fileContents = await fs.readFile(DB_PATH, 'utf8')
    const db = JSON.parse(fileContents)
    const posts = db.posts || []

    if (id) {
      const post = posts.find((p: any) => p.id === id)
      if (post) {
        return NextResponse.json([post])
      }
      return NextResponse.json([], { status: 404 })
    }

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Database Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const fileContents = await fs.readFile(DB_PATH, 'utf8')
    const db = JSON.parse(fileContents)

    const newPost = {
        ...body,
        id: body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        date: new Date().toISOString()
    }

    db.posts = db.posts || []
    db.posts.push(newPost)

    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2))

    return NextResponse.json(newPost)
  } catch (error) {
      console.error('Create Post Error:', error)
      return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const fileContents = await fs.readFile(DB_PATH, 'utf8')
    const db = JSON.parse(fileContents)

    const index = db.posts.findIndex((p: any) => p.id === body.id)
    if (index !== -1) {
       // Preserve original creation date if not provided (though usually we don't update it)
       // Update other fields
       db.posts[index] = { ...db.posts[index], ...body }

       await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2))
       return NextResponse.json(db.posts[index])
    }

    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  } catch (error) {
    console.error('Update Post Error:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

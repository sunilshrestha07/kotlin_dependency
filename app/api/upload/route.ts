import { NextResponse } from 'next/server'
import path from 'path'
import { writeFile } from 'fs/promises'
import fs from 'fs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file received.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = Date.now() + '-' + file.name.replaceAll(' ', '_')

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads')
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, filename)

    await writeFile(filePath, buffer)

    return NextResponse.json({
        url: `/uploads/${filename}`,
        success: true
    })
  } catch (error) {
    console.error('Upload Error:', error)
    return NextResponse.json(
      { error: 'Error uploading file.' },
      { status: 500 }
    )
  }
}

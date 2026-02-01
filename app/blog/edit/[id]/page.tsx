'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, FileText } from 'lucide-react'
import Link from 'next/link'

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploadMode, setUploadMode] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    author: '',
    excerpt: '',
    content: '',
    tagsString: '',
    pdfUrl: '',
    date: ''
  })

  useEffect(() => {
    if (id) {
        fetchPost()
    }
  }, [id])

  const fetchPost = async () => {
      try {
          const res = await fetch(`/api/posts?id=${id}`)
          const data = await res.json()
          if (data && data.length > 0) {
              const post = data[0]
              setFormData({
                  id: post.id,
                  title: post.title,
                  author: post.author,
                  excerpt: post.excerpt,
                  content: post.content || '',
                  tagsString: post.tags.join(', '),
                  pdfUrl: post.pdfUrl || '',
                  date: post.date
              })
              if (post.pdfUrl) {
                  setUploadMode(true)
              }
          }
      } catch (error) {
          console.error('Error fetching post:', error)
      } finally {
          setFetching(false)
      }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalPdfUrl = formData.pdfUrl

      // Handle File Upload if in PDF mode and file selected
      if (uploadMode && file) {
         const uploadData = new FormData()
         uploadData.append('file', file)

         const uploadRes = await fetch('/api/upload', {
             method: 'POST',
             body: uploadData
         })

         if (!uploadRes.ok) throw new Error('Upload failed')

         const uploadJson = await uploadRes.json()
         finalPdfUrl = uploadJson.url
      }

      // Update Post
      const postData = {
          id: formData.id,
          title: formData.title,
          author: formData.author,
          excerpt: formData.excerpt,
          content: uploadMode ? '' : formData.content,
          pdfUrl: uploadMode ? finalPdfUrl : undefined,
          tags: formData.tagsString.split(',').map(t => t.trim()).filter(Boolean),
          date: formData.date // Preserve original date
      }

      const res = await fetch('/api/posts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
      })

      if (res.ok) {
          router.push(`/blog/${id}`)
      } else {
          alert('Failed to update post')
      }

    } catch (error) {
        console.error('Error updating post:', error)
        alert('An error occurred')
    } finally {
        setLoading(false)
    }
  }

  if (fetching) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600"></div>
          </div>
      )
  }

  return (
    <main className="min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto mb-8">
            <Link href={`/blog/${id}`} className="flex items-center gap-2 text-slate-600 hover:text-pink-600 transition-colors group mb-8">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Back to Article</span>
            </Link>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto glass-card rounded-2xl p-8 shadow-2xl"
        >
            <h1 className="text-3xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">
                Edit Post
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all font-semibold"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Author</label>
                        <input
                            required
                            type="text"
                            value={formData.author}
                            onChange={(e) => setFormData({...formData, author: e.target.value})}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Excerpt</label>
                    <textarea
                        required
                        value={formData.excerpt}
                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all h-24 resize-none"
                    />
                </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tags (comma separated)</label>
                    <input
                        type="text"
                        value={formData.tagsString}
                        onChange={(e) => setFormData({...formData, tagsString: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                    />
                </div>

                <div className="border-t border-slate-200 pt-6">
                    <div className="flex gap-4 mb-6">
                         <button
                            type="button"
                            onClick={() => setUploadMode(false)}
                            className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!uploadMode ? 'bg-pink-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                         >
                            <FileText className="w-5 h-5" />
                            Write Content
                         </button>
                         <button
                            type="button"
                             onClick={() => setUploadMode(true)}
                             className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${uploadMode ? 'bg-pink-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                         >
                             <Upload className="w-5 h-5" />
                            Upload PDF
                         </button>
                    </div>

                    {uploadMode ? (
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center bg-slate-50 hover:bg-white hover:border-pink-400 transition-all cursor-pointer relative group">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-700">
                                        {file ? file.name : (formData.pdfUrl ? 'Replace current PDF' : 'Click to Upload PDF')}
                                    </p>
                                    {formData.pdfUrl && !file && (
                                        <p className="text-sm text-pink-600 mt-1">Current PDF loaded</p>
                                    )}
                                    <p className="text-slate-500 mt-2">Max file size 10MB</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                         <textarea
                            required={!uploadMode}
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all h-96 font-mono text-sm"
                            placeholder="# Write your article in Markdown..."
                        />
                    )}
                </div>

                <div className="flex gap-4">
                     <button
                        type="button"
                        onClick={() => router.push(`/blog/${id}`)}
                        className="flex-1 py-4 bg-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {loading ? 'Updating Post...' : 'Update Post'}
                    </button>
                </div>
            </form>
        </motion.div>
    </main>
  )
}

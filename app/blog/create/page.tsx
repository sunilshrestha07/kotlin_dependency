'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, FileText, X, Check } from 'lucide-react'
import Link from 'next/link'

export default function CreatePostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploadMode, setUploadMode] = useState(false) // false = write, true = upload
  const [file, setFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    excerpt: '',
    content: '', // used for markdown mode
    tagsString: '',
    pdfUrl: ''
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalPdfUrl = ''

      // Handle File Upload if in PDF mode
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

      // Create Post
      const postData = {
          title: formData.title,
          author: formData.author,
          excerpt: formData.excerpt,
          content: uploadMode ? '' : formData.content,
          pdfUrl: uploadMode ? finalPdfUrl : undefined,
          tags: formData.tagsString.split(',').map(t => t.trim()).filter(Boolean)
      }

      const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
      })

      if (res.ok) {
          router.push('/blog')
      } else {
          alert('Failed to create post')
      }

    } catch (error) {
        console.error('Error creating post:', error)
        alert('An error occurred')
    } finally {
        setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto mb-8">
            <Link href="/blog" className="flex items-center gap-2 text-slate-600 hover:text-pink-600 transition-colors group mb-8">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Back to Blog</span>
            </Link>
        </div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto glass-card rounded-2xl p-8 shadow-2xl"
        >
            <h1 className="text-3xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">
                Create New Post
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
                            placeholder="e.g., Advanced KMP Guide"
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
                            placeholder="e.g., John Doe"
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
                        placeholder="Short summary of the article..."
                    />
                </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tags (comma separated)</label>
                    <input
                        type="text"
                        value={formData.tagsString}
                        onChange={(e) => setFormData({...formData, tagsString: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                        placeholder="e.g., KMP, Tutorial, Android"
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
                                required={uploadMode}
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-700">
                                        {file ? file.name : 'Click to Upload PDF'}
                                    </p>
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

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                    {loading ? 'Creating Post...' : 'Publish Post'}
                </button>
            </form>
        </motion.div>
    </main>
  )
}

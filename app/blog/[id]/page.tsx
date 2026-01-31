'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, User, Clock, Share2, Copy, Check, Hash, FileText, Download } from 'lucide-react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  author: string
  tags: string[]
  pdfUrl?: string
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [])

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts?id=${postId}`)
      const data = await res.json()
      if (data.length > 0) {
        setPost(data[0])
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-slate-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Article Not Found</h2>
          <button
            onClick={() => router.push('/blog')}
            className="text-pink-600 hover:text-pink-700 font-semibold flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-6 md:p-12 bg-white">
      {/* Navigation */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => router.push('/blog')}
          className="flex items-center gap-2 text-slate-500 hover:text-pink-600 transition-colors group"
        >
          <div className="p-2 rounded-full bg-slate-100 group-hover:bg-pink-50 transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-semibold">Back to all articles</span>
        </button>
      </div>

      <article className="max-w-4xl mx-auto">
        {/* Header content */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-12"
        >
            <div className="flex gap-2 mb-6">
                {post.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 text-sm font-bold uppercase tracking-wider text-pink-600 bg-pink-100 rounded-full">
                        {tag}
                    </span>
                ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-500 border-b border-slate-100 pb-8">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg">
                        {post.author.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 leading-none">{post.author}</p>
                        <p className="text-xs">Author</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                 <div className="flex items-center gap-2 ml-auto">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                        title="Copy Link"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
                        <span className="text-sm font-semibold">{copied ? 'Copied!' : 'Share'}</span>
                    </button>
                </div>
            </div>
        </motion.div>

        {/* Content */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            {post.pdfUrl ? (
                <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">PDF Document</p>
                                <p className="text-xs text-slate-500">View below or download</p>
                            </div>
                         </div>
                         <a href={post.pdfUrl} download className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download
                         </a>
                    </div>

                    <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-900">
                        <iframe
                            src={post.pdfUrl}
                            className="w-full h-full"
                            title="PDF Viewer"
                        />
                    </div>
                </div>
            ) : (
                <MarkdownContent content={post.content} />
            )}
        </motion.div>

      </article>

       {/* Footer CTA */}
        <div className="max-w-4xl mx-auto mt-20 pt-10 border-t border-slate-200">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Want to learn more?</h3>
                    <p className="text-slate-300 mb-8 max-w-xl mx-auto">Explore our other categories to find the best libraries for your next Kotlin Multiplatform project.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-pink-50 transition-colors"
                    >
                        Browse Dependencies
                    </button>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>
        </div>
    </main>
  )
}

function MarkdownContent({ content }: { content: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/)

  return (
    <div className="prose prose-lg prose-slate max-w-none">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Extract code and language
          const match = part.match(/```(\w+)?\n([\s\S]*?)```/)
          if (match) {
            const [, language, code] = match

            return (
              <div key={index} className="relative group my-8 not-prose">
                {language && (
                  <div className="absolute top-0 left-4 -translate-y-1/2 px-3 py-1 bg-slate-800 text-xs font-bold text-pink-400 uppercase rounded-full border border-slate-700 z-10">
                    {language}
                  </div>
                )}
                <div className="relative rounded-xl overflow-hidden shadow-2xl bg-slate-900">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-white/5">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                        </div>
                        <button
                        onClick={() => copyCode(code.trim(), index)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy Code"
                        >
                        {copiedIndex === index ? (
                            <Check className="w-4 h-4 text-green-400" />
                        ) : (
                            <Copy className="w-4 h-4 text-slate-400" />
                        )}
                        </button>
                    </div>
                    <pre className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-slate-300">
                        <code>{code.trim()}</code>
                    </pre>
                </div>
              </div>
            )
          }
        }

        // Handle headers separately for better styling
        if (part.startsWith('###')) {
             return <h3 key={index} className="text-2xl font-bold text-slate-800 mt-12 mb-4">{part.replace('###', '').trim()}</h3>
        } else if (part.startsWith('##')) {
             return <h2 key={index} className="text-3xl font-black text-slate-900 mt-16 mb-6">{part.replace('##', '').trim()}</h2>
        }

        // Regular text content with some simple markdown parsing
        // This is a naive implementation; a real project should use `react-markdown`
        return (
          <div key={index} className="text-slate-700 leading-relaxed whitespace-pre-line mb-6">
            {part.split('\n').map((line, i) => {
                // Bold
                if (line.includes('**')) {
                   const segments = line.split('**');
                   return <p key={i} className="mb-2">{segments.map((s, si) => si % 2 === 1 ? <strong key={si}>{s}</strong> : s)}</p>
                }
                // Lists
                 if (line.trim().startsWith('* ')) {
                    return <li key={i} className="ml-4 list-disc marker:text-pink-500 mb-1 pl-1">{line.trim().substring(2)}</li>
                }
                return <span key={i}>{line}<br/></span>
            })}
          </div>
        )
      })}
    </div>
  )
}

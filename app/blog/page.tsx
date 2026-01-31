'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, BookOpen, Calendar, User, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  author: string
  tags: string[]
}

export default function BlogListingPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts')
      const data = await res.json()
      setPosts(data)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Extract all unique tags
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags))).sort()

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600"></div>
          <p className="mt-4 text-slate-600">Loading articles...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-6 md:p-12">
        <div className="max-w-7xl mx-auto mb-8">
            <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors group mb-8"
            >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Back to Dependencies</span>
            </button>
        </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">
            Developer Blog & Guides
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Deep dives, tutorials, and best practices for Kotlin Multiplatform development.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card rounded-2xl p-6 shadow-2xl relative z-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
              />
            </div>
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none cursor-pointer transition-all"
              >
                <option value="all">All Topics</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

             <Link href="/blog/create">
                <button className="h-full px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-pink-300 hover:text-pink-600 hover:shadow-lg transition-all duration-300 flex items-center gap-2 font-semibold whitespace-nowrap">
                    <BookOpen className="w-5 h-5" />
                    Write Article
                </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Blog Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {filteredPosts.map((post) => (
          <motion.div
            key={post.id}
            variants={item}
            whileHover={{ y: -5 }}
            className="group h-full"
          >
            <Link href={`/blog/${post.id}`} className="block h-full">
              <div className="glass-card rounded-2xl p-8 hover:shadow-2xl transition-all h-full flex flex-col border border-slate-100/50 hover:border-pink-200/50">
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-100 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>

                <h2 className="text-2xl font-bold mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-slate-600 mb-6 line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>

                <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                  </div>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 text-pink-500 transition-transform" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20">
            <div className="inline-block p-6 rounded-full bg-slate-100 mb-4">
                <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">No articles found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </main>
  )
}

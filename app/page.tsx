'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Package } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  platform: string[]
}

interface Dependency {
  id: string
  categoryId: string
  name: string
  version: string
  module: string
  platform: string
  required: boolean
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, dependenciesRes] = await Promise.all([
        fetch('http://localhost:3001/categories'),
        fetch('http://localhost:3001/dependencies')
      ])
      const categoriesData = await categoriesRes.json()
      const dependenciesData = await dependenciesRes.json()
      setCategories(categoriesData)
      setDependencies(dependenciesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDependencyCount = (categoryId: string) => {
    return dependencies.filter(dep => dep.categoryId === categoryId).length
  }

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = selectedPlatform === 'all' ||
                           category.platform.includes(selectedPlatform)
    return matchesSearch && matchesPlatform
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
          <p className="mt-4 text-slate-600">Loading dependencies...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-6 md:p-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Package className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 gradient-text">
            KMP Dependency Manager
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Your comprehensive guide to Kotlin Multiplatform dependencies with detailed setup guides
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-card rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search dependencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer transition-all"
                >
                  <option value="all">All Platforms</option>
                  <option value="common">Common</option>
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                  <option value="desktop">Desktop</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Add New
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredCategories.map((category, index) => (
          <motion.div
            key={category.id}
            variants={item}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Link href={`/category/${category.id}`}>
              <div className="glass-card rounded-2xl p-6 hover-lift cursor-pointer overflow-hidden relative">
                {/* Background gradient */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${category.color}40, ${category.color}20)` }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      {category.icon}
                    </div>
                    <div className="flex gap-1">
                      {category.platform.map(p => (
                        <span
                          key={p}
                          className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-600"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-2 group-hover:text-violet-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-500">
                      {getDependencyCount(category.id)} dependencies
                    </span>
                    <span
                      className="text-sm font-bold group-hover:translate-x-1 transition-transform"
                      style={{ color: category.color }}
                    >
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Dependency Modal */}
      {showAddModal && (
        <AddDependencyModal
          onClose={() => setShowAddModal(false)}
          onAdd={fetchData}
          categories={categories}
        />
      )}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto mt-20 text-center text-slate-500 pb-8"
      >
        <p className="text-sm">
          Built with Next.js, Tailwind CSS, and Framer Motion
        </p>
        <p className="text-xs mt-2">
          KMP Dependency Manager • Version 1.0.0
        </p>
      </motion.footer>
    </main>
  )
}

function AddDependencyModal({
  onClose,
  onAdd,
  categories
}: {
  onClose: () => void
  onAdd: () => void
  categories: Category[]
}) {
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    module: '',
    categoryId: categories[0]?.id || '',
    platform: 'common',
    required: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newDependency = {
      ...formData,
      id: `${formData.name}-${Date.now()}`
    }

    try {
      await fetch('http://localhost:3001/dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDependency)
      })
      onAdd()
      onClose()
    } catch (error) {
      console.error('Error adding dependency:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-6 gradient-text">Add New Dependency</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Dependency Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g., ktor-client-core"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Version
            </label>
            <input
              type="text"
              required
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g., 3.3.1"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Module
            </label>
            <input
              type="text"
              required
              value={formData.module}
              onChange={(e) => setFormData({ ...formData, module: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g., io.ktor:ktor-client-core"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Platform
            </label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="common">Common</option>
              <option value="android">Android</option>
              <option value="ios">iOS</option>
              <option value="desktop">Desktop</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={formData.required}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              className="w-4 h-4 text-violet-600 rounded focus:ring-2 focus:ring-violet-500"
            />
            <label htmlFor="required" className="text-sm font-semibold text-slate-700">
              Required dependency
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              Add Dependency
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

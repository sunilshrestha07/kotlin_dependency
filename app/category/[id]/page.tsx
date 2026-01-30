'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Code,
  Terminal,
  Settings,
  Edit2,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react'
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

interface GuideStep {
  title: string
  content: string
}

interface Guide {
  id: string
  categoryId: string
  title: string
  steps: GuideStep[]
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = params.id as string

  const [category, setCategory] = useState<Category | null>(null)
  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedSteps, setExpandedSteps] = useState<number[]>([0])

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [categoryId])

  const fetchData = async () => {
    try {
      const [categoryRes, dependenciesRes, guidesRes] = await Promise.all([
        fetch(`/api/categories?id=${categoryId}`),
        fetch(`/api/dependencies?categoryId=${categoryId}`),
        fetch(`/api/guides?categoryId=${categoryId}`)
      ])

      const categoryData = await categoryRes.json()
      const dependenciesData = await dependenciesRes.json()
      const guidesData = await guidesRes.json()

      setCategory(categoryData[0])
      setDependencies(dependenciesData)
      setGuide(guidesData[0] || { id: `guide-${categoryId}`, categoryId, title: 'Setup Guide', steps: [] })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save Dependencies
      const depPromises = dependencies.map(dep =>
        fetch('/api/dependencies', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dep)
        })
      )

      // Save Guide
      const guidePromise = guide ? fetch('/api/guides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guide)
      }) : Promise.resolve()

      await Promise.all([...depPromises, guidePromise])

      setIsEditing(false)
      // fetch new data to confirm sync
      await fetchData()
    } catch (error) {
      console.error('Error saving data:', error)
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDependencyChange = (index: number, field: keyof Dependency, value: any) => {
    const newDeps = [...dependencies]
    newDeps[index] = { ...newDeps[index], [field]: value }
    setDependencies(newDeps)
  }

  const handleGuideStepChange = (index: number, field: keyof GuideStep, value: string) => {
    if (!guide) return
    const newSteps = [...guide.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setGuide({ ...guide, steps: newSteps })
  }

  const addGuideStep = () => {
    if (!guide) return
    setGuide({
      ...guide,
      steps: [...guide.steps, { title: 'New Step', content: '' }]
    })
    setExpandedSteps([...expandedSteps, guide.steps.length])
  }

  const removeGuideStep = (index: number) => {
    if (!guide) return
    const newSteps = guide.steps.filter((_, i) => i !== index)
    setGuide({ ...guide, steps: newSteps })
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleStep = (index: number) => {
    setExpandedSteps(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-600">Category not found</p>
          <Link href="/" className="text-violet-600 hover:underline mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-6 md:p-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to all dependencies</span>
          </button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                 <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-semibold"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-semibold shadow-lg shadow-violet-200"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-semibold shadow-lg shadow-slate-200"
              >
                <Edit2 className="w-4 h-4" />
                Edit Page
              </button>
            )}
          </div>
        </div>

        <motion.div
          layout
          className="glass-card rounded-2xl p-8 shadow-2xl mb-8"
        >
          <div className="flex items-start gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg flex-shrink-0"
              style={{ backgroundColor: `${category.color}20` }}
            >
              {category.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-4xl md:text-5xl font-black" style={{ color: category.color }}>
                  {category.name}
                </h1>
                <div className="flex gap-2">
                  {category.platform.map(p => (
                    <span
                      key={p}
                      className="px-3 py-1 text-sm font-semibold rounded-lg bg-slate-100 text-slate-700"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xl text-slate-600 mb-4">
                {category.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {dependencies.length} dependencies
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {guide?.steps.length || 0} setup steps
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dependencies List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="glass-card rounded-2xl p-6 shadow-xl sticky top-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Code className="w-6 h-6" style={{ color: category.color }} />
              Dependencies
            </h2>

            <div className="space-y-3">
              {dependencies.map((dep, index) => (
                <motion.div
                  key={dep.id}
                  layout
                  className="group"
                >
                  <div className="bg-white rounded-xl p-4 hover:shadow-md transition-all border border-slate-100">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase">Name</label>
                          <input
                            value={dep.name}
                            onChange={(e) => handleDependencyChange(index, 'name', e.target.value)}
                            className="w-full text-sm font-bold text-slate-800 border-b border-slate-200 focus:border-violet-600 focus:outline-none py-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Version</label>
                            <input
                              value={dep.version}
                              onChange={(e) => handleDependencyChange(index, 'version', e.target.value)}
                              className="w-full text-xs font-mono text-slate-600 border-b border-slate-200 focus:border-violet-600 focus:outline-none py-1"
                            />
                           </div>
                           <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Platform</label>
                            <input
                              value={dep.platform}
                              onChange={(e) => handleDependencyChange(index, 'platform', e.target.value)}
                              className="w-full text-xs font-semibold text-slate-600 border-b border-slate-200 focus:border-violet-600 focus:outline-none py-1"
                            />
                           </div>
                        </div>
                         <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase">Module</label>
                            <input
                              value={dep.module}
                              onChange={(e) => handleDependencyChange(index, 'module', e.target.value)}
                              className="w-full text-xs font-mono text-slate-600 border-b border-slate-200 focus:border-violet-600 focus:outline-none py-1"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={dep.required}
                              onChange={(e) => handleDependencyChange(index, 'required', e.target.checked)}
                              className="rounded text-violet-600 focus:ring-violet-600"
                            />
                            <label className="text-xs text-slate-600">Required</label>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-800">{dep.name}</h3>
                              {dep.required && (
                                <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-100 text-red-600">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-500 font-mono">{dep.version}</p>
                          </div>
                          <span className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-600">
                            {dep.platform}
                          </span>
                        </div>

                        <div className="mt-3 relative">
                          <div className="bg-slate-50 rounded-lg p-2 pr-10 text-xs font-mono text-slate-700 overflow-x-auto">
                            {dep.module}
                          </div>
                          <button
                            onClick={() => copyToClipboard(dep.module, dep.id)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-md hover:bg-slate-100 transition-colors shadow-sm"
                          >
                            {copiedId === dep.id ? (
                              <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Setup Guide */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="glass-card rounded-2xl p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-7 h-7" style={{ color: category.color }} />
              <h2 className="text-3xl font-bold">
                {guide?.title || 'Setup Guide'}
              </h2>
            </div>

            {guide && guide.steps.length > 0 ? (
              <div className="space-y-4">
                {guide.steps.map((step, index) => {
                  const isExpanded = expandedSteps.includes(index)

                  return (
                    <motion.div
                      key={index}
                      layout
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white"
                    >
                      <button
                        onClick={() => toggleStep(index)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: category.color }}
                          >
                            {index + 1}
                          </div>
                          {isEditing ? (
                              <input
                                value={step.title}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleGuideStepChange(index, 'title', e.target.value)}
                                className="text-lg font-bold text-left bg-transparent border-b border-transparent hover:border-slate-300 focus:border-violet-600 focus:outline-none flex-1 mr-4"
                                placeholder="Step Title"
                              />
                          ) : (
                              <h3 className="text-lg font-bold text-left">{step.title}</h3>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditing && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeGuideStep(index)
                                    }}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors mr-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </div>
                            )}
                            {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                        </div>
                      </button>

                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-6"
                        >
                          <div className="pl-12">
                            {isEditing ? (
                                <textarea
                                    value={step.content}
                                    onChange={(e) => handleGuideStepChange(index, 'content', e.target.value)}
                                    className="w-full min-h-[200px] p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-violet-600 focus:ring-1 focus:ring-violet-600 focus:outline-none"
                                    placeholder="Step content in Markdown..."
                                />
                            ) : (
                                <StepContent content={step.content} categoryColor={category.color} />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            ) : (
               !isEditing && (
                <div className="text-center py-12 text-slate-500">
                    <Terminal className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No setup guide available for this dependency.</p>
                    <p className="text-sm mt-2">Check the official documentation for more information.</p>
                </div>
               )
            )}

            {isEditing && (
                <button
                    onClick={addGuideStep}
                    className="w-full mt-4 py-3 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:text-violet-600 hover:border-violet-600 hover:bg-violet-50 transition-all font-semibold group"
                >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Add Extra File / Step
                </button>
            )}

            {/* Resources */}
            {!isEditing && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold mb-4">Additional Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <a
                    href={`https://github.com/search?q=${encodeURIComponent(category.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                    <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-violet-600" />
                    <span className="font-semibold text-slate-700">View on GitHub</span>
                    </a>
                    <a
                    href={`https://search.maven.org/search?q=${encodeURIComponent(dependencies[0]?.module || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                    <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-violet-600" />
                    <span className="font-semibold text-slate-700">Maven Central</span>
                    </a>
                </div>
                </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  )
}

function StepContent({ content, categoryColor }: { content: string; categoryColor: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/)

  return (
    <div className="prose prose-slate max-w-none">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          // Extract code and language
          const match = part.match(/```(\w+)?\n([\s\S]*?)```/)
          if (match) {
            const [, language, code] = match

            return (
              <div key={index} className="relative group my-4">
                {language && (
                  <div className="absolute top-3 left-4 text-xs font-bold text-green-400 uppercase">
                    {language}
                  </div>
                )}
                <button
                  onClick={() => copyCode(code.trim(), index)}
                  className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-300" />
                  )}
                </button>
                <pre className="bg-slate-900 text-slate-100 p-6 rounded-xl overflow-x-auto font-mono text-sm pt-10">
                  <code>{code.trim()}</code>
                </pre>
              </div>
            )
          }
        }

        // Regular text content
        return (
          <div key={index} className="text-slate-700 leading-relaxed whitespace-pre-line my-3">
            {part}
          </div>
        )
      })}
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap, 
  FileText, 
  BarChart3, 
  Target, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Lightbulb
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromptStudioProps {
  isAuthenticated: boolean
  userTier: string
  onUpgrade?: () => void
}

export function PromptStudio({ isAuthenticated, userTier, onUpgrade }: PromptStudioProps) {
  const [prompt, setPrompt] = useState('')
  const [analysis, setAnalysis] = useState<{
    score: number;
    clarity: number;
    specificity: number;
    structure: number;
    suggestions: string[];
    improvements: string[];
  } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!prompt.trim()) return

    setIsAnalyzing(true)
    
    // Simulate analysis process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setAnalysis({
      score: Math.floor(Math.random() * 30) + 70,
      clarity: Math.floor(Math.random() * 20) + 80,
      specificity: Math.floor(Math.random() * 25) + 75,
      structure: Math.floor(Math.random() * 15) + 85,
      suggestions: [
        "Consider adding more specific context about your target audience",
        "Include examples or constraints to improve output quality",
        "Structure your request with clearer action words",
        "Add desired tone or style specifications"
      ],
      improvements: [
        "Add role definition: 'You are a [specific role]'",
        "Include output format: 'Format as [bullets/paragraphs/etc]'",
        "Specify constraints: 'Keep it under [X] words'"
      ]
    })
    
    setIsAnalyzing(false)
  }

  // Show upgrade screen for free users trying to access premium features
  if (!isAuthenticated || userTier === 'curious') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark rounded-3xl p-12 max-w-2xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap size={80} className="mx-auto mb-6 text-amber-500" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-4xl font-bold text-enhanced-contrast mb-4">Prompt Studio</h2>
            <p className="text-xl text-enhanced mb-8">
              Analyze and optimize your prompts for better AI responses
            </p>
            <div className="space-y-4 text-left mb-8">
              <div className="flex items-center space-x-3 text-enhanced">
                <CheckCircle size={20} className="text-green-500" />
                <span>Detailed prompt analysis</span>
              </div>
              <div className="flex items-center space-x-3 text-enhanced">
                <CheckCircle size={20} className="text-green-500" />
                <span>Improvement suggestions</span>
              </div>
              <div className="flex items-center space-x-3 text-enhanced">
                <CheckCircle size={20} className="text-green-500" />
                <span>Performance scoring</span>
              </div>
            </div>
            
            <motion.button
              onClick={onUpgrade}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Unlock Prompt Studio - Start Free
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-enhanced-contrast mb-4 tracking-tight">
            Prompt Studio
          </h1>
          <p className="text-lg text-enhanced">
            Analyze and perfect your prompts for better AI responses
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Prompt Input Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-enhanced-contrast flex items-center gap-2">
                  <FileText size={24} />
                  Your Prompt
                </h3>
                <span className="text-sm text-enhanced">
                  {prompt.length}/500 characters
                </span>
              </div>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here for analysis...

Example: 'You are a professional content writer. Write a compelling blog post about sustainable technology that is 500 words long, includes 3 key benefits, and targets startup founders.'"
                className="w-full h-64 bg-white/10 border border-white/20 rounded-lg p-4 text-enhanced-contrast placeholder-amber-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/15 resize-none"
                maxLength={500}
              />
              
              <motion.button
                onClick={handleAnalyze}
                disabled={!prompt.trim() || isAnalyzing}
                className={cn(
                  "w-full mt-4 px-6 py-3 rounded-lg font-semibold transition-all",
                  prompt.trim() && !isAnalyzing
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-lg"
                    : "bg-white/10 text-enhanced cursor-not-allowed"
                )}
                whileHover={prompt.trim() && !isAnalyzing ? { scale: 1.02 } : undefined}
                whileTap={prompt.trim() && !isAnalyzing ? { scale: 0.98 } : undefined}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Prompt"}
              </motion.button>
            </motion.div>

            {/* Quick Tips */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-enhanced-contrast mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-500" />
                Quick Tips
              </h3>
              <ul className="space-y-2 text-sm text-enhanced">
                <li>• Be specific about the role (e.g., &ldquo;You are a marketing expert&rdquo;)</li>
                <li>• Include context and constraints</li>
                <li>• Specify desired format and length</li>
                <li>• Use examples when possible</li>
                <li>• Define your target audience</li>
              </ul>
            </motion.div>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold text-enhanced-contrast mb-6 flex items-center gap-2">
                <Target size={24} />
                Analysis Results
              </h3>

              {analysis ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Score Overview */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Overall Score", value: analysis.score, color: "text-green-400" },
                      { label: "Clarity", value: analysis.clarity, color: "text-blue-400" },
                      { label: "Specificity", value: analysis.specificity, color: "text-yellow-400" },
                      { label: "Structure", value: analysis.structure, color: "text-purple-400" }
                    ].map((metric, index) => (
                      <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-black/20 rounded-lg p-4 text-center"
                      >
                        <p className="text-enhanced-contrast text-sm">{metric.label}</p>
                        <p className={cn("text-2xl font-bold", metric.color)}>{metric.value}%</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 className="font-semibold text-enhanced-contrast mb-3">Improvement Suggestions</h4>
                    <div className="space-y-2">
                      {analysis.suggestions.map((suggestion: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 bg-black/10 rounded-lg p-3"
                        >
                          <AlertCircle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                          <p className="text-enhanced text-sm">{suggestion}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Improvements */}
                  <div>
                    <h4 className="font-semibold text-enhanced-contrast mb-3">Quick Improvements</h4>
                    <div className="space-y-2">
                      {analysis.improvements.map((improvement: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 bg-black/10 rounded-lg p-3"
                        >
                          <TrendingUp size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                          <p className="text-enhanced text-sm">{improvement}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 size={48} className="text-white/20 mx-auto mb-4" />
                  <p className="text-enhanced">
                    Enter a prompt and click &ldquo;Analyze Prompt&rdquo; to get detailed insights
                  </p>
                </div>
              )}
            </motion.div>

            {/* Upgrade Prompt for Advanced Features */}
            {userTier === 'free' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 border border-amber-500/30"
              >
                <h3 className="text-lg font-semibold text-enhanced-contrast mb-3">
                  🚀 Unlock Advanced Features
                </h3>
                <p className="text-enhanced text-sm mb-3">
                  Upgrade to Developer or Founder tier for:
                </p>
                <ul className="text-sm text-enhanced space-y-1 mb-4">
                  <li>• Batch prompt analysis</li>
                  <li>• Custom scoring templates</li>
                  <li>• Export analysis reports</li>
                  <li>• AI-powered rewrites</li>
                </ul>
                <button
                  onClick={onUpgrade}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2 rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 transition-all"
                >
                  Upgrade Now
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
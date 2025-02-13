"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"

interface Resource {
  title: string
  description: string
  url: string
  tags: string[]
}

interface ResourcesProps {
  selectedFile?: string
  rubric?: string
  messages?: Array<{ type: 'user' | 'ai'; content: string }>
}

const ALL_RESOURCES: Resource[] = [
  {
    title: "Python Documentation",
    description: "Official Python documentation and tutorials.",
    url: "https://docs.python.org/3/",
    tags: ["python", "documentation", "basics", "tutorial"]
  },
  {
    title: "Python Style Guide (PEP 8)",
    description: "Style guide for Python code - how to format your code for maximum readability.",
    url: "https://peps.python.org/pep-0008/",
    tags: ["python", "style", "formatting", "best-practices"]
  },
  {
    title: "Real Python Tutorials",
    description: "In-depth Python tutorials for beginners and advanced developers.",
    url: "https://realpython.com/",
    tags: ["python", "tutorial", "learning", "examples"]
  },
  {
    title: "MDN JavaScript Guide",
    description: "Comprehensive guide to JavaScript for all skill levels.",
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
    tags: ["javascript", "js", "web", "frontend"]
  },
  {
    title: "React Documentation",
    description: "Official React documentation with tutorials and API reference.",
    url: "https://react.dev/",
    tags: ["react", "javascript", "frontend", "web"]
  },
  {
    title: "TypeScript Handbook",
    description: "Official TypeScript documentation and guides.",
    url: "https://www.typescriptlang.org/docs/",
    tags: ["typescript", "ts", "javascript", "types"]
  },
  {
    title: "Next.js Documentation",
    description: "Learn about Next.js features and API.",
    url: "https://nextjs.org/docs",
    tags: ["nextjs", "react", "frontend", "web"]
  },
  {
    title: "CSS Tricks",
    description: "Tips, tricks, and techniques on using CSS.",
    url: "https://css-tricks.com/",
    tags: ["css", "frontend", "web", "styling"]
  },
  {
    title: "HTML MDN Web Docs",
    description: "HTML documentation with examples and tutorials.",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    tags: ["html", "web", "frontend", "basics"]
  }
]

export function Resources({ selectedFile, rubric, messages }: ResourcesProps) {
  const [relevantResources, setRelevantResources] = useState<Resource[]>([])

  useEffect(() => {
    // Helper function to get keywords from text
    const getKeywords = (text: string): string[] => {
      const keywords = text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2)
      return [...new Set(keywords)] // Remove duplicates
    }

    // Collect keywords from context
    const contextKeywords = new Set<string>()
    
    // Add keywords from selected file
    if (selectedFile) {
      const fileExt = selectedFile.split('.').pop()?.toLowerCase()
      if (fileExt) {
        switch (fileExt) {
          case 'py':
            contextKeywords.add('python')
            break
          case 'js':
            contextKeywords.add('javascript')
            break
          case 'ts':
          case 'tsx':
            contextKeywords.add('typescript')
            contextKeywords.add('react')
            break
          case 'css':
            contextKeywords.add('css')
            break
          case 'html':
            contextKeywords.add('html')
            break
        }
      }
    }

    // Add keywords from rubric
    if (rubric) {
      getKeywords(rubric).forEach(keyword => contextKeywords.add(keyword))
    }

    // Add keywords from recent messages
    if (messages) {
      const recentMessages = messages.slice(-3) // Consider last 3 messages
      recentMessages.forEach(msg => {
        getKeywords(msg.content).forEach(keyword => contextKeywords.add(keyword))
      })
    }

    // Filter resources based on matching tags
    const filtered = ALL_RESOURCES.filter(resource => 
      resource.tags.some(tag => 
        Array.from(contextKeywords).some(keyword => 
          tag.includes(keyword) || keyword.includes(tag)
        )
      )
    )

    // If no specific resources match, show general programming resources
    setRelevantResources(filtered.length > 0 ? filtered : ALL_RESOURCES.slice(0, 3))
  }, [selectedFile, rubric, messages])

  return (
    <div className="p-4 bg-black border-t border-zinc-800/50">
      <h2 className="text-sm font-semibold mb-3 px-2">Relevant Resources</h2>
      <div className="space-y-3">
        {relevantResources.map((resource, index) => (
          <div key={index} className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800/50">
            <div className="flex items-start justify-between">
              <h3 className="text-xs font-medium mb-1.5">{resource.title}</h3>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-xs text-zinc-400 mb-2">
              {resource.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {resource.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


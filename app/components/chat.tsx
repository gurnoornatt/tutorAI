"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileUpload } from "./file-upload"
import { getFeedback } from "../lib/api"
import { ChevronDown, ChevronUp, FileText, Loader2 } from "lucide-react"
import { RubricInput } from "./rubric-input"

interface ChatProps {
  onFileSelect: (filename: string, content: string) => void
  selectedFile?: string
  selectedContent?: string
  onFolderUpload: (files: { path: string; content: string }[]) => void
  messages: Message[]
  onMessagesUpdate: (messages: Message[]) => void
  rubric: string
  onRubricChange: (rubric: string) => void
}

interface Message {
  type: 'user' | 'ai'
  content: string
}

export function Chat({ 
  onFileSelect, 
  selectedFile, 
  selectedContent, 
  onFolderUpload,
  messages = [],
  onMessagesUpdate,
  rubric,
  onRubricChange
}: ChatProps) {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showRubric, setShowRubric] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMessage = message.trim()
    setMessage("")
    
    const currentMessages = Array.isArray(messages) && messages.length === 1 && messages[0].type === 'ai' 
      ? []
      : messages || []

    const updatedMessages = [...currentMessages, { type: 'user' as const, content: userMessage }]
    onMessagesUpdate(updatedMessages)
    
    setLoading(true)
    try {
      const response = await getFeedback(
        selectedContent || userMessage,
        rubric || (selectedFile ? `Please analyze this ${selectedFile} file` : "Please help with this coding question"),
        userMessage
      )
      onMessagesUpdate([...updatedMessages, { type: 'ai' as const, content: response.feedback }])
    } catch (err) {
      onMessagesUpdate([...updatedMessages, { type: 'ai' as const, content: "Sorry, I encountered an error. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col bg-zinc-950 h-full overflow-hidden border-l border-zinc-800/50">
      {/* Header with minimize and rubric buttons */}
      <div className="flex-none flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-black/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">AI Chat</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-xs"
            onClick={() => setShowRubric(!showRubric)}
          >
            <FileText className="h-3 w-3 mr-1" />
            Rubric
          </Button>
        </div>
      </div>

      {/* Chat content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Rubric input */}
        {showRubric && (
          <RubricInput
            value={rubric}
            onChange={onRubricChange}
            onClose={() => setShowRubric(false)}
          />
        )}

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col justify-end min-h-full">
            <div className="p-4 space-y-3">
              {loading && (
                <div className="bg-zinc-900 rounded-lg p-3 mr-8">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                    <p className="text-xs text-zinc-400">Thinking...</p>
                  </div>
                </div>
              )}
              {Array.isArray(messages) && messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 ${
                    msg.type === 'user' ? 'bg-blue-500/10 ml-8' : 'bg-zinc-900 mr-8'
                  }`}
                >
                  <pre className="whitespace-pre-wrap text-xs">{msg.content}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input area */}
        <div className="flex-none border-t border-zinc-800 p-3 bg-black">
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={selectedFile ? `Ask about ${selectedFile}...` : "Ask me about your code..."}
              className="flex-1 bg-zinc-900 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
            <Button type="submit" variant="secondary" size="sm" disabled={loading} className="h-6 text-xs">
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              Send
            </Button>
            <FileUpload onFileUpload={onFileSelect} onFolderUpload={onFolderUpload} />
          </form>
        </div>
      </div>
    </div>
  )
}


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getFeedback } from "../lib/api"

interface AIFeedbackProps {
  code: string
  filename: string
}

export function AIFeedback({ code, filename }: AIFeedbackProps) {
  const [feedback, setFeedback] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetFeedback = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getFeedback(
        code,
        "Please review this code for best practices and potential improvements.",
        `How can I improve this ${filename} file?`
      )
      setFeedback(response.feedback)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get feedback")
      console.error("Error getting feedback:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 border-t border-zinc-800">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">AI Feedback</h3>
        <Button 
          onClick={handleGetFeedback}
          disabled={loading}
          variant="secondary"
          size="sm"
        >
          {loading ? "Getting feedback..." : "Get AI Feedback"}
        </Button>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
      
      {feedback && (
        <div className="bg-zinc-900 p-4 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm">{feedback}</pre>
        </div>
      )}
    </div>
  )
} 
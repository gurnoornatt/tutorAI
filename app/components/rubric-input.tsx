"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface RubricInputProps {
  value: string
  onChange: (value: string) => void
  onClose: () => void
}

export function RubricInput({ value, onChange, onClose }: RubricInputProps) {
  return (
    <div className="border-b border-zinc-800 p-4 bg-zinc-900/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Grading Rubric</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste or write your grading rubric here..."
        className="w-full h-32 bg-zinc-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
      />
      <p className="text-xs text-zinc-400 mt-2">
        The AI will use this rubric to evaluate code and provide feedback. Leave empty to use default evaluation.
      </p>
    </div>
  )
} 
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AIFeedback } from "./ai-feedback"

interface FileViewerProps {
  filename: string
  content: string
  onContentChange: (content: string) => void
}

export function FileViewer({ filename, content, onContentChange }: FileViewerProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="flex flex-col h-full bg-black border-r border-zinc-800/50">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2 bg-black/50">
        <span className="text-xs font-medium">{filename}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(!isEditing)}
          className="h-6 px-2 text-xs"
        >
          {isEditing ? "Save" : "Edit"}
        </Button>
      </div>
      <ScrollArea className="flex-1 border-r border-zinc-800/50">
        <div className="p-4">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full h-full min-h-[200px] bg-transparent font-mono text-xs resize-none focus:outline-none"
            />
          ) : (
            <pre className="font-mono text-xs whitespace-pre-wrap">{content}</pre>
          )}
        </div>
      </ScrollArea>
      <AIFeedback code={content} filename={filename} />
    </div>
  )
}


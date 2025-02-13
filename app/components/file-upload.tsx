"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip, Folder } from "lucide-react"
import { uploadFiles } from "../lib/api"

interface FileUploadProps {
  onFileUpload: (filename: string, content: string) => void
  onFolderUpload: (files: { path: string; content: string }[]) => void
}

// Add custom type for input element with directory attributes
interface HTMLInputElementWithDirectory extends HTMLInputElement {
  webkitdirectory: boolean;
  directory: boolean;
}

export function FileUpload({ onFileUpload, onFolderUpload }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      const response = await uploadFiles(Array.from(files))
      
      // Handle the first successful file upload
      const successfulFile = response.files.find(file => file.status === "success")
      if (successfulFile) {
        onFileUpload(successfulFile.filename, successfulFile.content)
      } else {
        setError("No valid files were uploaded")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
      // Reset the input
      event.target.value = ""
    }
  }

  const handleFolderChange = async (event: React.ChangeEvent<HTMLInputElementWithDirectory>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      const fileList: { path: string; content: string }[] = []
      
      // Process each file in the folder
      for (const file of Array.from(files)) {
        // Get the relative path from the webkitRelativePath
        const path = file.webkitRelativePath || file.name
        
        // Read file content
        const content = await file.text()
        fileList.push({ path, content })
      }

      onFolderUpload(fileList)
    } catch (err) {
      console.error("Folder upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to upload folder")
    } finally {
      setIsUploading(false)
      // Reset the input
      event.target.value = ""
    }
  }

  return (
    <div className="relative flex gap-2">
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        accept=".txt,.py,.js,.jsx,.ts,.tsx,.html,.css,.json,.yml,.yaml,.md"
        multiple
      />
      <label htmlFor="file-upload">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isUploading}
          asChild
        >
          <span>
            <Paperclip className="h-4 w-4" />
          </span>
        </Button>
      </label>

      <input
        type="file"
        onChange={handleFolderChange as any}
        className="hidden"
        id="folder-upload"
        {...{ webkitdirectory: "", directory: "" } as any}
      />
      <label htmlFor="folder-upload">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={isUploading}
          asChild
        >
          <span>
            <Folder className="h-4 w-4" />
          </span>
        </Button>
      </label>

      {error && (
        <div className="absolute bottom-full mb-2 left-0 bg-red-500/10 text-red-500 text-xs p-2 rounded">
          {error}
        </div>
      )}
    </div>
  )
} 
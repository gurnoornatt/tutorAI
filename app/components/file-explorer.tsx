"use client"

import { forwardRef, useImperativeHandle, useState } from "react"
import { ChevronRight, ChevronDown, FileCode, Folder, FileJson, FileType, FileText } from "lucide-react"

interface FileExplorerProps {
  onFileSelect: (path: string, content: string) => void
}

interface FileNode {
  name: string
  type: "file" | "directory"
  children?: FileNode[]
  content?: string
  path: string
}

export interface FileExplorerRef {
  addFilesToStructure: (files: { path: string; content: string }[]) => void
}

export const FileExplorer = forwardRef<FileExplorerRef, FileExplorerProps>(({ onFileSelect }, ref) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]));
  const [fileStructure, setFileStructure] = useState<FileNode>({
    name: "project",
    type: "directory",
    path: "/",
    children: [
      {
        name: "app",
        type: "directory",
        path: "/app",
        children: [
          {
            name: "page.tsx",
            type: "file",
            path: "/app/page.tsx",
            content: "export default function Page() {\n  return <div>Hello World</div>\n}",
          },
        ],
      },
    ],
  });

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const getFileIcon = (name: string) => {
    if (name.endsWith(".ts") || name.endsWith(".tsx")) return <FileCode className="h-4 w-4 text-[#1c98e7]" />
    if (name.endsWith(".json")) return <FileJson className="h-4 w-4 text-[#fbc748]" />
    if (name.endsWith(".md")) return <FileText className="h-4 w-4 text-[#5c5c5c]" />
    if (name.endsWith(".css")) return <FileType className="h-4 w-4 text-[#0098e7]" />
    if (name.endsWith(".py")) return <FileCode className="h-4 w-4 text-[#ffde57]" />
    return <FileType className="h-4 w-4 text-[#5c5c5c]" />
  }

  const addFilesToStructure = (files: { path: string; content: string }[]) => {
    // Create a new structure with just the root
    const newStructure: FileNode = {
      name: "project",
      type: "directory",
      path: "/",
      children: []
    }
    
    files.forEach(({ path, content }) => {
      const parts = path.split('/')
      let current = newStructure
      
      // Process each part of the path
      parts.forEach((part, index) => {
        if (!part) return // Skip empty parts
        
        // If we're at the last part, it's a file
        if (index === parts.length - 1) {
          if (!current.children) current.children = []
          current.children.push({
            name: part,
            type: "file",
            path: path,
            content: content
          })
        } else {
          // It's a directory
          if (!current.children) current.children = []
          let dir = current.children.find(
            child => child.type === "directory" && child.name === part
          )
          if (!dir) {
            dir = {
              name: part,
              type: "directory",
              path: parts.slice(0, index + 1).join('/'),
              children: []
            }
            current.children.push(dir)
          }
          current = dir
        }
      })
    })
    
    setFileStructure(newStructure)
    
    // Reset and expand all parent folders of new files
    const newExpanded = new Set(["/"])
    files.forEach(({ path }) => {
      const parts = path.split('/')
      let currentPath = ''
      parts.forEach(part => {
        currentPath += part + '/'
        newExpanded.add(currentPath)
      })
    })
    setExpandedFolders(newExpanded)
  }

  // Expose the addFilesToStructure method via ref
  useImperativeHandle(ref, () => ({
    addFilesToStructure
  }));

  const renderFileTree = (node: FileNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.path)
    const paddingLeft = `${level * 1.5}rem`

    if (node.type === "directory") {
      return (
        <div key={node.path}>
          <button
            className="flex w-full items-center gap-2 px-2 py-0.5 hover:bg-zinc-800/50 font-[system-ui]"
            style={{ paddingLeft }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Folder className="h-4 w-4 text-yellow-400" />
            <span className="text-sm">{node.name}</span>
          </button>
          {isExpanded && node.children?.map((child) => renderFileTree(child, level + 1))}
        </div>
      )
    }

    return (
      <button
        key={node.path}
        className="flex w-full items-center gap-2 px-2 py-0.5 hover:bg-zinc-800/50 font-[system-ui]"
        style={{ paddingLeft }}
        onClick={() => node.content && onFileSelect(node.path, node.content)}
      >
        {getFileIcon(node.name)}
        <span className="text-sm">{node.name}</span>
      </button>
    )
  }

  return (
    <div className="h-full overflow-auto bg-black p-2">
      {renderFileTree(fileStructure)}
    </div>
  )
})

FileExplorer.displayName = "FileExplorer"


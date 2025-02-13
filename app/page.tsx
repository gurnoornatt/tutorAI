"use client"

import { useState, useRef } from "react"
import { FileExplorer } from "./components/file-explorer"
import { FileViewer } from "./components/file-viewer"
import { Chat } from "./components/chat"
import { Resources } from "./components/resources"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function CodeTutor() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string>("")
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(true)
  const [rubric, setRubric] = useState("")
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai'; content: string }>>([
    {
      type: 'ai',
      content: "Hello! I'm your AI tutor. I can help you understand and improve your code. Select a file to get started!"
    }
  ])
  const fileExplorerRef = useRef<{ addFilesToStructure: (files: { path: string; content: string }[]) => void }>(null)

  const handleFileSelect = (path: string, content: string) => {
    setSelectedFile(path)
    setFileContent(content)
  }

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent)
  }

  const handleFolderUpload = (files: { path: string; content: string }[]) => {
    if (fileExplorerRef.current) {
      fileExplorerRef.current.addFilesToStructure(files)
    }
  }

  const handleMessagesUpdate = (newMessages: Array<{ type: 'user' | 'ai'; content: string }>) => {
    setMessages(newMessages)
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* File Explorer */}
      <div
        className={`${
          isCodePanelOpen ? "w-72" : "w-0"
        } border-r border-zinc-800 transition-all duration-300 overflow-hidden`}
      >
        <div className="flex items-center justify-between p-3 border-b border-zinc-800">
          <span className="font-medium text-sm">Explorer</span>
          <Button variant="ghost" size="sm" className="h-6 w-6" onClick={() => setIsCodePanelOpen(!isCodePanelOpen)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <FileExplorer ref={fileExplorerRef} onFileSelect={handleFileSelect} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {!isCodePanelOpen && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 top-3 m-2 h-6 w-6"
            onClick={() => setIsCodePanelOpen(true)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        <ResizablePanelGroup direction="vertical">
          {/* Chat and Resources */}
          <ResizablePanel defaultSize={100}>
            <div className="h-full border-t border-zinc-800">
              <Tabs defaultValue="chat" className="h-full">
                <TabsList className="h-10 w-full justify-start gap-4 border-b border-zinc-800 bg-black px-4">
                  <TabsTrigger value="chat" className="data-[state=active]:bg-zinc-800">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="data-[state=active]:bg-zinc-800">
                    Resources
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="chat" className="h-[calc(100%-2.5rem)]">
                  <div className="flex h-full">
                    <ResizablePanelGroup direction="horizontal">
                      <ResizablePanel defaultSize={70} minSize={30}>
                        <div className="h-full overflow-auto">
                          {selectedFile ? (
                            <FileViewer
                              filename={selectedFile}
                              content={fileContent}
                              onContentChange={handleContentChange}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-zinc-500">
                              Select a file to view its contents
                            </div>
                          )}
                        </div>
                      </ResizablePanel>
                      <ResizablePanel defaultSize={30} minSize={20}>
                        <Chat 
                          onFileSelect={handleFileSelect} 
                          selectedFile={selectedFile || undefined}
                          selectedContent={fileContent}
                          onFolderUpload={handleFolderUpload}
                          messages={messages}
                          onMessagesUpdate={handleMessagesUpdate}
                          rubric={rubric}
                          onRubricChange={setRubric}
                        />
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>
                </TabsContent>
                <TabsContent value="resources" className="h-[calc(100%-2.5rem)]">
                  <Resources 
                    selectedFile={selectedFile || undefined}
                    rubric={rubric}
                    messages={messages}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}


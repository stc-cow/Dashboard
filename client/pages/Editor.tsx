import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Smartphone,
  Code,
  Play,
  Save,
  Settings,
  Layers,
  Palette,
  FileCode,
  Upload,
  Download,
  FolderOpen,
  FileText,
  Archive,
  ChevronDown,
} from "lucide-react";
import { useRef, useState } from "react";

export default function Editor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [projectFiles, setProjectFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setProjectFiles((prev) => [...prev, ...files]);
  };

  const handleImportProject = () => {
    fileInputRef.current?.click();
  };

  const handleExportProject = (format: string) => {
    // Export logic would go here
    console.log(`Exporting project as ${format}`);
    // This would generate and download the project files
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Editor Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-gradient-from to-gradient-to rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold">My Awesome App</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-gradient-from to-gradient-to"
              >
                <Play className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".kt,.java,.xml,.gradle"
              onChange={handleFileUpload}
              className="hidden"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleImportProject}>
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Import Files
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Import Project ZIP
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExportProject("apk")}>
                  <Smartphone className="w-4 h-4 mr-2" />
                  Export APK
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportProject("aab")}>
                  <Archive className="w-4 h-4 mr-2" />
                  Export AAB
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExportProject("studio")}>
                  <Code className="w-4 h-4 mr-2" />
                  Android Studio Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportProject("source")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Source Code ZIP
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" variant="ghost">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Project Files & Components */}
        <div className="w-64 border-r border-border/40 bg-card/30 p-4 overflow-y-auto">
          {/* Project Files Section */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center">
              <FileCode className="w-4 h-4 mr-2" />
              Project Files
            </h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {projectFiles.length === 0 ? (
                <div className="text-xs text-muted-foreground p-2 border border-dashed border-border/50 rounded">
                  No files imported yet. Use Import button above.
                </div>
              ) : (
                projectFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 text-xs bg-card/50 rounded hover:bg-card cursor-pointer"
                  >
                    <FileText className="w-3 h-3 mr-2 text-muted-foreground" />
                    <span className="truncate" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Components Section */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center">
              <Layers className="w-4 h-4 mr-2" />
              Components
            </h3>
            <div className="space-y-2">
              <div className="p-3 border border-border/50 rounded-lg bg-card/50 hover:bg-card cursor-pointer transition-colors">
                <div className="font-medium text-sm">Button</div>
                <div className="text-xs text-muted-foreground">
                  Interactive button component
                </div>
              </div>
              <div className="p-3 border border-border/50 rounded-lg bg-card/50 hover:bg-card cursor-pointer transition-colors">
                <div className="font-medium text-sm">Text View</div>
                <div className="text-xs text-muted-foreground">
                  Display text content
                </div>
              </div>
              <div className="p-3 border border-border/50 rounded-lg bg-card/50 hover:bg-card cursor-pointer transition-colors">
                <div className="font-medium text-sm">Image View</div>
                <div className="text-xs text-muted-foreground">
                  Display images
                </div>
              </div>
              <div className="p-3 border border-border/50 rounded-lg bg-card/50 hover:bg-card cursor-pointer transition-colors">
                <div className="font-medium text-sm">Input Field</div>
                <div className="text-xs text-muted-foreground">
                  Text input component
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 p-6 bg-muted/20">
          <div className="h-full flex items-center justify-center">
            <Card className="w-80 h-[600px] bg-white border border-border shadow-xl">
              <CardHeader className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-gradient-from to-gradient-to rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-slate-800">
                  Android App Canvas
                </CardTitle>
                <p className="text-sm text-slate-600">
                  Drag components here to start building your app
                </p>
              </CardHeader>
              <CardContent className="text-center text-slate-500">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                  Drop components here
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 border-l border-border/40 bg-card/30 p-4">
          <h3 className="font-semibold mb-4 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Properties
          </h3>
          <div className="space-y-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">
                    Background Color
                  </label>
                  <div className="mt-1 w-full h-8 bg-gradient-to-r from-gradient-from to-gradient-to rounded border"></div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Text Color
                  </label>
                  <div className="mt-1 w-full h-8 bg-slate-800 rounded border"></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Layout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="text-muted-foreground">Width: 100%</div>
                <div className="text-muted-foreground">Height: Auto</div>
                <div className="text-muted-foreground">Margin: 16px</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Code View */}
      <div className="border-t border-border/40 bg-card/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center">
            <FileCode className="w-4 h-4 mr-2" />
            Generated Code Preview
          </h3>
          <Button size="sm" variant="outline">
            <Code className="w-4 h-4 mr-2" />
            View Full Code
          </Button>
        </div>
        <div className="bg-slate-900 rounded-lg p-4 text-sm font-mono text-slate-200 min-h-[120px]">
          <div className="text-slate-400">// MainActivity.kt</div>
          <div className="mt-2">
            <span className="text-purple-400">class</span>{" "}
            <span className="text-blue-400">MainActivity</span> :{" "}
            <span className="text-green-400">AppCompatActivity</span>() {"{"}
          </div>
          <div className="ml-4 mt-1">
            <span className="text-purple-400">override fun</span>{" "}
            <span className="text-yellow-400">onCreate</span>
            (savedInstanceState: <span className="text-blue-400">
              Bundle
            </span>?) {"{"}
          </div>
          <div className="ml-8 text-slate-400">
            // Your app code will be generated here
          </div>
          <div className="ml-4">{"}"}</div>
          <div>{"}"}</div>
        </div>
      </div>
    </div>
  );
}

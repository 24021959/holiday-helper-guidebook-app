
import * as React from "react"
import { cn } from "@/lib/utils"
import { Maximize2, Minimize2, Eye } from "lucide-react"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onFormatText?: (command: string, value?: string) => void;
  expandable?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onFormatText, expandable = false, ...props }, ref) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
      <div className={cn("relative w-full", isExpanded && "h-[70vh]")}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            isExpanded && "h-full resize-none",
            className
          )}
          ref={ref}
          {...props}
        />
        
        {expandable && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute top-2 right-2 p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            title={isExpanded ? "Riduci editor" : "Espandi editor"}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }


import * as React from "react"
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Link as LinkIcon, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onFormatText?: (command: string, value?: string) => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onFormatText, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {onFormatText && (
          <div className="absolute top-0 right-0 bg-white border border-gray-200 rounded-md shadow-sm p-1 m-1 flex space-x-1 z-10">
            <button 
              type="button" 
              onClick={() => onFormatText('bold')}
              className="p-1 hover:bg-gray-100 rounded"
              title="Grassetto"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button 
              type="button" 
              onClick={() => onFormatText('italic')}
              className="p-1 hover:bg-gray-100 rounded"
              title="Corsivo"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button 
              type="button" 
              onClick={() => onFormatText('bulletList')}
              className="p-1 hover:bg-gray-100 rounded"
              title="Elenco puntato"
            >
              <List className="h-4 w-4" />
            </button>
            <button 
              type="button" 
              onClick={() => onFormatText('numberedList')}
              className="p-1 hover:bg-gray-100 rounded"
              title="Elenco numerato"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button 
              type="button" 
              onClick={() => onFormatText('heading1')}
              className="p-1 hover:bg-gray-100 rounded"
              title="Titolo 1"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button 
              type="button" 
              onClick={() => onFormatText('heading2')}
              className="p-1 hover:bg-gray-100 rounded"
              title="Titolo 2"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button 
              type="button" 
              onClick={() => onFormatText('link')}
              className="p-1 hover:bg-gray-100 rounded"
              title="Inserisci link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <button 
              type="button" 
              onClick={() => onFormatText('quote')}
              className="p-1 hover:bg-gray-100 rounded"
              title="Citazione"
            >
              <Quote className="h-4 w-4" />
            </button>
          </div>
        )}
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }


import React, { useState } from "react";
import { ContentBlock } from "@/pages/admin/AdminCreate";
import { 
  PlusCircle, TypeIcon, ImageIcon, Phone, MapPin, Trash2, MoveVertical,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight, List, ListOrdered,
  Heading1, Heading2, Quote, Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface VisualEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({ blocks, onChange }) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  
  const addBlock = (type: "text" | "image" | "phone" | "map") => {
    const newBlock: ContentBlock = {
      id: uuidv4(),
      type,
      content: "",
      position: "full"
    };
    
    onChange([...blocks, newBlock]);
    setSelectedBlock(newBlock.id);
  };
  
  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(
      blocks.map(block => 
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };
  
  const removeBlock = (id: string) => {
    onChange(blocks.filter(block => block.id !== id));
    if (selectedBlock === id) {
      setSelectedBlock(null);
    }
  };
  
  const handleBlockClick = (id: string) => {
    setSelectedBlock(id === selectedBlock ? null : id);
  };
  
  const handleDragStart = (id: string) => {
    setIsDragging(id);
  };
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.classList.add("bg-blue-50");
    setTimeout(() => {
      target.classList.remove("bg-blue-50");
    }, 100);
  };
  
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (isDragging) {
      const draggedIndex = blocks.findIndex(block => block.id === isDragging);
      
      if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
        const newBlocks = [...blocks];
        const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
        newBlocks.splice(targetIndex, 0, draggedBlock);
        onChange(newBlocks);
      }
    }
    
    setIsDragging(null);
  };
  
  const applyTextFormat = (blockId: string, format: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || block.type !== "text") return;
    
    const textarea = document.querySelector(`textarea[data-block-id="${blockId}"]`) as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let formattedText = '';
    let cursorPosition = start;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorPosition = start + formattedText.length;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorPosition = start + formattedText.length;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        cursorPosition = start + formattedText.length;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        cursorPosition = start + formattedText.length;
        break;
      case 'quote':
        formattedText = `> ${selectedText}`;
        cursorPosition = start + formattedText.length;
        break;
      case 'bullet-list':
        formattedText = selectedText.split('\n').map(line => `- ${line}`).join('\n');
        cursorPosition = start + formattedText.length;
        break;
      case 'numbered-list':
        formattedText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n');
        cursorPosition = start + formattedText.length;
        break;
      case 'link':
        const url = prompt("Inserisci l'URL del link:", "https://");
        if (url) {
          formattedText = `[${selectedText || 'Link'}](${url})`;
          cursorPosition = start + formattedText.length;
        } else {
          return;
        }
        break;
      case 'align-left':
      case 'align-center':
      case 'align-right':
        const alignment = format.replace('align-', '');
        formattedText = `<div style="text-align:${alignment}">${selectedText}</div>`;
        cursorPosition = start + formattedText.length;
        break;
    }
    
    if (formattedText) {
      const newContent = block.content.substring(0, start) + formattedText + block.content.substring(end);
      updateBlock(blockId, { content: newContent });
      
      // Set cursor position after update
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    }
  };
  
  const renderBlockContent = (block: ContentBlock, index: number) => {
    const isSelected = selectedBlock === block.id;
    const isText = block.type === "text";
    const isImage = block.type === "image";
    const isPhone = block.type === "phone";
    const isMap = block.type === "map";
    
    return (
      <div 
        key={block.id}
        className={`relative border rounded-md mb-4 transition-all ${
          isSelected ? "ring-2 ring-blue-500" : "hover:border-gray-400"
        }`}
        onClick={() => handleBlockClick(block.id)}
        draggable
        onDragStart={() => handleDragStart(block.id)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDrop={(e) => handleDrop(e, index)}
      >
        {isText && isSelected && (
          <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                applyTextFormat(block.id, 'bold');
              }}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                applyTextFormat(block.id, 'italic');
              }}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                applyTextFormat(block.id, 'h1');
              }}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                applyTextFormat(block.id, 'h2');
              }}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                applyTextFormat(block.id, 'bullet-list');
              }}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                applyTextFormat(block.id, 'numbered-list');
              }}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                applyTextFormat(block.id, 'quote');
              }}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                applyTextFormat(block.id, 'link');
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <div className="h-6 border-r mx-1"></div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                applyTextFormat(block.id, 'align-left');
              }}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                applyTextFormat(block.id, 'align-center');
              }}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                applyTextFormat(block.id, 'align-right');
              }}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="p-4">
          {isText && (
            <Textarea
              value={block.content}
              placeholder="Inserisci il testo qui..."
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="w-full border-0 focus:ring-0 p-0 min-h-[100px] resize-none"
              data-block-id={block.id}
            />
          )}
          
          {isImage && (
            <div className="flex flex-col items-center gap-2">
              {block.content ? (
                <div className="relative w-full">
                  <img 
                    src={block.content} 
                    alt={block.caption || "Immagine"} 
                    className="w-full h-64 object-contain mx-auto"
                  />
                  <Input
                    value={block.caption || ""}
                    placeholder="Didascalia dell'immagine"
                    onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                    className="mt-2 text-center"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-12 w-full text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">Clicca per caricare un'immagine</p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`image-upload-${block.id}`}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              updateBlock(block.id, { content: event.target.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      className="mt-4"
                      asChild
                    >
                      <label htmlFor={`image-upload-${block.id}`}>
                        Carica immagine
                      </label>
                    </Button>
                  </div>
                </div>
              )}
              
              {isSelected && block.content && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateBlock(block.id, { position: "left" })}
                    className={block.position === "left" ? "bg-blue-100" : ""}
                  >
                    Sinistra
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateBlock(block.id, { position: "center" })}
                    className={block.position === "center" ? "bg-blue-100" : ""}
                  >
                    Centro
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateBlock(block.id, { position: "right" })}
                    className={block.position === "right" ? "bg-blue-100" : ""}
                  >
                    Destra
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateBlock(block.id, { position: "full" })}
                    className={block.position === "full" ? "bg-blue-100" : ""}
                  >
                    Intera
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {isPhone && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-md p-3">
                <Phone className="text-green-500 h-5 w-5" />
                <Input
                  value={block.content}
                  placeholder="Inserisci numero di telefono"
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  className="border-0 focus:ring-0 bg-transparent"
                />
              </div>
              <Input
                value={block.caption || ""}
                placeholder="Etichetta (es. 'Prenotazioni', 'Informazioni')"
                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                className="mt-1"
              />
            </div>
          )}
          
          {isMap && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md p-3">
                <MapPin className="text-blue-500 h-5 w-5" />
                <Input
                  value={block.content}
                  placeholder="Inserisci URL di Google Maps"
                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                  className="border-0 focus:ring-0 bg-transparent"
                />
              </div>
              <Input
                value={block.caption || ""}
                placeholder="Nome del luogo"
                onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                className="mt-1"
              />
              {block.content && (
                <div className="mt-2">
                  <a 
                    href={block.content} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <MapPin className="h-4 w-4" />
                    {block.caption || "Visualizza su Google Maps"}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        
        {isSelected && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => removeBlock(block.id)}
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 cursor-move"
            >
              <MoveVertical className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-white p-6">
      {blocks.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="mx-auto">
            <PlusCircle className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nessun contenuto</h3>
            <p className="mt-1 text-sm text-gray-500">Inizia aggiungendo degli elementi alla tua pagina</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, index) => renderBlockContent(block, index))}
        </div>
      )}
      
      <div className="mt-6 flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Aggiungi elemento
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => addBlock("text")} className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4" />
              <span>Testo</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlock("image")} className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>Immagine</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlock("phone")} className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Telefono</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlock("map")} className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Google Maps</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

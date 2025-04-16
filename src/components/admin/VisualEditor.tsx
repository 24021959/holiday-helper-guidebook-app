import React, { useState } from 'react';
import { useEditorContent } from '@/components/editor/hooks/useEditorContent';
import { useEditorPreview } from '@/components/editor/hooks/useEditorPreview';
import { useEditorState } from '@/components/editor/hooks/useEditorState';
import { useImageControls } from '@/components/editor/hooks/useImageControls';
import { ImageGallery } from '@/components/editor/ImageGallery';
import { EditorArea } from '@/components/editor/EditorArea';
import ImageInsertionDialog from './form/ImageInsertionDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageDetail } from '@/types/image.types';
import { Phone, MapPin, Image, Eye, Maximize2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from "lucide-react";
import {
  FormatButtons,
  AlignmentButtons,
  HeadingsDropdown,
  InsertButtons,
  ViewButtons,
  HistoryButtons
} from '@/components/editor/toolbar/EditorToolbarButtons';

interface VisualEditorProps {
  content: string;
  images: ImageDetail[];
  onChange: (content: string) => void;
  onImageAdd: (image: ImageDetail) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  content,
  images,
  onChange,
  onImageAdd
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneLabel, setPhoneLabel] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [mapLabel, setMapLabel] = useState('');

  const {
    cursorPosition,
    setCursorPosition,
    selectedText,
    setSelectedText,
    historyIndex,
    editHistory,
    handleUndo,
    handleRedo,
    handleTextFormat,
    handleTextAlign,
    handleInsertPhone,
    handleInsertMap,
    handleInsertImage,
    updateHistory
  } = useEditorContent(content, onChange);

  const {
    editMode,
    isFullscreen,
    showImageDialog,
    showPhoneDialog,
    showMapDialog,
    setShowImageDialog,
    setShowPhoneDialog,
    setShowMapDialog,
    toggleEditMode,
    toggleFullscreen
  } = useEditorState();

  const {
    hoveredImageIndex,
    setHoveredImageIndex,
    showImageControls,
    setShowImageControls,
    handleImagePositionChange,
    handleImageWidthChange,
    handleImageCaptionChange,
    handleDeleteImage
  } = useImageControls(images, onImageAdd, onChange);

  const { formattedPreview } = useEditorPreview(content, images);

  const handleTextareaSelect = () => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
      
      if (textarea.selectionStart !== textarea.selectionEnd) {
        setSelectedText({
          start: textarea.selectionStart,
          end: textarea.selectionEnd,
          text: textarea.value.substring(
            textarea.selectionStart,
            textarea.selectionEnd
          )
        });
      } else {
        setSelectedText(null);
      }
    }
  };

  const handleOpenImageDialog = () => {
    if (document.querySelector('textarea')) {
      setCursorPosition((document.querySelector('textarea') as HTMLTextAreaElement).selectionStart);
      setShowImageDialog(true);
    }
  };

  const handleOpenPhoneDialog = () => {
    if (document.querySelector('textarea')) {
      setCursorPosition((document.querySelector('textarea') as HTMLTextAreaElement).selectionStart);
      setShowPhoneDialog(true);
    }
  };

  const handleOpenMapDialog = () => {
    if (document.querySelector('textarea')) {
      setCursorPosition((document.querySelector('textarea') as HTMLTextAreaElement).selectionStart);
      setShowMapDialog(true);
    }
  };

  const handleImageUpload = (imageUrl: string, position: "left" | "center" | "right" | "full", caption?: string) => {
    const imageDetail: ImageDetail = {
      url: imageUrl,
      position,
      caption,
      width: "50%",
      type: "image"
    };

    handleInsertImage(imageDetail);
    onImageAdd(imageDetail);
    setShowImageDialog(false);
  };

  const handlePhoneInsert = () => {
    if (phoneNumber && phoneLabel) {
      handleInsertPhone(phoneNumber, phoneLabel);
      setPhoneNumber('');
      setPhoneLabel('');
      setShowPhoneDialog(false);
    }
  };

  const handleMapInsert = () => {
    if (mapUrl && mapLabel) {
      handleInsertMap(mapUrl, mapLabel);
      setMapUrl('');
      setMapLabel('');
      setShowMapDialog(false);
    }
  };

  return (
    <div className={`flex flex-col space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`} data-no-translation="true">
      <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md mb-4 sticky top-0 z-10" data-no-translation="true">
        <HistoryButtons
          historyIndex={historyIndex}
          editHistory={editHistory}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
        
        <FormatButtons
          selectedText={selectedText}
          onTextFormat={handleTextFormat}
        />
        
        <AlignmentButtons
          selectedText={selectedText}
          onTextAlign={handleTextAlign}
        />
        
        <HeadingsDropdown
          selectedText={selectedText}
          onTextFormat={handleTextFormat}
        />
        
        <div className="flex items-center gap-2 border-l pl-2 border-gray-300">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenImageDialog}
            className="flex items-center gap-1"
          >
            <Image className="h-4 w-4" />
            Immagine
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenPhoneDialog}
            className="flex items-center gap-1"
          >
            <Phone className="h-4 w-4" />
            Telefono
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenMapDialog}
            className="flex items-center gap-1"
          >
            <MapPin className="h-4 w-4" />
            Mappa
          </Button>
        </div>
        
        <div className="flex items-center gap-2 border-l pl-2 border-gray-300 ml-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleEditMode}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            {editMode === 'visual' ? 'Anteprima' : 'Editor'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleFullscreen}
            className="flex items-center gap-1"
          >
            <Maximize2 className="h-4 w-4" />
            {isFullscreen ? 'Esci' : 'Schermo intero'}
          </Button>
        </div>
      </div>

      <EditorArea
        content={content}
        editMode={editMode}
        formattedPreview={formattedPreview}
        onContentChange={onChange}
        onSelect={handleTextareaSelect}
      />

      {images.length > 0 && (
        <ImageGallery
          images={images}
          content={content}
          hoveredImageIndex={hoveredImageIndex}
          showImageControls={showImageControls}
          onImageMouseEnter={setHoveredImageIndex}
          onImageMouseLeave={() => showImageControls === null && setHoveredImageIndex(null)}
          onToggleControls={(index) => setShowImageControls(showImageControls === index ? null : index)}
          onPositionChange={handleImagePositionChange}
          onWidthChange={handleImageWidthChange}
          onCaptionChange={handleImageCaptionChange}
          onDeleteImage={(index) => handleDeleteImage(index, content)}
        />
      )}

      <ImageInsertionDialog
        isOpen={showImageDialog}
        onClose={() => setShowImageDialog(false)}
        onImageUpload={handleImageUpload}
      />

      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserisci Numero di Telefono</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone-number" className="text-right">
                Numero
              </Label>
              <Input
                id="phone-number"
                placeholder="+39 123 456 7890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone-label" className="text-right">
                Etichetta
              </Label>
              <Input
                id="phone-label"
                placeholder="Chiama ora"
                value={phoneLabel}
                onChange={(e) => setPhoneLabel(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhoneDialog(false)}>Annulla</Button>
            <Button onClick={handlePhoneInsert}>Inserisci</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserisci Link a Google Maps</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="map-url" className="text-right">
                URL Maps
              </Label>
              <Input
                id="map-url"
                placeholder="https://maps.google.com/..."
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="map-label" className="text-right">
                Etichetta
              </Label>
              <Input
                id="map-label"
                placeholder="Visualizza su mappa"
                value={mapLabel}
                onChange={(e) => setMapLabel(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMapDialog(false)}>Annulla</Button>
            <Button onClick={handleMapInsert}>Inserisci</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export const useTextFormatting = (
  content: string,
  updateContent: (newContent: string) => void
) => {
  const handleTextFormat = (
    format: string, 
    selectedText: { start: number; end: number; text: string }
  ) => {
    const { start, end, text } = selectedText;
    let formattedText = text;
    
    switch (format) {
      case 'bold':
        formattedText = `**${text}**`;
        break;
      case 'italic':
        formattedText = `*${text}*`;
        break;
      case 'underline':
        formattedText = `__${text}__`;
        break;
      case 'h1':
        formattedText = `# ${text}`;
        break;
      case 'h2':
        formattedText = `## ${text}`;
        break;
      case 'bullet':
        formattedText = text.split('\n').map(line => `- ${line}`).join('\n');
        break;
      default:
        return;
    }
    
    const newContent = 
      content.substring(0, start) + 
      formattedText + 
      content.substring(end);
    
    updateContent(newContent);
  };

  const handleTextAlign = (
    alignment: 'left' | 'center' | 'right' | 'justify',
    selectedText: { start: number; end: number; text: string }
  ) => {
    const { start, end, text } = selectedText;
    const alignedText = `[ALIGN:${alignment}]${text}[/ALIGN]`;
    
    const newContent = 
      content.substring(0, start) + 
      alignedText + 
      content.substring(end);
    
    updateContent(newContent);
  };

  return {
    handleTextFormat,
    handleTextAlign
  };
};

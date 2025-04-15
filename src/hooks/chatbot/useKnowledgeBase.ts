
import { useCallback, useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useKnowledgeBase = (previewConfig?: any, isAdminArea?: () => boolean) => {
  const [knowledgeBaseExists, setKnowledgeBaseExists] = useState<boolean | null>(null);
  const [knowledgeBaseCount, setKnowledgeBaseCount] = useState<number>(0);
  const knowledgeBaseCheckedRef = useRef(false);

  const refreshKnowledgeBase = useCallback(async () => {
    if (previewConfig) {
      setKnowledgeBaseExists(true);
      setKnowledgeBaseCount(10);
      return true;
    }
    
    try {
      console.log("Refreshing knowledge base status...");
      
      // Check if the table exists and has records
      const { count, error: countError } = await supabase
        .from('chatbot_knowledge')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        console.error("Error checking knowledge base count:", countError);
        setKnowledgeBaseExists(false);
        setKnowledgeBaseCount(0);
        
        // Only show toast notifications in admin area
        if (isAdminArea && isAdminArea() && !knowledgeBaseCheckedRef.current) {
          toast.warning("Errore nella verifica della base di conoscenza");
          knowledgeBaseCheckedRef.current = true;
        }
        
        return false;
      }
      
      const hasContent = count !== null && count > 0;
      setKnowledgeBaseExists(hasContent);
      setKnowledgeBaseCount(count || 0);
      
      console.log(`Knowledge base check result: ${count}`);
      
      // Only show toast notifications in admin area
      if (isAdminArea && isAdminArea() && !knowledgeBaseCheckedRef.current) {
        if (hasContent) {
          toast.success(`Base di conoscenza verificata: ${count} elementi`);
          knowledgeBaseCheckedRef.current = true;
        } else {
          toast.warning("La base di conoscenza è vuota");
          knowledgeBaseCheckedRef.current = true;
        }
      }
      
      return hasContent;
    } catch (error) {
      console.error("Error refreshing knowledge base status:", error);
      setKnowledgeBaseExists(false);
      setKnowledgeBaseCount(0);
      return false;
    }
  }, [previewConfig, isAdminArea]);

  return {
    knowledgeBaseExists,
    knowledgeBaseCount,
    refreshKnowledgeBase
  };
};


import { supabase } from './client';
import { v4 as uuidv4 } from 'uuid';

export const uploadImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;
  const filePath = `lovable-uploads/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('images')
    .upload(filePath, file);
    
  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw new Error('Error uploading file');
  }
  
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};

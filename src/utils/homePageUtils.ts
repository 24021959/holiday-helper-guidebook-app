
import { Language } from "@/types/translation.types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const DEFAULT_HOME_IMAGE = "/lovable-uploads/6d1eebb5-61dd-4e37-99c7-4c67721ca126.png";

export const createHomeContent = (imageUrl: string) => `
<div class="prose prose-emerald mb-8">
  <p class="text-lg">Esplora il nostro menu digitale e scopri tutte le informazioni sul nostro hotel, i nostri servizi e la nostra posizione.</p>
  <p>La nostra struttura offre comfort moderni in un ambiente tradizionale italiano. Siamo felici di darvi il benvenuto e rendere il vostro soggiorno il più piacevole possibile.</p>
</div>

<!-- IMAGES -->
{
  "type": "image",
  "url": "${imageUrl}",
  "position": "center",
  "caption": "La nostra struttura"
}
`;

export const saveMenuIcon = async (path: string, title: string) => {
  const { error } = await supabase
    .from('menu_icons')
    .insert({
      path,
      label: title,
      icon: "Home",
      bg_color: 'bg-blue-200',
      is_submenu: false,
      published: true,
      is_parent: false,
      updated_at: new Date().toISOString()
    });

  return error;
};

export const updateMenuIcon = async (path: string, title: string) => {
  const { error } = await supabase
    .from('menu_icons')
    .update({
      label: title,
      icon: "Home",
      updated_at: new Date().toISOString()
    })
    .eq('path', path);

  return error;
};

export const saveHomePage = async (pageData: {
  id: string;
  title: string;
  content: string;
  path: string;
  imageUrl: string;
}) => {
  const { error } = await supabase
    .from('custom_pages')
    .insert({
      id: pageData.id,
      title: pageData.title,
      content: pageData.content,
      path: pageData.path,
      image_url: pageData.imageUrl,
      icon: "Home",
      is_parent: false,
      is_submenu: false,
      published: true,
      updated_at: new Date().toISOString()
    });

  return error;
};

export const updateHomePage = async (pageData: {
  title: string;
  content: string;
  path: string;
  imageUrl: string;
}) => {
  const { error } = await supabase
    .from('custom_pages')
    .update({
      title: pageData.title,
      content: pageData.content,
      image_url: pageData.imageUrl,
      icon: "Home",
      updated_at: new Date().toISOString()
    })
    .eq('path', pageData.path);

  return error;
};


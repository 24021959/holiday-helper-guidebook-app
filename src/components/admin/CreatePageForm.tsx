
// Only updating the part that needs fixing to correctly process pageImages

const handleSubmit = async (values: z.infer<typeof formSchema>) => {
  try {
    const pageId = uuidv4();
    const finalPath = isSubmenu 
      ? `${parentPath}/${values.path}` 
      : `/${values.path}`;
    
    // Formatta il contenuto includendo i dati delle immagini
    const formattedContent = formatPageContent(values.content, pageImages);
    
    // Prepare data for insertion to custom_pages table
    const pageData = {
      id: pageId,
      title: values.title,
      content: formattedContent,
      path: finalPath,
      image_url: uploadedImage,
      icon: values.icon || selectedIcon,
      is_submenu: isSubmenu,
      parent_path: isSubmenu ? parentPath : null,
      list_type: listType,
      list_items: listType && locationItems.length > 0 ? locationItems : null,
      page_images: pageImages.length > 0 ? pageImages.map(img => ({...img, type: "image"})) : null
    };

    console.log("Page data for insertion:", pageData);

    // 1. Insert into custom_pages table
    const { data: insertedPage, error: pagesError } = await supabase
      .from('custom_pages')
      .insert(pageData)
      .select('*')
      .single();
    
    if (pagesError) {
      console.error("Error inserting page:", pagesError);
      throw pagesError;
    }
    
    console.log("Page inserted successfully:", insertedPage);
    
    // 2. Insert into menu_icons table
    const iconData = {
      label: values.title,
      path: finalPath,
      icon: values.icon || selectedIcon,
      bg_color: "bg-blue-200",
      is_submenu: isSubmenu,
      parent_path: isSubmenu ? parentPath : null
    };

    console.log("Icon data for insertion:", iconData);

    const { data: insertedIcon, error: iconError } = await supabase
      .from('menu_icons')
      .insert(iconData)
      .select('*')
      .single();
    
    if (iconError) {
      console.error("Error inserting icon:", iconError);
      throw iconError;
    }
    
    console.log("Icon inserted successfully:", insertedIcon);
    
    // Fetch all pages to update the list
    const { data: pagesData, error: fetchError } = await supabase
      .from('custom_pages')
      .select('*');
    
    if (fetchError) {
      console.error("Error fetching pages:", fetchError);
      throw fetchError;
    }
    
    if (pagesData) {
      const formattedPages = pagesData.map(page => ({
        id: page.id,
        title: page.title,
        content: page.content,
        path: page.path,
        imageUrl: page.image_url,
        icon: page.icon,
        listType: page.list_type as "locations" | "activities" | "restaurants" | undefined,
        listItems: page.list_items as { name: string; description?: string; phoneNumber?: string; mapsUrl?: string; }[] | undefined,
        isSubmenu: page.is_submenu || false,
        parentPath: page.parent_path || undefined,
        pageImages: page.page_images ? (page.page_images as any[]).map(img => ({...img, type: "image"})) : []
      }));
      
      // Update pages list in parent component
      onPageCreated(formattedPages);
      
      console.log("Updated pages list:", formattedPages);
    }
    
    // Reset form and state
    form.reset();
    setUploadedImage(null);
    setIsSubmenu(false);
    setParentPath("");
    setLocationItems([]);
    setListType(undefined);
    setSelectedIcon("FileText");
    setPageImages([]);
    
    toast.success("Pagina creata con successo");
    
  } catch (error) {
    console.error("Errore nella creazione della pagina:", error);
    toast.error("Errore nel salvare la pagina");
  }
};

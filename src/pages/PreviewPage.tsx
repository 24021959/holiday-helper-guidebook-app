import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackToMenu from "@/components/BackToMenu";
import TranslatedText from "@/components/TranslatedText";
import { useIsMobile } from "@/hooks/use-mobile";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImageItem {
  url: string;
  position: "left" | "center" | "right" | "full";
  caption?: string;
  type: "image";
  contentImage?: boolean;
}

interface PageData {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  listItems?: any[];
  listType?: 'restaurants' | 'activities' | 'locations';
  pageImages?: ImageItem[];
}

interface PreviewPageProps {
  pageRoute?: string;
}

const PreviewPage: React.FC<PreviewPageProps> = ({ pageRoute }) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headerSettings, setHeaderSettings] = useState<{ logoUrl?: string; headerColor?: string }>({});
  const [pageContentSections, setPageContentSections] = useState<(string | ImageItem)[]>([]);

  const path = pageRoute || location.pathname;
  const effectivePath = path.startsWith('/preview') ? path.substring(8) : path;

  useEffect(() => {
    console.log("PreviewPage - Caricamento pagina con percorso:", effectivePath);
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const { data: pageData, error: pageError } = await supabase
          .from('custom_pages')
          .select('*')
          .eq('path', effectivePath)
          .single();
        
        if (pageError) {
          console.error("Errore nel caricamento della pagina:", pageError);
          throw new Error(`Pagina non trovata: ${effectivePath}`);
        }
        
        if (pageData) {
          const listItemsArray = pageData.list_items 
            ? Array.isArray(pageData.list_items) 
                ? pageData.list_items 
                : []
            : [];

          const pageImages: ImageItem[] = [];
          let processedContent = pageData.content;
          
          const contentImageRegex = /<!-- IMAGE-CONTENT-\d+ -->\n({.*?})\n\n/gs;
          let contentMatch;
          while ((contentMatch = contentImageRegex.exec(processedContent)) !== null) {
            try {
              if (contentMatch[1]) {
                const imageData = JSON.parse(contentMatch[1]);
                if (imageData.type === "image") {
                  pageImages.push({...imageData, contentImage: true});
                }
              }
            } catch (e) {
              console.error("Errore nel parsing dell'immagine nel contenuto:", e);
            }
          }
          
          processedContent = processedContent.replace(/<!-- IMAGE-CONTENT-\d+ -->\n({.*?})\n\n/gs, '');
          
          if (processedContent.includes("<!-- IMAGES -->")) {
            const parts = processedContent.split("<!-- IMAGES -->");
            processedContent = parts[0];
            
            if (parts[1]) {
              const imageLines = parts[1].split("\n").filter(line => line.trim());
              
              for (const line of imageLines) {
                try {
                  if (line.includes('"type":"image"')) {
                    const imageData = JSON.parse(line);
                    if (imageData.type === "image") {
                      pageImages.push({...imageData, contentImage: false});
                    }
                  }
                } catch (e) {
                  console.error("Errore nel parsing dell'immagine:", e);
                }
              }
            }
          }
          
          const formattedPageData: PageData = {
            id: pageData.id,
            title: pageData.title,
            content: processedContent,
            imageUrl: pageData.image_url,
            listItems: listItemsArray,
            listType: pageData.list_type as 'restaurants' | 'activities' | 'locations' | undefined,
            pageImages: pageImages.length > 0 ? pageImages : undefined
          };
          
          setPageData(formattedPageData);
          
          parseContentSections(processedContent, pageImages);
        } else {
          throw new Error(`Pagina non trovata: ${effectivePath}`);
        }
        
        const { data: headerData, error: headerError } = await supabase
          .from('header_settings')
          .select('*')
          .limit(1)
          .single();
          
        if (!headerError && headerData) {
          setHeaderSettings({
            logoUrl: headerData.logo_url,
            headerColor: headerData.header_color,
          });
        }
      } catch (error) {
        console.error("Errore:", error);
        setError(error instanceof Error ? error.message : "Errore sconosciuto");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [effectivePath]);

  const parseContentSections = (content: string, images: ImageItem[]) => {
    const parsedContent = parseMarkdownImages(content);
    
    const contentImages = images.filter(img => img.contentImage);
    const galleryImages = images.filter(img => !img.contentImage);
    
    if (contentImages.length > 0) {
      const contentSectionsTemp: (string | ImageItem)[] = [];
      
      let currentContentIndex = 0;
      let paragraphCount = 0;
      
      parsedContent.forEach(section => {
        if (typeof section === 'string') {
          const paragraphs = section.split('\n').filter(p => p.trim() !== '');
          
          paragraphs.forEach(paragraph => {
            contentSectionsTemp.push(paragraph);
            paragraphCount++;
            
            while (
              currentContentIndex < contentImages.length && 
              paragraphCount > currentContentIndex
            ) {
              contentSectionsTemp.push(contentImages[currentContentIndex]);
              currentContentIndex++;
            }
          });
        } else {
          contentSectionsTemp.push(section);
        }
      });
      
      while (currentContentIndex < contentImages.length) {
        contentSectionsTemp.push(contentImages[currentContentIndex]);
        currentContentIndex++;
      }
      
      if (galleryImages.length > 0) {
        galleryImages.forEach(image => {
          contentSectionsTemp.push(image);
        });
      }
      
      setPageContentSections(contentSectionsTemp);
    } else {
      const contentSectionsTemp = [...parsedContent];
      
      galleryImages.forEach(image => {
        contentSectionsTemp.push(image);
      });
      
      setPageContentSections(contentSectionsTemp);
    }
  };

  const parseMarkdownImages = (content: string): (string | ImageItem)[] => {
    const sections: (string | ImageItem)[] = [];
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = imgRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        sections.push(content.substring(lastIndex, match.index));
      }
      
      const altText = match[1];
      const imageUrl = match[2];
      
      const imageItem: ImageItem = {
        url: imageUrl,
        position: "center",
        caption: altText !== "[Immagine]" ? altText : undefined,
        type: "image"
      };
      
      sections.push(imageItem);
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      sections.push(content.substring(lastIndex));
    }
    
    return sections;
  };

  const renderImage = (image: ImageItem, index: number) => {
    const positionClass = image.position === "left" 
      ? "float-left mr-4 mb-4 w-1/2" 
      : image.position === "right" 
        ? "float-right ml-4 mb-4 w-1/2" 
        : image.position === "center" 
          ? "mx-auto mb-4 w-2/3" 
          : "w-full mb-4";
    
    return (
      <figure key={`img-${index}`} className={`${positionClass} my-6`}>
        <div className="rounded-lg overflow-hidden shadow-md">
          <AspectRatio ratio={16/9} className="bg-gray-100">
            <img 
              src={image.url} 
              alt={image.caption || `Immagine ${index + 1}`}
              className="object-cover w-full h-full"
              data-image-id={`img-${index}`}
            />
          </AspectRatio>
        </div>
        {image.caption && image.caption !== "[Immagine]" && (
          <figcaption className="text-sm text-gray-600 text-center mt-2 italic">
            <TranslatedText text={image.caption} />
          </figcaption>
        )}
      </figure>
    );
  };

  const renderMarkdownLink = (link: string) => {
    if (link.includes('tel:')) {
      const label = link.match(/\[(.*?)\]/)?.[1] || '';
      const phoneNumber = link.match(/\(tel:(.*?)\)/)?.[1] || '';
      
      return (
        <a 
          href={`tel:${phoneNumber}`} 
          className="inline-flex items-center text-emerald-600 hover:underline"
        >
          <Phone className="h-4 w-4 mr-1" />
          <span>{label}</span>
        </a>
      );
    }
    
    if (link.includes('maps.google.com') || link.includes('goo.gl/maps')) {
      const label = link.match(/\[(.*?)\]/)?.[1] || 'Vedi sulla mappa';
      const mapUrl = link.match(/\((.*?)\)/)?.[1] || '';
      
      return (
        <a 
          href={mapUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center text-emerald-600 hover:underline"
        >
          <MapPin className="h-4 w-4 mr-1" />
          <span>{label}</span>
        </a>
      );
    }
    
    const label = link.match(/\[(.*?)\]/)?.[1] || '';
    const url = link.match(/\((.*?)\)/)?.[1] || '';
    
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-emerald-600 hover:underline"
      >
        {label}
      </a>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="mt-4 text-emerald-700">
          <TranslatedText text="Caricamento pagina..." />
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          logoUrl={headerSettings.logoUrl} 
          backgroundColor={headerSettings.headerColor}
          showAdminButton={true}
        />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-gray-600 mb-6">
              <TranslatedText text="La pagina richiesta non è stata trovata. Controlla l'URL o torna al menu principale." />
            </p>
            <Button onClick={() => navigate('/menu')} className="bg-emerald-600 hover:bg-emerald-700">
              <TranslatedText text="Torna al Menu" />
            </Button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex flex-col h-screen">
        <Header 
          logoUrl={headerSettings.logoUrl} 
          backgroundColor={headerSettings.headerColor}
          showAdminButton={true}
        />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">
              <TranslatedText text="Nessun contenuto trovato per questa pagina." />
            </p>
            <Button onClick={() => navigate('/menu')} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
              <TranslatedText text="Torna al Menu" />
            </Button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        logoUrl={headerSettings.logoUrl} 
        backgroundColor={headerSettings.headerColor}
        showAdminButton={true}
      />
      
      <div className="flex-1 p-2 md:p-6 lg:p-8 bg-gray-50">
        <div className={`mx-auto ${isMobile ? 'w-full p-0 max-w-none' : 'container max-w-4xl'} content-container`}>
          <BackToMenu />
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mt-6 mb-8">
            {pageData?.title ? <TranslatedText text={pageData.title} /> : null}
          </h1>
          
          {pageData?.imageUrl && (
            <div className="mb-8">
              <AspectRatio ratio={16/9} className="bg-gray-100 rounded-lg overflow-hidden shadow-md">
                <img 
                  src={pageData.imageUrl} 
                  alt={pageData.title} 
                  className="w-full h-full object-cover"
                  data-main-image="true"
                />
              </AspectRatio>
            </div>
          )}
          
          <div className={`bg-white ${isMobile ? 'p-4' : 'p-6 md:p-8'} rounded-lg shadow-md mb-8 w-full`}>
            <div className="prose max-w-none clearfix readable-text">
              {pageContentSections.map((section, index) => {
                if (typeof section === 'string') {
                  return (
                    <div key={`p-${index}`}>
                      <TranslatedText 
                        text={section} 
                        as="div" 
                        dangerouslySetInnerHTML={true}
                        className="mb-6"
                      />
                    </div>
                  );
                } else {
                  return renderImage(section, index);
                }
              })}
            </div>
          </div>
          
          {pageData?.listItems && pageData.listItems.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-emerald-700 mb-6">
                <TranslatedText 
                  text={
                    pageData.listType === "restaurants" ? "Ristoranti Consigliati" :
                    pageData.listType === "activities" ? "Attività Consigliate" :
                    "Luoghi di Interesse"
                  } 
                />
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pageData.listItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {item.imageUrl && (
                      <AspectRatio ratio={16/9} className="bg-gray-100">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      </AspectRatio>
                    )}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">
                        <TranslatedText text={item.name} />
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 mb-3 leading-relaxed">
                          <TranslatedText text={item.description} />
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        {item.phoneNumber && (
                          <div className="flex items-center text-sm">
                            <Phone className="text-emerald-600 h-4 w-4 mr-2" />
                            <a href={`tel:${item.phoneNumber.replace(/\s+/g, '')}`} className="text-emerald-600 hover:underline">
                              {item.phoneNumber}
                            </a>
                          </div>
                        )}
                        
                        {item.mapsUrl && (
                          <div className="flex items-center text-sm">
                            <MapPin className="text-emerald-600 h-4 w-4 mr-2" />
                            <a href={item.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                              <TranslatedText text="Visualizza sulla mappa" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PreviewPage;

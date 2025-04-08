
import { useKeywordToIconMap } from "@/hooks/useKeywordToIconMap";

// Funzione per identificare l'icona più appropriata basandosi sul titolo della pagina
export const identifyIconFromTitle = (title: string, keywordToIconMap: Record<string, string>) => {
  // Converti il titolo in minuscolo per corrispondenza senza distinzione tra maiuscole e minuscole
  const lowerTitle = title.toLowerCase();
  
  // Mappature dirette per titoli comuni
  if (lowerTitle.includes("taxi") || lowerTitle.includes("trasporto privato")) return "Car";
  if (lowerTitle.includes("storia")) return "Book";
  if (lowerTitle.includes("città") || lowerTitle.includes("centro")) return "Building";
  if (lowerTitle.includes("hotel") || lowerTitle.includes("servizi hotel")) return "Hotel";
  if (lowerTitle.includes("ristorante") || lowerTitle.includes("cucina")) return "Utensils";
  if (lowerTitle.includes("spiaggia") || lowerTitle.includes("mare")) return "Palmtree";
  if (lowerTitle.includes("colazione") || lowerTitle.includes("breakfast")) return "Coffee";
  if (lowerTitle.includes("camera") || lowerTitle.includes("alloggio")) return "Bed";
  if (lowerTitle.includes("contatti") || lowerTitle.includes("telefono")) return "Phone";
  if (lowerTitle.includes("wifi") || lowerTitle.includes("internet")) return "Wifi";
  if (lowerTitle.includes("eventi") || lowerTitle.includes("calendar")) return "Calendar";
  if (lowerTitle.includes("shopping") || lowerTitle.includes("negozi")) return "ShoppingBag";
  if (lowerTitle.includes("mappa") || lowerTitle.includes("dove")) return "Map";
  if (lowerTitle.includes("attività") || lowerTitle.includes("sport")) return "Bike";
  if (lowerTitle.includes("foto") || lowerTitle.includes("galleria")) return "Camera";
  if (lowerTitle.includes("benvenuto") || lowerTitle.includes("welcome")) return "Home";
  if (lowerTitle.includes("animali") || lowerTitle.includes("pet")) return "PawPrint";
  if (lowerTitle.includes("festa") || lowerTitle.includes("evento")) return "PartyPopper";
  if (lowerTitle.includes("aeroporto") || lowerTitle.includes("volo")) return "Plane";
  if (lowerTitle.includes("auto") || lowerTitle.includes("noleggio")) return "Car";
  if (lowerTitle.includes("treno") || lowerTitle.includes("stazione")) return "Train";
  if (lowerTitle.includes("territorio") || lowerTitle.includes("scopri il territorio")) return "Globe";
  if (lowerTitle.includes("servizi esterni")) return "Mountain";
  if (lowerTitle.includes("soccorso") || lowerTitle.includes("stradale")) return "Bike";
  
  // Controlla parole chiave nella mappatura
  for (const [keyword, iconName] of Object.entries(keywordToIconMap)) {
    if (lowerTitle.includes(keyword)) {
      return iconName;
    }
  }
  
  // Icona predefinita se nessuna corrispondenza trovata
  return "FileText";
};

// Colori pastello migliorati con migliore contrasto per il testo
export const pastelColors = [
  { bg: "bg-[#F2FCE2]", text: "text-emerald-700" },  // verde chiaro
  { bg: "bg-[#FEF7CD]", text: "text-amber-700" },    // giallo chiaro
  { bg: "bg-[#FFE5D3]", text: "text-orange-700" },   // arancione chiaro
  { bg: "bg-[#E5DEFF]", text: "text-indigo-700" },   // viola chiaro
  { bg: "bg-[#FFDEE2]", text: "text-rose-700" },     // rosa chiaro
  { bg: "bg-[#D8F3FF]", text: "text-blue-700" },     // azzurro chiaro
  { bg: "bg-[#D3E4FD]", text: "text-blue-700" },     // blu chiaro
  { bg: "bg-[#F1F0FB]", text: "text-slate-700" },    // grigio chiaro
];


export const useKeywordToIconMap = () => {
  const keywordToIconMap: Record<string, string> = {
    // Ristorante e cibo
    "ristorante": "Utensils",
    "ristoro": "Utensils",
    "cucina": "Utensils",
    "cibo": "Utensils",
    "cena": "Utensils",
    "pranzo": "Utensils",
    "colazione": "Coffee",
    "caffè": "Coffee",
    "bar": "Coffee",
    "bevande": "Coffee",
    "menu": "UtensilsCrossed",
    "cantina": "UtensilsCrossed",
    "vini": "UtensilsCrossed",
    
    // Attrazioni e cultura
    "museo": "Landmark",
    "mostra": "Landmark",
    "esposizione": "Landmark",
    "galleria": "Image",
    "immagini": "Image",
    "foto": "Camera",
    "monumento": "Landmark",
    "chiesa": "Landmark",
    "arte": "Landmark",
    
    // Alloggio
    "hotel": "Hotel",
    "alloggio": "Hotel",
    "camera": "Bed",
    "dormire": "Bed",
    "albergo": "Hotel",
    "soggiorno": "Hotel",
    "prenotazione": "Calendar",
    "receptionist": "Key",
    "chiave": "Key",
    
    // Trasporti
    "trasporto": "Bus",
    "bus": "Bus",
    "treno": "Train",
    "stazione": "Train",
    "navetta": "Bus",
    "taxi": "Car", 
    "noleggio": "Car",
    "auto": "Car",
    "aeroporto": "Plane",
    "volo": "Plane",
    "soccorso": "Car",
    "stradale": "Car",
    
    // Luoghi e viaggi
    "viaggio": "Globe",
    "escursione": "Mountain",
    "montagna": "Mountain",
    "mare": "Palmtree",
    "spiaggia": "Palmtree",
    "piscina": "Bike", 
    "città": "Building",
    "centro": "Building",
    "borgo": "Building",
    "paese": "Building",
    "territorio": "Globe",
    "scopri": "Globe",
    
    // Acquisti
    "shopping": "ShoppingBag",
    "acquisti": "ShoppingCart",
    "negozi": "ShoppingBag",
    "souvenir": "ShoppingBag",
    "boutique": "Shirt",
    
    // Eventi
    "eventi": "Calendar",
    "evento": "Calendar",
    "programma": "Calendar",
    "festa": "PartyPopper",
    "celebrazione": "PartyPopper",
    "concerto": "Music",
    "spettacolo": "PartyPopper",
    
    // Informazioni
    "news": "Newspaper",
    "notizie": "Newspaper",
    "informazioni": "Info", 
    "info": "Info",
    "orari": "Calendar",
    "regole": "Info",
    
    // Contatti
    "contatti": "Phone",
    "contatto": "Phone",
    "telefono": "Phone",
    "email": "MessageCircle",
    "messaggio": "MessageCircle",
    "chat": "MessageCircle",
    
    // Posizione
    "posizione": "MapPin",
    "mappa": "Map",
    "indirizzo": "MapPin",
    "dove": "MapPin",
    "come arrivare": "MapPin",
    "direzioni": "Map",
    
    // Attività
    "attività": "Bike",
    "sport": "Bike",
    "intrattenimento": "Music",
    "musica": "Music",
    "giochi": "Trophy",
    "tennis": "Trophy",
    "golf": "Trophy",
    
    // Cultura e tradizione
    "storia": "Book",
    "cultura": "Book",
    "tradizione": "Book",
    "locale": "Book",
    "guida": "Book",
    
    // Servizi
    "wifi": "Wifi",
    "internet": "Wifi",
    "connessione": "Wifi",
    "servizi": "Hotel",
    "servizio": "Hotel",
    "esterni": "Mountain",
    
    // Natura e animali
    "animali": "PawPrint",
    "pet": "PawPrint",
    "cane": "PawPrint",
    "gatto": "PawPrint",
    "natura": "Trees",
    "parco": "Trees",
    "giardino": "Trees",
    
    // Persone
    "persone": "Users",
    "ospiti": "Users",
    "clienti": "Users",
    "staff": "Users",
    "personale": "Users",
    
    // Benessere
    "benessere": "Heart",
    "spa": "Heart",
    "relax": "Heart",
    "massaggio": "Heart",
    "trattamento": "Heart",
    
    // Altro
    "welcome": "Home",
    "benvenuto": "Home",
    "accoglienza": "Home",
    "vacanza": "Palmtree",
    "duse": "Landmark"
  };
  
  return keywordToIconMap;
};

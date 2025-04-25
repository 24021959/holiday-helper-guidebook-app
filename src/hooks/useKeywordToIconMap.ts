import { useState, useEffect } from 'react';

export const useKeywordToIconMap = () => {
  const [keywordToIconMap] = useState<Record<string, string>>({
    // Transportation
    'auto': 'Car',
    'veicolo': 'Car',
    'parcheggio': 'Car',
    'taxi': 'Car',
    'noleggio': 'Car',
    'treno': 'Train',
    'stazione': 'Train',
    'aereo': 'Plane',
    'volo': 'Plane',
    'aeroporto': 'Plane',
    'bus': 'Bus',
    'pullman': 'Bus',
    'bici': 'Bike',
    'bicicletta': 'Bike',
    'trasporto': 'Bus',
    
    // Places
    'ristorante': 'Utensils',
    'mangiare': 'Utensils',
    'cibo': 'Utensils',
    'bar': 'Coffee',
    'caffè': 'Coffee',
    'hotel': 'Hotel',
    'albergo': 'Hotel',
    'alloggio': 'Hotel',
    'camera': 'Bed',
    'dormire': 'Bed',
    'spiaggia': 'Palmtree',
    'mare': 'Palmtree',
    'montagna': 'Mountain',
    'escursione': 'Mountain',
    'shopping': 'ShoppingBag',
    'negozio': 'ShoppingBag',
    'museo': 'Landmark',
    'monumento': 'Landmark',
    'teatro': 'Landmark',
    'chiesa': 'Building',
    'palazzo': 'Building',
    'parco': 'Trees',
    'giardino': 'Trees',
    'piazza': 'MapPin',
    
    // Services
    'informazioni': 'Info',
    'aiuto': 'Info',
    'telefono': 'Phone',
    'contatti': 'Phone',
    'emergenza': 'Ambulance',
    'medico': 'Ambulance',
    'ospedale': 'Ambulance',
    'farmacia': 'Cross',
    'wifi': 'Wifi',
    'internet': 'Wifi',
    
    // Activities
    'evento': 'Calendar',
    'festa': 'PartyPopper',
    'concerto': 'Music',
    'sport': 'Trophy',
    'attività': 'Trophy',
    'tour': 'Globe',
    'visita': 'Globe',
    'guida': 'Book',
    'storia': 'Book',
    'mappa': 'Map',
    'foto': 'Camera',
    
    // Others
    'bambini': 'Heart',
    'famiglia': 'Users',
    'animali': 'PawPrint',
    'pet': 'PawPrint',
    'souvenir': 'ShoppingCart',
    'regalo': 'ShoppingCart',
    'abbigliamento': 'Shirt',
    'vestiti': 'Shirt',
    'chiavi': 'Key',
    'accesso': 'Key'
  });

  return keywordToIconMap;
};

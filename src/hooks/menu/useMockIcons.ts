
import { IconData } from "./types";

export const useMockIcons = () => {
  const getMockIcons = (): IconData[] => {
    return [
      {
        id: "welcome",
        path: "/welcome",
        label: "Benvenuto",
        title: "Benvenuto",
        icon: "Home",
        parent_path: null,
        is_parent: false,
        translations: {
          it: "Benvenuto",
          en: "Welcome",
          fr: "Bienvenue",
          es: "Bienvenido",
          de: "Willkommen"
        }
      },
      {
        id: "wifi",
        path: "/wifi",
        label: "WiFi",
        title: "WiFi",
        icon: "Wifi",
        parent_path: null,
        is_parent: false,
        translations: {
          it: "WiFi",
          en: "WiFi",
          fr: "WiFi",
          es: "WiFi",
          de: "WiFi"
        }
      },
      {
        id: "where-to-eat",
        path: "/where-to-eat",
        label: "Dove Mangiare",
        title: "Dove Mangiare",
        icon: "Utensils",
        parent_path: null,
        is_parent: true,
        translations: {
          it: "Dove Mangiare",
          en: "Where to Eat",
          fr: "Où Manger",
          es: "Dónde Comer",
          de: "Wo Essen"
        }
      },
      {
        id: "taxi",
        path: "/taxi",
        label: "Taxi",
        title: "Taxi",
        icon: "Car",
        parent_path: null,
        is_parent: false,
        translations: {
          it: "Taxi",
          en: "Taxi",
          fr: "Taxi",
          es: "Taxi",
          de: "Taxi"
        }
      },
      {
        id: "roadside",
        path: "/roadside-assistance",
        label: "Soccorso Stradale",
        title: "Soccorso Stradale",
        icon: "Car",
        parent_path: null,
        is_parent: false,
        translations: {
          it: "Soccorso Stradale",
          en: "Roadside Assistance",
          fr: "Assistance Routière",
          es: "Asistencia en Carretera",
          de: "Pannenhilfe"
        }
      },
      {
        id: "restaurants",
        path: "/restaurants",
        label: "Ristoranti",
        title: "Ristoranti",
        icon: "UtensilsCrossed",
        parent_path: "/where-to-eat",
        is_parent: false,
        translations: {
          it: "Ristoranti",
          en: "Restaurants",
          fr: "Restaurants",
          es: "Restaurantes",
          de: "Restaurants"
        }
      },
      {
        id: "pizzerias",
        path: "/pizzerias",
        label: "Pizzerie",
        title: "Pizzerie",
        icon: "Utensils",
        parent_path: "/where-to-eat",
        is_parent: false,
        translations: {
          it: "Pizzerie",
          en: "Pizzerias",
          fr: "Pizzerias",
          es: "Pizzerías",
          de: "Pizzerien"
        }
      },
      {
        id: "traditional",
        path: "/traditional",
        label: "Trattorie Tipiche",
        title: "Trattorie Tipiche",
        icon: "Utensils",
        parent_path: "/where-to-eat",
        is_parent: false,
        translations: {
          it: "Trattorie Tipiche",
          en: "Traditional Trattorias",
          fr: "Trattorias Traditionnelles",
          es: "Tratorías Tradicionales",
          de: "Traditionelle Trattorien"
        }
      }
    ];
  };

  return {
    getMockIcons
  };
};

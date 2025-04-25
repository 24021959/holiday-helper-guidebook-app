import { IconData } from "./types";

export const useMockIcons = () => {
  const getMockIcons = (): IconData[] => {
    return [
      {
        id: "1",
        path: "/home",
        parent_path: null,
        label: "Home",
        icon: "Home",
        bg_color: "bg-blue-200",
        published: true,
        is_parent: false,
        translations: {
          en: "Home",
          fr: "Accueil",
          es: "Inicio",
          de: "Startseite"
        }
      },
      {
        id: "2",
        path: "/menu",
        parent_path: null,
        label: "Menu",
        icon: "Menu",
        bg_color: "bg-green-200",
        published: true,
        is_parent: true,
        translations: {
          en: "Menu",
          fr: "Menu",
          es: "Menú",
          de: "Speisekarte"
        }
      },
      {
        id: "3",
        path: "/admin",
        parent_path: null,
        label: "Admin",
        icon: "Settings",
        bg_color: "bg-red-200",
        published: true,
        is_parent: false,
        translations: {
          en: "Admin",
          fr: "Admin",
          es: "Admin",
          de: "Admin"
        }
      },
      {
        id: "4",
        path: "/submenu/example",
        parent_path: "/menu",
        label: "Example Submenu",
        icon: "FileText",
        bg_color: "bg-yellow-200",
        published: true,
        is_parent: false,
        translations: {
          en: "Example Submenu",
          fr: "Sous-menu d'exemple",
          es: "Submenú de ejemplo",
          de: "Beispiel Untermenü"
        }
      },
      {
        id: "5",
        path: "/contact",
        parent_path: null,
        label: "Contact",
        icon: "Mail",
        bg_color: "bg-purple-200",
        published: true,
        is_parent: false,
        translations: {
          en: "Contact",
          fr: "Contact",
          es: "Contacto",
          de: "Kontakt"
        }
      }
    ];
  };

  return { getMockIcons };
};

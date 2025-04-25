
import { IconData } from "./types";

export const useMockIcons = () => {
  const getMockIcons = (): IconData[] => {
    return [
      {
        id: "mock-1",
        path: "/storia",
        label: "La nostra storia",
        title: "La nostra storia",
        icon: "Book",
        parent_path: null,
        is_parent: false
      },
      {
        id: "mock-2",
        path: "/menu/ristorante",
        label: "Ristorante",
        title: "Ristorante",
        icon: "Utensils",
        parent_path: null,
        is_parent: true
      },
      {
        id: "mock-3",
        path: "/menu/servizi",
        label: "Servizi",
        title: "Servizi",
        icon: "Heart",
        parent_path: null,
        is_parent: true
      }
    ];
  };

  return {
    getMockIcons
  };
};


import { Badge } from "@/components/ui/badge";

interface PageTypeBadgeProps {
  isParent: boolean;
  isSubmenu: boolean;
}

export const PageTypeBadge = ({ isParent, isSubmenu }: PageTypeBadgeProps) => {
  if (isParent) {
    return (
      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
        Master
      </Badge>
    );
  }

  if (isSubmenu) {
    return (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        Sottopagina
      </Badge>
    );
  }

  return (
    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
      Normale
    </Badge>
  );
};

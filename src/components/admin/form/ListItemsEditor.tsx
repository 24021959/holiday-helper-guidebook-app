
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ListItem {
  name: string;
  description?: string;
  phoneNumber?: string;
  mapsUrl?: string;
}

interface ListItemsEditorProps {
  listItems: ListItem[];
  setListItems: (items: ListItem[]) => void;
}

export const ListItemsEditor: React.FC<ListItemsEditorProps> = ({
  listItems,
  setListItems
}) => {
  const addItem = () => {
    setListItems([...listItems, { name: "" }]);
  };

  const updateItem = (index: number, field: keyof ListItem, value: string) => {
    const newItems = [...listItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setListItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...listItems];
    newItems.splice(index, 1);
    setListItems(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Elementi della lista</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          Aggiungi elemento
        </Button>
      </div>

      {listItems.map((item, index) => (
        <div key={index} className="border p-4 rounded-md space-y-3">
          <div>
            <Label htmlFor={`item-name-${index}`}>Nome</Label>
            <Input
              id={`item-name-${index}`}
              value={item.name}
              onChange={(e) => updateItem(index, "name", e.target.value)}
              placeholder="Nome elemento"
            />
          </div>
          
          <div>
            <Label htmlFor={`item-desc-${index}`}>Descrizione</Label>
            <Textarea
              id={`item-desc-${index}`}
              value={item.description || ""}
              onChange={(e) => updateItem(index, "description", e.target.value)}
              placeholder="Descrizione elemento"
              className="resize-none"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="destructive" 
              size="sm" 
              onClick={() => removeItem(index)}
            >
              Rimuovi
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

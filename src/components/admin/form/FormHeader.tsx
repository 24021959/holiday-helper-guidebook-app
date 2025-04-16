
import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { z } from "zod";
import { pageFormSchema } from '../schemas/pageFormSchema';

type FormData = z.infer<typeof pageFormSchema>;

interface FormHeaderProps {
  control: Control<FormData>;
}

export const FormHeader = ({ control }: FormHeaderProps) => {
  // If control isn't defined, return a fallback component
  if (!control) {
    console.error("FormHeader: control is null or undefined");
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Titolo</label>
        <Input placeholder="Titolo della pagina" disabled />
        <p className="text-red-500 text-sm mt-1">Errore: form non inizializzato correttamente</p>
      </div>
    );
  }
  
  // Wrap the form field in a try-catch block to handle potential context errors
  try {
    return (
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Titolo</FormLabel>
            <FormControl>
              <Input placeholder="Titolo della pagina" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  } catch (error) {
    console.error("Error rendering FormHeader:", error);
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Titolo</label>
        <Input placeholder="Titolo della pagina" disabled />
        <p className="text-red-500 text-sm mt-1">Errore nel form: {String(error)}</p>
      </div>
    );
  }
};

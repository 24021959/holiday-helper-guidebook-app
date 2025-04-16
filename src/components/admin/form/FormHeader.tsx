
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

export const FormHeader: React.FC<FormHeaderProps> = ({ control }) => {
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
};


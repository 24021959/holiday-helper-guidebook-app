
import * as z from "zod";

export const pageFormSchema = z.object({
  title: z.string().min(2, {
    message: "Il titolo deve essere di almeno 2 caratteri.",
  }),
  content: z.string().optional(),
  icon: z.string().optional(),
  pageType: z.enum(["normal", "submenu", "parent"]).default("normal"),
  parentPath: z.string().optional(),
});

export type PageFormData = z.infer<typeof pageFormSchema>;

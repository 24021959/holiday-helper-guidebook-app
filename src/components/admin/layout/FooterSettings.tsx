
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { LayoutSettingsForm } from "@/hooks/useLayoutSettings";

interface FooterSettingsProps {
  form: UseFormReturn<LayoutSettingsForm>;
}

export const FooterSettings = ({ form }: FooterSettingsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="footerText"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Testo Footer</FormLabel>
            <div className="space-y-4">
              <FormControl>
                <Input placeholder="Testo del footer" {...field} />
              </FormControl>
              <FormField
                control={form.control}
                name="footerTextAlignment"
                render={({ field: alignmentField }) => (
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant={alignmentField.value === 'left' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => alignmentField.onChange('left')}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={alignmentField.value === 'center' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => alignmentField.onChange('center')}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={alignmentField.value === 'right' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => alignmentField.onChange('right')}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              />
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="footerColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Colore Sfondo Footer</FormLabel>
            <FormControl>
              <Input 
                type="color" 
                className="h-10 w-full p-1 cursor-pointer" 
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="showSocialLinks"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <FormLabel>Mostra Social Links</FormLabel>
            </div>
          </FormItem>
        )}
      />

      {form.watch("showSocialLinks") && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="facebookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Facebook className="w-4 h-4" />
                  Facebook URL
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://facebook.com/..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagramUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram URL
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://instagram.com/..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="twitterUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter URL
                </FormLabel>
                <FormControl>
                  <Input placeholder="https://twitter.com/..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
};

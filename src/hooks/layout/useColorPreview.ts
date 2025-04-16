
import { useState, useEffect } from "react";
import { UseFormWatch } from "react-hook-form";
import { LayoutSettingsForm } from "../useLayoutSettings";

export const useColorPreview = (watch: UseFormWatch<LayoutSettingsForm>) => {
  const [previewHeaderColor, setPreviewHeaderColor] = useState("#FFFFFF");
  const [previewFooterColor, setPreviewFooterColor] = useState("#FFFFFF");
  const [previewEstablishmentNameColor, setPreviewEstablishmentNameColor] = useState("#000000");
  const [previewFooterTextColor, setPreviewFooterTextColor] = useState("#555555");

  useEffect(() => {
    setPreviewHeaderColor(watch('headerColor'));
    setPreviewFooterColor(watch('footerColor'));
    setPreviewEstablishmentNameColor(watch('establishmentNameColor'));
    setPreviewFooterTextColor(watch('footerTextColor'));
  }, [
    watch('headerColor'),
    watch('footerColor'),
    watch('establishmentNameColor'),
    watch('footerTextColor')
  ]);

  return {
    previewHeaderColor,
    previewFooterColor,
    previewEstablishmentNameColor,
    previewFooterTextColor
  };
};

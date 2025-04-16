
import { useState, useEffect } from "react";
import { UseFormWatch } from "react-hook-form";
import { LayoutSettingsForm } from "../useLayoutSettings";

export const useColorPreview = (watch: UseFormWatch<LayoutSettingsForm>) => {
  const [previewHeaderColor, setPreviewHeaderColor] = useState("#FFFFFF");
  const [previewFooterColor, setPreviewFooterColor] = useState("#FFFFFF");
  const [previewEstablishmentNameColor, setPreviewEstablishmentNameColor] = useState("#000000");
  const [previewFooterTextColor, setPreviewFooterTextColor] = useState("#555555");

  // Watch for all color changes with explicit dependency listing
  useEffect(() => {
    const headerColor = watch('headerColor');
    setPreviewHeaderColor(headerColor);
    console.log("Header color updated to:", headerColor);
  }, [watch, watch('headerColor')]);

  useEffect(() => {
    const footerColor = watch('footerColor');
    setPreviewFooterColor(footerColor);
    console.log("Footer color updated to:", footerColor);
  }, [watch, watch('footerColor')]);

  useEffect(() => {
    const establishmentNameColor = watch('establishmentNameColor');
    setPreviewEstablishmentNameColor(establishmentNameColor);
    console.log("Establishment name color updated to:", establishmentNameColor);
  }, [watch, watch('establishmentNameColor')]);

  useEffect(() => {
    const footerTextColor = watch('footerTextColor');
    setPreviewFooterTextColor(footerTextColor);
    console.log("Footer text color updated to:", footerTextColor);
  }, [watch, watch('footerTextColor')]);

  return {
    previewHeaderColor,
    previewFooterColor,
    previewEstablishmentNameColor,
    previewFooterTextColor
  };
};

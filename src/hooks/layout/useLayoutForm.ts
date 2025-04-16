
import { useForm } from "react-hook-form";

export interface LayoutSettingsForm {
  logoUrl: string;
  footerText: string;
  showSocialLinks: boolean;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  themeColor: string;
  headerColor: string;
  footerColor: string;
  footerTextColor: string;
  footerTextAlignment: "left" | "center" | "right";
  establishmentName: string;
  establishmentNameAlignment: "left" | "center" | "right";
  establishmentNameColor: string;
  logoPosition: "left" | "center" | "right";
  logoSize: "small" | "medium" | "large";
}

export const useLayoutForm = () => {
  return useForm<LayoutSettingsForm>({
    defaultValues: {
      logoUrl: '',
      establishmentName: '',
      logoPosition: 'left',
      logoSize: 'medium',
      themeColor: '#FFFFFF',
      headerColor: '#FFFFFF',
      footerColor: '#FFFFFF',
      footerTextColor: '#555555',
      establishmentNameColor: '#000000',
      footerText: '',
      showSocialLinks: false,
      facebookUrl: '',
      instagramUrl: '',
      twitterUrl: '',
      footerTextAlignment: 'left',
      establishmentNameAlignment: 'left'
    }
  });
};


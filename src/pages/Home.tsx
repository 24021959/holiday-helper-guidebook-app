
import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import LoadingView from "@/components/LoadingView";
import { useNavigate } from 'react-router-dom';
import { useHomePageSaver } from '@/hooks/useHomePageSaver';
import HeroImage from '@/components/home/HeroImage';
import ContentSection from '@/components/home/ContentSection';
import ErrorDisplay from '@/components/home/ErrorDisplay';

const Home: React.FC = () => {
  const { headerSettings, loading, error, refreshHeaderSettings } = useHeaderSettings();
  const [heroImage] = useState('/lovable-uploads/6d1eebb5-61dd-4e37-99c7-4c67721ca126.png');
  const navigate = useNavigate();
  const { isSaving, saveHomePageToDatabase } = useHomePageSaver();
  
  useEffect(() => {
    saveHomePageToDatabase();
  }, []);
  
  const handleGoToMenu = () => {
    navigate('/menu');
  };

  if (loading || isSaving) {
    return <LoadingView message="Caricamento..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={refreshHeaderSettings} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        backgroundColor={headerSettings.headerColor || "bg-white"}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        showAdminButton={true}
      />
      
      <HeroImage imageUrl={heroImage} altText="La nostra struttura" />
      
      <ContentSection onExploreMenu={handleGoToMenu} />
      
      <Footer />
    </div>
  );
};

export default Home;

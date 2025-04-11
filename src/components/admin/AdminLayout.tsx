
import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useHeaderSettings } from "@/hooks/useHeaderSettings";
import { useAdmin } from "@/context/AdminContext";
import ErrorView from "@/components/ErrorView";

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { headerSettings, loading: headerLoading } = useHeaderSettings();
  const { isLoading, error, fetchPages } = useAdmin();

  if (headerLoading || isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-100">
        <svg className="animate-spin h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-emerald-700">Caricamento in corso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorView
        message={error}
        onRefresh={fetchPages}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        backgroundColor={headerSettings.headerColor || "bg-white"}
        logoUrl={headerSettings.logoUrl || undefined}
        establishmentName={headerSettings.establishmentName || undefined}
        logoPosition={headerSettings.logoPosition as "left" | "center" | "right" || "left"}
        logoSize={headerSettings.logoSize as "small" | "medium" | "large" || "medium"}
        showAdminButton={false}
      />
      
      <main className="container mx-auto flex flex-col md:flex-row flex-grow p-4">
        {children}
      </main>

      <Footer />
    </div>
  );
};

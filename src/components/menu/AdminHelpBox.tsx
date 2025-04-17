
import React from "react";
import TranslatedText from "@/components/TranslatedText";

const AdminHelpBox: React.FC = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md text-left">
      <h4 className="font-medium text-amber-800 mb-2">
        <TranslatedText text="Come aggiungere pagine:" />
      </h4>
      <ul className="list-disc pl-5 text-amber-700 space-y-1">
        <li>
          <TranslatedText text="Vai all'area amministrativa (/admin)" />
        </li>
        <li>
          <TranslatedText text="Usa la funzione 'Crea Nuova Pagina'" />
        </li>
        <li>
          <TranslatedText text="Per creare una sottopagina, seleziona il tipo 'Sottopagina'" />
        </li>
        <li>
          <TranslatedText text="Nel dropdown genitore, seleziona la pagina genitore corretta" />
        </li>
        <li>
          <TranslatedText text="Assicurati che il campo 'Pubblicato' sia ATTIVO" />
        </li>
      </ul>
    </div>
  );
};

export default AdminHelpBox;

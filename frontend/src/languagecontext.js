import React, { createContext, useState, useContext } from "react";
import translations from "./translations";
import { getCookie, deleteCookie , setCookie} from './components/Cookies';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getCookie("Language"));

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

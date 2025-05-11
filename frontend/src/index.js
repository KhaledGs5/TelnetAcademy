import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProviderWrapper } from './themecontext.js';
import { LanguageProvider } from './languagecontext.js';
import { UserProvider } from './UserContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <UserProvider>
    <LanguageProvider>
      <ThemeProviderWrapper>
        <App />
      </ThemeProviderWrapper>
    </LanguageProvider>
  </UserProvider>
)
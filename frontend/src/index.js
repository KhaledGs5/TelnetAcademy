import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProviderWrapper } from './themecontext.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProviderWrapper>
    <App />
  </ThemeProviderWrapper>
)
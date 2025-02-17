import { createContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ThemeContext = createContext();

export const ThemeProviderWrapper = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    const toggleTheme = () => setDarkMode(!darkMode);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    background: {
                        default: darkMode ? '#444444' : '#ffffff', 
                        paper: darkMode ? '#555555' : '#ffffff',
                        navbar: darkMode ? '#666666' : '#ffffff',
                    },
                    text: {
                        primary: darkMode ? '#ffffff' : '#000000',
                        secondary: darkMode ? '#dddddd' : '#888B93',
                    },
                },
            }),
        [darkMode]
    );

    return (
        <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

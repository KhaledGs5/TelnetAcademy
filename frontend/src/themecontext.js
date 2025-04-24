import { createContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getCookie , setCookie} from './components/Cookies';

export const ThemeContext = createContext();

export const ThemeProviderWrapper = ({ children }) => {
    const [darkMode, setDarkMode] = useState(getCookie("DarkMode") || false);

    const toggleTheme = () => {
        setCookie("DarkMode",!darkMode,5)
        setDarkMode(getCookie("DarkMode"));
    };
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    background: {
                        default: darkMode ? '#444444' : '#ffffff', 
                        paper: darkMode ? '#555555' : '#f9f9f9',
                        navbar: darkMode ? '#666666' : '#ffffff',
                        calendar: darkMode ? '#666666' : '#ffffff',
                        dcalendar: darkMode ? '#222222' : '#dddddd',
                        noBigDiff: darkMode ? '#666666' : '#f6f6f6',
                    },
                    text: {
                        primary: darkMode ? '#eeeeee' : '#111111',
                        secondary: darkMode ? '#dddddd' : '#888B93',
                    },
                    button: {
                        primary: darkMode ? '#76C5E1':'#2CA8D5',
                        secondary: darkMode? '#dddddd' : '#888B93',
                        tertiary: darkMode? '#777777' : '#eeeeee',
                    }
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

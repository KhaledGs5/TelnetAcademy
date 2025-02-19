import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../themecontext';
import { getCookie, deleteCookie , setCookie} from './Cookies';
import { Box, Link, Typography, Menu, MenuItem} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Logo from "../assets/Telnet.png";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import EditIcon from '@mui/icons-material/Edit';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';
import { useLanguage } from "../languagecontext";

const Navbar = () => {

    const { t, setLanguage } = useLanguage();
    const [choosedLanguage, setChoosedLanguage] = useState(getCookie("Language"));
    const { darkMode, toggleTheme } = useContext(ThemeContext);

    const [signedIn, setSignedIn] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    const toggleLanguage = () => {
        const newLanguage = choosedLanguage === "en" ? "fr" : "en";
        setChoosedLanguage(newLanguage);
        setLanguage(newLanguage);
        setCookie("Language", newLanguage, 5);
    };

    const menuOpen = Boolean(anchorEl);

    const location = useLocation();

    const linkStyle = (loc) => ({
        color: location.pathname === loc ? 'white' : 'text.secondary',
        backgroundColor: location.pathname === loc ? '#2CA8D5' : 'background.navbar',
        textDecoration: 'none',
        padding: '5px',
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        '&:hover': {
          backgroundColor: '#76C5E1',
          color: 'white',
        },
    });

    const buttonStyle = {
        color: 'text.secondary',
        backgroundColor: '#CFD2D4',
        padding: '5px 10px',
        borderRadius: '10px',
        textDecoration: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: signedIn ? '100%' : '35%',
        height: '65%',
        fontWeight: 'bold',
    };

    const menuStyle = (loc) => ({
        zIndex: 1,
        width: '200px',
        height: '50px',
        backgroundColor : location.pathname === loc ? 'grey' : 'background.primary'
    });

    return (
        <Box
            sx={{
                backgroundColor: "background.navbar",
                position: 'relative',
                display: "flex",
                boxSizing: "border-box",
                height: "70px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)"
            }}
        >
            <Box 
               sx={{
                position: 'relative',
                left: '10px',
                width: '150px',
                height: 'cover',
                backgroundImage: `url(${Logo})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
               }}
               onClick={}          
            >   
            </Box>
            {signedIn ? <Box
                sx={{
                    position: 'absolute',
                    left: '40%',
                    width: '45%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    color: 'black',
                    gap: '20px',
                }}
            >
                <Link href="/dashboard" sx={linkStyle('/dashboard')}>{t("dashboard")}</Link>
                <Link href="/managesessions" sx={linkStyle('/managesessions')}>{t("sessions")}</Link>
                <Link href="/manageusers" sx={linkStyle('/manageusers')}>{t("users")}</Link>
                <Link href="/calendar" sx={linkStyle('/calendar')}>{t("calendar")}</Link>
                <Link href="/contact" sx={linkStyle('/contact')}>{t("contact")}</Link>
                <Link href="/about" sx={linkStyle('/about')}>{t("about")}</Link>
            </Box> : null}
            {!signedIn ? 
            <Box
                sx={{
                    position: 'absolute',
                    right: '10px',
                    width: '20%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '30px',
                }}
            >
                <Link href="/" sx={buttonStyle('/')}>Home</Link>
                <Link href="/signin" sx={buttonStyle('/signin')}>Sign In</Link>
            </Box>
            : 
            <Box                
                sx={{
                    position: 'absolute',
                    right: '20px',
                    width: '12%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'end',
                }}
            >
                <Link href="/account" sx={{...buttonStyle,
                    color: menuOpen ? "white" : location.pathname === "/account" ? "white" : "text.secondary",
                    backgroundColor: menuOpen? "#76C5E1" : location.pathname === "/account" ? "#2CA8D5" : "background.paper",
                }} 
                onMouseEnter={handleOpenMenu}
                >
                    <AccountCircleIcon
                        sx={{
                            marginRight: '5px',
                        }}
                    ></AccountCircleIcon>
                    <Typography>
                        Khaled Gassara
                    </Typography>
                </Link>
                <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleCloseMenu}
                MenuListProps={{
                    onMouseLeave: handleCloseMenu, 
                }}
                >
                    <MenuItem >{t("Account")}</MenuItem>
                    <MenuItem onClick={() => window.location.href = "/manageusers"} sx={menuStyle("/manageusers")}><ManageAccountsIcon sx={{marginRight:'5px'}}/>Manage</MenuItem>
                    <MenuItem sx={menuStyle("")} onClick={toggleTheme}>
                        {darkMode ? <Brightness7Icon sx={{marginRight:'5px'}}/> : <Brightness4Icon sx={{marginRight:'5px'}}/>}
                        {darkMode? "Light Mode" : "Dark Mode"}
                    </MenuItem>
                    <MenuItem sx={menuStyle("")} onClick={toggleLanguage}>
                        <LanguageIcon sx={{marginRight:'5px'}}/>
                        {choosedLanguage === "en" ? "French" : "English"}
                    </MenuItem>
                    <MenuItem onClick={() => window.location.href = "/account"} sx={menuStyle("/account")}><EditIcon sx={{marginRight:'5px'}}/>Profile</MenuItem>
                    <MenuItem onClick={() => window.location.href = "/logout"} sx={menuStyle("/logout")}><LogoutIcon sx={{marginRight:'5px'}}/>Logout</MenuItem>
                </Menu>
            </Box>}
        </Box>
    );
};

export default Navbar;
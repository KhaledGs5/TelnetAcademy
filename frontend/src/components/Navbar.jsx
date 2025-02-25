import React, { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../themecontext';
import { getCookie , setCookie} from './Cookies';
import { Box, Link, Typography, Menu, MenuItem} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
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

    const [signedIn, setSignedIn] = useState(getCookie("SignedIn"));

    const [anchorEl, setAnchorEl] = useState(null);
    const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    const toggleLanguage = () => {
        const newLanguage = choosedLanguage === "en" ? "fr" : "en";
        setChoosedLanguage(newLanguage);
        setLanguage(newLanguage);
        setCookie("Language", newLanguage, 5);
    };

    const ProfileImage = getCookie("ProfileImage");

    const navigate = useNavigate();

    const goToDashBoard = () =>{
        navigate("/dashboard");
    };

    const handleLogout = () => {
        setSignedIn(false);
        setCookie("SignedIn",false,5);
        window.location.href = "/";
    };

    const menuOpen = Boolean(anchorEl);

    const location = useLocation();

    //Styles................................

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
        color: 'white',
        backgroundColor: '#2CA8D5',
        padding: '5px 10px',
        borderRadius: '10px',
        textDecoration: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: signedIn ? '100%' : '25%',
        height: '65%',
        fontWeight: 'bold',
    };

    const menuStyle = (loc) => ({
        zIndex: 1,
        width: '250px',
        height: '50px',
        backgroundColor : location.pathname === loc ? 'grey' : 'background.primary'
    });

    const profileImageStyle = {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        marginRight: '10px',
    };

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
                width: '200px',
                height: 'cover',
                backgroundImage: `url(${Logo})`,
                backgroundSize: "80%",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                cursor: "pointer",
               }}
               onClick={goToDashBoard}          
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
                    width: '35%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '30px',
                }}
            >
                <Link href="/" 
                sx={{...buttonStyle,                    
                    color: location.pathname === "/" ? "white" : "text.secondary",
                    backgroundColor: location.pathname === "/" ? "#2CA8D5" : "background.paper",
                }}>{t("home")}</Link>
                <Link href="/signin"  
                sx={{...buttonStyle,                    
                    color: location.pathname === "/signin" ? "white" : "text.secondary",
                    backgroundColor: location.pathname === "/signin" ? "#2CA8D5" : "background.paper",
                }}>{t("signin")}</Link>
                 <Box                
                    sx={{
                        position: 'absolute',
                        right: '20px',
                        height: '100%',
                        width: '25%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'end',
                    }}
                >
                    <Link href="" sx={{...buttonStyle,
                        color: menuOpen ? "white" : "text.secondary",
                        backgroundColor: menuOpen? "#76C5E1" : "background.paper",
                        width:'100%'
                    }} 
                    onMouseEnter={handleOpenMenu}
                    >
                        <SettingsIcon
                            sx={{
                                marginRight: '5px',
                            }}
                        ></SettingsIcon>
                        <Typography>
                            {t("settings")}
                        </Typography>
                    </Link>
                    <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleCloseMenu}
                    MenuListProps={{
                        onMouseLeave: handleCloseMenu, 
                    }}
                    >
                        <MenuItem sx={menuStyle("")}>
                            {t("settings")}
                        </MenuItem>
                        <MenuItem sx={menuStyle("")} onClick={toggleTheme}>
                            {darkMode ? <Brightness7Icon sx={{marginRight:'5px'}}/> : <Brightness4Icon sx={{marginRight:'5px'}}/>}
                            {darkMode? t("light_mode") : t("dark_mode")}
                        </MenuItem>
                        <MenuItem sx={menuStyle("")} onClick={toggleLanguage}>
                            <LanguageIcon sx={{marginRight:'5px'}}/>
                            {choosedLanguage === "en" ? t("french") : t("english")}
                        </MenuItem>
                    </Menu>
                </Box>
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
                    {ProfileImage ? <img src={ProfileImage} alt="Img" style={profileImageStyle}/>:
                    <AccountCircleIcon  sx={{marginRight:5}} />
                    }
                    <Typography>
                        Khaled Gassara
                    </Typography>
                </Link>
                <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleCloseMenu}
                MenuListProps={{
                    onMouseLeave: handleCloseMenu, 
                }}
                >
                    <MenuItem sx={{ ...menuStyle(""), height: "60px", display: "flex", flexDirection: "column", alignItems: "start" }}>
                        <Typography variant="body1">{t("account")}</Typography>
                        <Typography variant="caption" color="text.secondary">Khaled Gassara</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => window.location.href = "/manageusers"} sx={menuStyle("/manageusers")}><ManageAccountsIcon sx={{marginRight:'5px'}}/>{t("manage")}</MenuItem>
                    <MenuItem sx={menuStyle("")} onClick={toggleTheme}>
                        {darkMode ? <Brightness7Icon sx={{marginRight:'5px'}}/> : <Brightness4Icon sx={{marginRight:'5px'}}/>}
                        {darkMode? t("light_mode") : t("dark_mode")}
                    </MenuItem>
                    <MenuItem sx={menuStyle("")} onClick={toggleLanguage}>
                        <LanguageIcon sx={{marginRight:'5px'}}/>
                        {choosedLanguage === "en" ? t("french") : t("english")}
                    </MenuItem>
                    <MenuItem onClick={() => window.location.href = "/account"} sx={menuStyle("/account")}><EditIcon sx={{marginRight:'5px'}}/>{t("profile")}</MenuItem>
                    <MenuItem onClick={handleLogout} sx={menuStyle("/logout")}><LogoutIcon sx={{marginRight:'5px'}}/>{t("logout")}</MenuItem>
                </Menu>
            </Box>}
        </Box>
    );
};

export default Navbar;
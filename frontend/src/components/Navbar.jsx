import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '../themecontext';
import { getCookie , setCookie} from './Cookies';
import { Box, Link, Typography, Menu, MenuItem, Dialog, Button, DialogTitle, Badge, Snackbar, Alert,
    OutlinedInput,InputLabel,FormControl
} from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import Logo from "../assets/Telnet.png";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageIcon from '@mui/icons-material/Language';
import axios from 'axios';
import io from "socket.io-client";
import { useLanguage } from "../languagecontext";

const Navbar = () => {

    const { t, setLanguage } = useLanguage();
    const [choosedLanguage, setChoosedLanguage] = useState(getCookie("Language") || "en");
    const { darkMode, toggleTheme } = useContext(ThemeContext);
    const [signedIn, setSignedIn] = useState(getCookie("SignedIn"));
    // Verify Everything

    const [showsVerificationAlert, setShowsVerifificationAlert] = useState(false);
    const [verifyAlertMessage, setVerifyAlertMessage] = useState("");
    const [verifyAlert, setVerifyAlert] = useState("error");
    const handleVerificationAlertClose = () => {
        setShowsVerifificationAlert(false);
    };

    // Menu .............

    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const handleMenuAnchorEl = (event) => setMenuAnchorEl(event.currentTarget);
    const handleOpenMenu = () => setMenuOpen(true);
    const handleCloseMenu = () => {
        setMenuOpen(false);
        setMenuAnchorEl(null);
    };

    //SubMenu .................
    const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null);
    const handleOpenSubmenu = (e) => {
        setSubmenuAnchorEl(e.currentTarget);
    };
    const handleCloseSubmenu = () => {
        setSubmenuAnchorEl(null);
    };

    const UserRoles = ["trainer", "trainee"];
    const [selectedRole, setSelectedRole] = useState(getCookie("Role") || "trainer");
    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setCookie("Role", role , 1000);
        setSubmenuAnchorEl(null);
        window.location.href = role === "trainee" ? '/traineesession' : '/trainersession';
    };
    const chosenRole = getCookie("Role") || "trainer";
    console.log(chosenRole);

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

    const user = getCookie("User") ?? null;


    const location = useLocation();

    // Call For Trainers
    const socket = io("http://localhost:5000"); 
    const [numberOfCalls, setNumberOfCalls] = useState(0);
    const [callMessage, setCallMessage] = useState("");
    const [numberOfRequests, setNumberOfRequests] = useState(0);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/notif/${user._id}`);
            if(user.role !== "manager")setNumberOfCalls(response.data.count);
            setNumberOfRequests(response.data.count);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    const [trainersEmails, setTrainersEmails] = useState("");

    const fetchTrainersEmails = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/users");
            const trainerEmails = response.data
            .filter(user => user.role !== "manager")
            .map(user => user.email)
            .join(",");
        setTrainersEmails(trainerEmails);
        } catch (error) {
            console.error("Error fetching trainer emails", error);
        }
    }
    useEffect(() => {
        fetchTrainersEmails();
    }, []);

    useEffect(() => {
        if (!user) return; 
    
        if (!socket.connected) {
            socket.connect();
        }
    
        fetchNotifications();
        socket.emit("joinRoom", user._id);
    
        socket.on("newNotification", () => {
            fetchNotifications();
        });
    
        socket.on("readNotifications", () => {
            setNumberOfCalls(0);
        });
    
        return () => {
            socket.off("newNotification");
            socket.off("readNotifications");
        };
    }, []);
    
    const handleOpenNotifications = async () => {
        try {
          await axios.put(`http://localhost:5000/api/users/notif/${user._id}`);
          setNumberOfCalls(0); 
        } catch (error) {
          console.error("Error marking notifications as read", error);
        }
    };
    

    const [verifyCallForTrainers, setVerifyCallForTrainers] = useState(false);

    const openCallForTrainers = () => {
        setVerifyCallForTrainers(true);
    };

    const closeCallForTrainers = () => {
        setVerifyCallForTrainers(false);
    };

    const sendCallForTrainers = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/callnotification", {
                message: callMessage,
            });
    
            if (response.data.success) {
                setVerifyAlert("success");
                setVerifyAlertMessage("Call sent successfully!");
                setShowsVerifificationAlert(true);
                closeCallForTrainers();
                
                
                await axios.post("http://localhost:5000/call-for-trainers", {
                    toEmail : trainersEmails,
                    message: callMessage,
                });
    
            }
        } catch (error) {
            console.error("Error sending call for trainers:", error);
        }
    };
    

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

    const roleStyle = (role) => ({
        color: "text.primary",
        backgroundColor: role === chosenRole? "#2CA8D5" : "background.primary",
        textDecoration: 'none',
        padding: '5px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: "100px",
        '&:hover': {
            backgroundColor: "#76C5E1",
        },
    });

    return (
        <Box
            sx={{
                width: '100%',
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
            {signedIn && user ? <Box
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
                <Link href={(user.role === "trainer" || user.role === "trainee_trainer" && chosenRole === "trainer") ? '/trainersession' : (user.role === "trainee" || user.role === "trainee_trainer" && chosenRole === "trainee") ? '/traineesession' : user.role === 'manager' ? '/managesessions' : ''} 
                sx={linkStyle((user.role === "trainer" || user.role === "trainee_trainer"&& chosenRole === "trainer") ? '/trainersession' : (user.role === "trainee" || user.role === "trainee_trainer" && chosenRole === "trainee") ? '/traineesession' : user.role === 'manager' ? '/managesessions' : '')}>{t("sessions")}</Link>
                {user.role === "manager" ? <Link href="/managetrainings" sx={linkStyle('/managetrainings')}>{t("trainings")}</Link>:null}
                {!(user.role) ?  <Link href="/manageusers" sx={linkStyle('/manageusers')}>{t("users")}</Link> : (user.role === "manager")? 
                <Badge badgeContent={numberOfRequests} color="primary"
                sx={{ 
                    "& .MuiBadge-badge": { 
                    fontSize: "10px", 
                    height: "16px", 
                    minWidth: "16px", 
                    padding: "2px",
                    position: "absolute",
                    right: "10px",
                    } 
                }}
                > <Link href="/requests" sx={linkStyle('/requests')}>{t("requests")}</Link>
                </Badge> : (user.role === "trainer" || user.role === "trainee_trainer" && chosenRole === "trainer")?
                             <Link href="/trainertraining" sx={linkStyle('/trainertraining')}>{t("trainings")}</Link> :
                             <Link href="/enrolledtrainee" sx={linkStyle('/enrolledtrainee')}>{t("enrolled")}</Link>  }
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
                    onMouseEnter={(event) => {
                        handleOpenMenu();
                        handleMenuAnchorEl(event);
                    }}
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
                    <Menu anchorEl={menuAnchorEl} open={menuOpen} onClose={handleCloseMenu}
                    MenuListProps={{
                        onMouseLeave: handleCloseMenu, 
                    }}
                    disableScrollLock={true}
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
            : user ?
            <Box                
                sx={{
                    position: 'absolute',
                    right: '20px',
                    width: 'auto',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'end',
                }}
            >
                {user.role === "trainee_trainer" ?
                <Typography
                    sx={{
                    width: '200px',
                    height: 'cover',
                    display: "flex",
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'text.secondary',
                    cursor: "pointer",
                    }}>
                    {t(selectedRole)}
                </Typography> : null}
                <Link href="/account" sx={{...buttonStyle,
                    color: menuOpen ? "white" : location.pathname === "/account" ? "white" : "text.secondary",
                    backgroundColor: menuOpen? "#76C5E1" : location.pathname === "/account" ? "#2CA8D5" : "background.paper",
                    width:'auto'
                }} 
                onMouseEnter={(event) => {
                    handleMenuAnchorEl(event);
                    handleOpenMenu();
                }}              
                >
                    <Badge badgeContent={numberOfCalls} color="primary"
                      sx={{ 
                        "& .MuiBadge-badge": { 
                          fontSize: "10px", 
                          height: "16px", 
                          minWidth: "16px", 
                          padding: "2px",
                          position: "absolute",
                          right: "10px",
                        } 
                      }}
                    > 
                        {ProfileImage ? <img src={ProfileImage} alt="Img" style={profileImageStyle}/>:
                        <AccountCircleIcon  sx={{marginRight:"10px"}} />
                        }
                    </Badge>
                    <Typography>
                        {user.name}
                    </Typography>
                </Link>
                <Menu anchorEl={menuAnchorEl} open={menuOpen} onClose={handleCloseMenu}
                disableScrollLock={true}
                >
                    <MenuItem sx={{ ...menuStyle(""), height: "60px", display: "flex", flexDirection: "column", alignItems: "start" }} onMouseEnter={handleCloseSubmenu}>
                        <Typography variant="body1">{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.role ? t(user.role) : t("admin")}</Typography>
                    </MenuItem>
                    {!(user.role) ? <MenuItem onClick={() => window.location.href = "/manageusers"} sx={menuStyle("/manageusers")}><ManageAccountsIcon sx={{marginRight:'10px'}}/>{t("manage")}</MenuItem> : null}
                    {(user.role === "trainee_trainer") ? 
                    <MenuItem 
                        onClick={(e) => {
                            handleOpenSubmenu(e)
                        }}
                     sx={menuStyle("")}>
                    <ChangeCircleIcon sx={{marginRight:'5px'}}/>{t("change_space")}
                    </MenuItem> : null}
                    <Menu
                        anchorEl={submenuAnchorEl}
                        open={Boolean(submenuAnchorEl)}
                        onClose={handleCloseSubmenu}
                        disableScrollLock={true}
                        MenuListProps={{
                            'aria-labelledby': 'basic-button',
                            }}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                    >
                        <MenuItem >
                            {t("role")} 
                        </MenuItem>
                        {UserRoles.map((role) => (
                            <MenuItem key={role} value={role} sx={roleStyle(role)} onClick={() => handleRoleChange(role)}>
                                {t(role)} 
                            </MenuItem>
                        ))}
                    </Menu>
                    {(user.role !== "manager") ? 
                    <MenuItem onClick={() => {
                        handleOpenNotifications();
                        window.location.href = "/trainercall";}}
                    sx={menuStyle("/trainercall")}>
                    <Badge badgeContent={numberOfCalls} color="primary"
                      sx={{ 
                        "& .MuiBadge-badge": { 
                          fontSize: "10px", 
                          height: "16px", 
                          minWidth: "16px", 
                          padding: "2px",
                          position: "absolute",
                          right: "10px",
                        } 
                      }}
                    > <NotificationsIcon sx={{marginRight:'10px'}}/>
                    </Badge>
                    {t("training_calls")}
                    </MenuItem>
                    : null}
                    {user.role === "trainee" ? <MenuItem onClick={() => window.location.href = "/becametrainer"} sx={menuStyle("/becametrainer")}><PersonIcon sx={{marginRight:'10px'}}/>{t("became_trainer")}</MenuItem> : null}
                    {user.role === 'manager' ? <MenuItem onClick={() => openCallForTrainers()} sx={menuStyle("/callfortrainers")}><GroupAddIcon sx={{marginRight:'10px'}}/>{t("call_for_trainers")}</MenuItem> : null}
                    <MenuItem sx={menuStyle("")} onClick={toggleTheme}  onMouseEnter={handleCloseSubmenu}>
                        {darkMode ? <Brightness7Icon sx={{marginRight:'10px'}}/> : <Brightness4Icon sx={{marginRight:'10px'}}/>}
                        {darkMode? t("light_mode") : t("dark_mode")}
                    </MenuItem>
                    <MenuItem sx={menuStyle("")} onClick={toggleLanguage}  onMouseEnter={handleCloseSubmenu}>
                        <LanguageIcon sx={{marginRight:'10px'}}/>
                        {choosedLanguage === "en" ? t("french") : t("english")}
                    </MenuItem>
                    <MenuItem onClick={() => window.location.href = "/account"} sx={menuStyle("/account")} onMouseEnter={handleCloseSubmenu}><EditIcon sx={{marginRight:'10px'}}/>{t("profile")}</MenuItem>
                    <MenuItem onClick={handleLogout} sx={menuStyle("/logout")} onMouseEnter={handleCloseSubmenu}><LogoutIcon sx={{marginRight:'10px'}}/>{t("logout")}</MenuItem>
                </Menu>
            </Box> : null}
            <Dialog
                open={verifyCallForTrainers}
                disableScrollLock={true}
                onClose={closeCallForTrainers}
                PaperProps={{
                    sx: {
                        width: "auto",  
                        height: "auto", 
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "10px",
                        padding: '20px',
                    }
                }}
            >
                <DialogTitle>{t("confirm_call_for_trainers")}?</DialogTitle>
                <Box 
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '20px',
                    }}
                >
                    <FormControl variant="outlined" sx={{ 
                            width: '100%',
                        }}
                    >
                        <InputLabel required>{t("message")}</InputLabel>
                        <OutlinedInput
                            multiline
                            value={callMessage}
                            onChange={(e) => setCallMessage(e.target.value)}
                            label="Message ................"
                        />
                    </FormControl>
                    <Box 
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '20px',
                        }}
                    >
                        <Button sx={{
                            color: 'white',
                            backgroundColor: '#EA9696',
                            padding: '5px 10px',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            width: '100px',
                            height: '40px',
                            marginTop: '10px',
                            textTransform: "none",
                            '&:hover': {
                                backgroundColor: '#EAB8B8',
                                color: 'white',
                            },
                        }} 
                        onClick={closeCallForTrainers}>
                            {t("no")}
                        </Button>
                        <Button sx={{
                            color: 'white',
                            backgroundColor: '#2CA8D5',
                            padding: '5px 10px',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            width: '100px',
                            height: '40px',
                            marginTop: '10px',
                            textTransform: "none",
                            '&:hover': {
                                backgroundColor: '#76C5E1',
                                color: 'white',
                            },
                        }} 
                        onClick={() => sendCallForTrainers()}>
                            {t("yes")}
                        </Button>
                    </Box>
                </Box>
            </Dialog>
            <Snackbar open={showsVerificationAlert} autoHideDuration={3000} onClose={handleVerificationAlertClose}>
                <Alert onClose={handleVerificationAlertClose} severity={verifyAlert} variant="filled">
                    {t(verifyAlertMessage)}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Navbar;
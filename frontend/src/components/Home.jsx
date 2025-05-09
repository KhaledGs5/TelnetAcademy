import React ,{useState,} from "react";
import { Box, Link, Typography , OutlinedInput, InputLabel , FormControl, Button,Checkbox,IconButton,InputAdornment,
    Alert,Snackbar,DialogTitle,Dialog
} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Class from "../assets/Class.jpg";
import { useLanguage } from "../languagecontext";
import { setCookie } from "./Cookies";
import axios from "axios";

const Home = () => {

    const { t } = useLanguage();

    // Sign In
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showsSignInAlert, setShowsSignInAlert] = useState(false);
    const [signInAlert, setSignInAlert] = useState('error');
    const [signInAlertMessage, setSignInAlertMessage] = useState('email_not_found');
    const [rememberMe, setRememberMe] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSignIn = async () => {
        try {
          const response = await axios.post("http://localhost:5000/api/users/sign-in", { 
            email, 
            password, 
          });
          if (response.status == 200) {
            if(rememberMe) {
                setCookie("Token",response.data.token, 5);
                setCookie("User",response.data.user, 5);
                setCookie("SignedIn",true, 5);
            }else{
                setCookie("Token",response.data.token);
                setCookie("User",response.data.user);
                setCookie("SignedIn",true);
            }
            if(response.data.user.role === "admin"){
                window.location.href = "/manageusers"
            }else{
                window.location.href = "/dashboard"
            };
            };
        } catch (error) {
          if (error.response) {
            const errorMessage = error.response.data.message;
            setShowsSignInAlert(true);
            setSignInAlertMessage(errorMessage);
            setSignInAlert("error");
          }
        }
    };
      
    const handleSignInAlertClose = () => {
        setShowsSignInAlert(false);
    };

    // Verify
    const [verifyEmail, setVerifyEmail] = useState('');
    const [showVerifyEmailAlert, setShowVerifyEmailAlert] = useState(false);
    const [verifyEmailAlert, setVerifyEmailAlert] = useState('');
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);

    const handleVerifyEmailChange = (e) => {
        setVerifyEmail(e.target.value);
    };

    const handleVerifyDialogClose = () => {
        setVerifyDialogOpen(false);
    };

    const showForgotPasswordMessage = () => {
        setVerifyDialogOpen(true);
    };

    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    function generateRandomPassword() {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const digits = '0123456789';
        const specials = '@$!%*?&';
        
        const required = [
          upper[Math.floor(Math.random() * upper.length)],
          lower[Math.floor(Math.random() * lower.length)],
          digits[Math.floor(Math.random() * digits.length)],
          specials[Math.floor(Math.random() * specials.length)]
        ];

        const allChars = upper + lower + digits + specials;
        while (required.length < 8) {
          required.push(allChars[Math.floor(Math.random() * allChars.length)]);
        }

        for (let i = required.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [required[i], required[j]] = [required[j], required[i]];
        }
      
        return required.join('');
    }

  
    const sendResetPasswordEmail = async () => {
        const newPassword = generateRandomPassword();
        const resetPasswordMessage = `Your New Password is: ${newPassword}`;
        const emailData = {
          toEmail: verifyEmail,
          message: resetPasswordMessage,
        };
        setShowVerifyEmailAlert(true);
        setVerifyEmailAlert("success");
        handleVerifyDialogClose();
        try {
          const response = await axios.put(`http://localhost:5000/api/users/${verifyEmail}/password`, {
            password: newPassword,
          });
      
          if (response.status === 200) {
            await axios.post("http://localhost:5000/password-reset", emailData);
          }
        } catch (error) {
          console.error("Error resetting password:", error);
          setVerifyEmailAlert("error");
        }
    };
      

    const wrongEmail = () => {
        setShowVerifyEmailAlert(true);
        setVerifyEmailAlert("error");
    };

    const handleAlertClose = (event, reason) => {
        if (reason === "clickaway") {
          return;
        }
        setShowVerifyEmailAlert(false);
    };

    // Password Visibility
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };


    // Styles ........................................................

    const inputStyle  = {
        width: "80%",
    };

    const buttonStyle = {
        color: 'white',
        backgroundColor: '#2CA8D5',
        padding: '5px 10px',
        borderRadius: '10px',
        textDecoration: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '40%',
        height: '45%',
        fontWeight: 'bold',
        textTransform: "none",
        '&:hover': {
          backgroundColor: '#76C5E1',
          color: 'white',
        },
    }

    const linkStyle = {
        color: '#888B93',
        textDecoration: 'none',
        padding: '5px',
        borderRadius: '5px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    };

    return (
        <Box>
            <Box
                sx={{
                    width: '35%',
                    height: 'auto',
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                    borderRadius: '10px',
                    position: "absolute",
                    left: '5%',
                    top: '20%',
                }}
                >
                <Typography
                    sx={{
                        fontSize: 34,
                        fontWeight: "bold",
                        textAlign: "center",
                        letterSpacing: 0.2,
                        lineHeight: 1,
                        userSelect: "none",
                        cursor: "pointer",
                        color: "#2CA8D5",
                        marginTop: "30px",
                    }}
                >
                    {t("telnet_academy")}
                </Typography>
                <Typography
                    sx={{
                        fontSize: 34,
                        fontWeight: "bold",
                        textAlign: "center",
                        letterSpacing: 0.2,
                        lineHeight: 2,
                        userSelect: "none",
                        cursor: "pointer",
                        color: "#2CA8D5",
                    }}
                >
                    {t("signin")}
                </Typography>
                <Box
                    sx={{
                        width: '100%',
                        height: '400px',
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                        justifyContent: "start",
                        gap: "20px",
                        marginTop: "30px",
                    }}
                >  
                    <Box
                        sx={{
                            width: "100%",
                            display : "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap:"15px",
                        }}
                    >
                        <FormControl variant="outlined" sx={inputStyle}>
                            <InputLabel required>{t("email")}</InputLabel>
                            <OutlinedInput
                                value={email}
                                onChange={handleEmailChange}
                                label="Email...."
                            />
                        </FormControl>
                        <FormControl variant="outlined" sx={inputStyle}>
                            <InputLabel required>{t("password")}</InputLabel>
                            <OutlinedInput
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={handlePasswordChange}
                                label="Password........."
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton onClick={toggleShowPassword} size="small">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Box>
                    <Box sx={{
                            color: "Black",
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '7px',
                            width: "70%",
                            paddingLeft:"60px",
                        }}>
                        <Checkbox value={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>
                        <Typography
                            sx={{
                                fontSize: 15,
                                textAlign: "center",
                                color: "text.primary",
                            }}
                        >
                            {t("remember_me")}
                        </Typography>
                    </Box>
                    <Box 
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '25%',
                            gap: '7px',
                        }}
                    >
                        <Button sx={{...buttonStyle, width: "30%"}} onClick={handleSignIn}>
                            {t("submit")}
                        </Button>
                        <Link sx={linkStyle} onClick={showForgotPasswordMessage}>
                            {t("forgot_password")}
                        </Link>
                        <Snackbar open={showsSignInAlert} autoHideDuration={3000} onClose={handleSignInAlertClose}>
                            <Alert onClose={handleSignInAlertClose} severity={signInAlert} variant="filled">
                                {t(signInAlertMessage)}
                            </Alert>
                        </Snackbar>
                        <Dialog
                            open={verifyDialogOpen}
                            onClose={handleVerifyDialogClose}
                            PaperProps={{
                                sx: {
                                    width: "400px",  
                                    height: "300px", 
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "start",
                                    alignItems: "center",
                                    borderRadius: "5px",
                                }
                            }}
                        >
                            <DialogTitle>{t("reset_password")}</DialogTitle>
                            <Box
                                sx={{
                                    width:"100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap:"20px",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: 20,
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        letterSpacing: 0.2,
                                        lineHeight: 1,
                                        userSelect: "none",
                                        cursor: "pointer",
                                        color: "#2CA8D5",
                                        width: '80%',
                                    }}
                                >{t("enter_your_email")} {t("to_reset_password")}</Typography>
                                <FormControl variant="outlined" sx={inputStyle}
                                >
                                    <InputLabel required>{t("email")}</InputLabel>
                                    <OutlinedInput
                                        value={verifyEmail}
                                        onChange={handleVerifyEmailChange}
                                        label="Email"
                                    />
                                </FormControl>
                            </Box>
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
                                position: 'absolute',
                                top: '70%',
                                '&:hover': {
                                backgroundColor: '#76C5E1',
                                color: 'white',
                                },
                            }} 
                            onClick={() => validateEmail(verifyEmail) ? sendResetPasswordEmail() : wrongEmail()}>
                                {t("submit")}
                            </Button>
                        </Dialog>
                        <Snackbar open={showVerifyEmailAlert} autoHideDuration={3000} onClose={handleAlertClose}>
                            <Alert onClose={handleAlertClose} severity={verifyEmailAlert} variant="filled">
                                {verifyEmailAlert === "error" ? t("email_not_found") : t("mail_sent_including_your_password")}
                            </Alert>
                        </Snackbar>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    zIndex: -10,
                    width: '50%',
                    height: '100vh',
                    backgroundImage: `url(${Class})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "0 0 0 150px",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                }}
            >
            </Box>
        </Box>
      );
};

export default Home;
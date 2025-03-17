import React, {useState} from "react";
import { Box, InputAdornment,IconButton, Checkbox, Typography, Button, Link ,OutlinedInput, FormControl, InputLabel, Alert, Snackbar} from "@mui/material";
import { useLanguage } from "../../languagecontext";
import { setCookie } from "../Cookies";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import axios from 'axios';

const Verify = () => {

    const { t } = useLanguage();

    // Sign in
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
          const response = await axios.post("http://localhost:5000/api/admin/sign-in", { 
            email, 
            password, 
          });
          if (response.status == 200) {
            if(rememberMe) {
                setCookie("User",response.data, 5);
                setCookie("SignedIn",true, 5);
            }else{
                setCookie("User",response.data);
                setCookie("SignedIn",true);
            }
            window.location.href = "/manageusers";
          };
        } catch (error) {
          if (error.response) {
            const errorMessage = error.response.data.message;
              setSignInAlert("error");
              setSignInAlertMessage(errorMessage);
              setShowsSignInAlert(true);
          }
        }
    };

    const handleSignInAlertClose = () => {
        setShowsSignInAlert(false);
    };

    // Forgot Password

    const [verifyEmail, setVerifyEmail] = useState('');
    const [showVerifyEmailAlert, setShowVerifyEmailAlert] = useState(false);
    const [verifyEmailAlert, setVerifyEmailAlert] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleVerifyEmailChange = (e) => {
        setVerifyEmail(e.target.value);
    };
  
    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleAlertClose = (event, reason) => {
        if (reason === "clickaway") {
          return;
        }
        setShowVerifyEmailAlert(false);
    };

    const showForgotPasswordMessage = () => {
        setDialogOpen(true);
    };

    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const resetpasswordmessage = "Your New Password is : Random";
  
    const sendResetPasswordEmail = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/users/verify-email", { email: verifyEmail });

            if(response.status === 200){
                correctEmail();
                const emailData = {
                    toEmail: verifyEmail,
                    message: resetpasswordmessage,
                };
        
                await axios.post("http://localhost:5000/password-reset", emailData, {
                    headers: { "Content-Type": "application/json" },
                });
            };

        } catch (error) {
            console.error("Error:", error);
            wrongEmail();
        }
    };
    
    const correctEmail = () => {
        setShowVerifyEmailAlert(true);
        setVerifyEmailAlert("success");
        handleDialogClose();
    };

    const wrongEmail = () => {
        setShowVerifyEmailAlert(true);
        setVerifyEmailAlert("error");
    };

    //Password visibility

    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    // Styles ......................................

    const inputStyle = (loc) => ({
        position: "absolute",
        top: loc === 'email' ? "20%" : "40%",
        width: "80%",
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
                    width: '30%',
                    height: '400px',
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "start",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                    borderRadius: '10px',
                    position: "absolute",
                    left: '35%',
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
                        position: "absolute",
                        top: '5%',
                    }}
                >
                    {t("verification")}
                </Typography>
                <FormControl variant="outlined" sx={inputStyle("email")}>
                    <InputLabel required>{t("email")}</InputLabel>
                    <OutlinedInput
                        value={email}
                        onChange={handleEmailChange}
                        label="Email...."
                    />
                </FormControl>

                <FormControl variant="outlined" sx={inputStyle("password")}>
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
                <Box sx={{
                        position: "absolute",
                        left: '15%',
                        top: '60%',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '7px',
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
                        position: "absolute",
                        top: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '20%',
                        gap: '7px',
                    }}
                >
                    <Button sx={buttonStyle} onClick={handleSignIn}>
                        {t("submit")}
                    </Button>
                    <Link sx={linkStyle} onClick={showForgotPasswordMessage} >
                        {t("forgot_password")}
                    </Link>
                    <Snackbar open={showsSignInAlert} autoHideDuration={3000} onClose={handleSignInAlertClose}>
                        <Alert onClose={handleSignInAlertClose} severity={signInAlert} variant="filled">
                            {t(signInAlertMessage)}
                        </Alert>
                    </Snackbar>
                    <Dialog
                        open={dialogOpen}
                        onClose={handleDialogClose}
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
                                position: "absolute",
                                top: '25%',
                                width: '80%',
                            }}
                        >{t("enter_your_email")} {t("to_reset_password")}</Typography>
                        <FormControl variant="outlined" sx={{...inputStyle("email"), 
                            position: "absolute",
                            top: '42%',
                        }}
                        >
                            <InputLabel required>{t("email")}</InputLabel>
                            <OutlinedInput
                                value={verifyEmail}
                                onChange={handleVerifyEmailChange}
                                label="Email"
                            />
                        </FormControl>
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
    );
};

export default Verify;
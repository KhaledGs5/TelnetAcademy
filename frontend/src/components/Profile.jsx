import React, {useState, useEffect} from "react";
import { Box, TextField , Typography, Button ,IconButton, Tooltip,FormControl,InputLabel,OutlinedInput,InputAdornment, Link, Alert,Snackbar,DialogTitle,Dialog} from "@mui/material";
import { useLanguage } from "../languagecontext";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from '@mui/icons-material/Save';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { setCookie, getCookie } from "./Cookies";
import axios from "axios";

const Profile = () => {
    const { t } = useLanguage();


    /// Image ...............
    const [image, setImage] = useState(getCookie("ProfileImage") || "profile");


    const handleImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const imageURL = URL.createObjectURL(file);
        setImage(imageURL);
        setCookie("ProfileImage", imageURL, 20);
      }
    };

    //Update Profile
    const userid = getCookie("User") ?? null;
    const [user,setUser] = useState([]);
    const getUser = async () => {
        const response = await axios.get(`http://localhost:5000/api/users/${userid}`);
        setUser(response.data);
    };
    useEffect(() => {
        if(userid)getUser();
    }, []);
    const [updateAlert, setUpdateAlert] = useState("");
    const [showUpdateAlert, setShowUpdateAlert] = useState(false);
    const [verifyUpdateAlert, setVerifyUpdateAlert] = useState("error");

    const [nameChanged, setNameChanged] = useState(false);
    const [passwordChanged, setPasswordChanged] = useState(false);
    
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    
    const [newName, setNewName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [oldPasswordVerified, setOldPasswordVerified] = useState(false);
    
    const handleVerifyOldPassword = (e) => {
        const isValid = e.target.value === user.password || user.password === ":";
        setOldPasswordVerified(isValid);
    };
    
    const handleVerifyNewPassword = (e) => {
        setConfirmNewPassword(e.target.value);
    };
    
    const handleNameChange = (e) => {
        setNewName(e.target.value);
        setNameChanged(e.target.value !== "");
    };
    
    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
    };
    
    useEffect(() => {
        setPasswordChanged(oldPasswordVerified && newPassword !== "" && confirmNewPassword === newPassword);
    }, [oldPasswordVerified, newPassword, confirmNewPassword]);

    const handleUpdateAlertClose = () => {
        setShowUpdateAlert(false);
    };

    const handleUserUpdate = () => {
        const updatedUser = {};
        if(newName !== ""){updatedUser.name = newName};
        if(newPassword!== ""){updatedUser.password = newPassword};

        axios.put(`http://localhost:5000/api/users/${user._id}`, updatedUser)
        .then((response) => {
            if(response.status == 200){
                setCookie("User", response.data, 5);
                setNameChanged(false);
                setPasswordChanged(false);
                setUpdateAlert("user_updated_successfully");
                setShowUpdateAlert(true);
                setVerifyUpdateAlert("success")
            }
        })
        .catch((error) => {
            if (error.response) {
                const errorMessage = error.response.data.error;
                setUpdateAlert(errorMessage);
                setShowUpdateAlert(true);
                setVerifyUpdateAlert("error")
            }
        });
    }
    
    // Forgot password
    
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
        try {
            const response = await axios.post("http://localhost:5000/api/users/verify-email", { email: verifyEmail });

            if(response.status === 200){
                correctEmail();
                const emailData = {
                    toEmail: verifyEmail,
                    message: resetPasswordMessage,
                };
                const response = await axios.put(`http://localhost:5000/api/users/${verifyEmail}/password`, {
                    password: newPassword,
                  });
                if(response.status === 200){
                await axios.post("http://localhost:5000/password-reset", emailData);}
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


    // Styles ...............................

    const buttonStyle = {
        color: 'white',
        backgroundColor: '#2CA8D5',
        padding: '5px 10px',
        borderRadius: '10px',
        textDecoration: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '75%',
        height: '35%',
        fontWeight: 'bold',
        textAlign: "center",
        textTransform: "none",
    };

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

    const inputStyle = (loc) => ({
        position: "absolute",
        top: loc === 'email' ? "20%" : "40%",
        width: "80%",
    });

    return (
        <Box
            sx={{
                width: '60%',
                height: '70vh',
                boxSizing: 'border-box',
                backgroundColor: "background.paper",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "start",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                borderRadius: '10px',
                position: "absolute",
                left: '20%',
                top: '20%',
                gap: "25px",
                padding: "20px",
            }}
        >
            <Box
                sx={{
                    width: '90%',
                    height: '30%',
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "start",
                    justifyContent: "start",
                    borderRadius: '10px',
                    paddingLeft: '20px',
                }}
            >
                <Box    
                    sx={{
                        width: '150px',
                        height: '150px',
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                        borderRadius: '50%',
                        cursor: "pointer",
                        position: "relative"
                    }}
                >
                {!image ? (
                    <Button variant="contained" component="label" sx={buttonStyle}>
                        {t("add_photo")}
                        <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </Button>
                ) : (
                    <>
                        <img 
                            src={image} 
                            alt="Preview" 
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "50%",
                            }}
                        />
                        <IconButton
                            component="label"
                            sx={{
                                position: "absolute",
                                bottom: 5,
                                right: 5,
                                backgroundColor: "rgba(0,0,0,0.6)",
                                color: "white",
                                "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" }
                            }}
                        >
                            <EditIcon />
                            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </IconButton>
                    </>
                )}
                </Box>
                <Box 
                    sx={{
                        width: '300px',
                        height: '150px',
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                        justifyContent: "center",
                        paddingLeft: '20px',
                    }}
                >
                    <Typography variant="body1">{user.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.role ? t(user.role) : t("admin")}</Typography>
                </Box>
            </Box>
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
                }}
            >
                {t("edit_account")}
            </Typography>
            <Box
                sx={{
                    width: '60%',
                    height: '60px',
                    display: 'flex',
                    justifyContent: "start",
                    alignItems: 'center',
                    gap: '20px',
                }}
            >
                <Typography variant="body1">{user.name}</Typography>
                <TextField label={t("new_name")} variant="outlined" required onChange={handleNameChange}/>
                <Tooltip title={t("save")} arrow> 
                    <IconButton sx={{color:"#76C5E1"}} disabled={!nameChanged} onClick={() => handleUserUpdate()}>
                        <SaveIcon/>
                    </IconButton>
                </Tooltip>
            </Box>
            <Box
                sx={{
                    width: '90%',
                    height: '60px',
                    display: 'flex',
                    justifyContent: "start",
                    alignItems: 'center',
                    gap: '20px',
                }}
            >
                <FormControl variant="outlined">
                    <InputLabel required>{t("old_password")}</InputLabel>
                    <OutlinedInput
                        type={showOldPassword ? 'text' : 'password'}
                        onChange={handleVerifyOldPassword}
                        label="Old Password ................."
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowOldPassword(!showOldPassword)} size="small">
                                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>
                <FormControl variant="outlined">
                    <InputLabel required>{t("new_password")}</InputLabel>
                    <OutlinedInput
                        type={showNewPassword ? 'text' : 'password'}
                        onChange={handlePasswordChange}
                        label="New Password ..................."
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowNewPassword(!showNewPassword)} size="small">
                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>
                <FormControl variant="outlined">
                    <InputLabel required>{t("confirm_new_password")}</InputLabel>
                    <OutlinedInput
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        onChange={handleVerifyNewPassword}
                        label="Confirm New Password ......................"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} size="small">
                                    {showConfirmNewPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>
                <Tooltip title={t("save")} arrow> 
                    <IconButton sx={{color:"#76C5E1"}} disabled={!passwordChanged} onClick={() => handleUserUpdate()}>
                        <SaveIcon/>
                    </IconButton>
                </Tooltip>
            </Box>
            {updateAlert === "wrong_password_format"? 
            <Typography
                sx={{
                    color: "red",
                    fontSize: 12,
                    textAlign: "center",
                    width:'90%',
                }}
            >
                    {t("Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)")}
            </Typography>: null}
            <Link sx={linkStyle} onClick={showForgotPasswordMessage}>
                {t("forgot_password")}
            </Link>
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
                    textTransform: "none",
                    '&:hover': {
                        backgroundColor: '#76C5E1',
                        color: 'white',
                    },
                }} 
                onClick={() => validateEmail(verifyEmail) ? sendResetPasswordEmail() : wrongEmail()}>
                    {t("submit")}
                </Button>
            </Dialog>
            <Snackbar open={showUpdateAlert} autoHideDuration={3000} onClose={handleUpdateAlertClose}>
                <Alert onClose={handleUpdateAlertClose} severity={verifyUpdateAlert} variant="filled">
                    {t(updateAlert)}
                </Alert>
            </Snackbar>
            <Snackbar open={showVerifyEmailAlert} autoHideDuration={3000} onClose={handleAlertClose}>
                <Alert onClose={handleAlertClose} severity={verifyEmailAlert} variant="filled">
                    {verifyEmailAlert === "error" ? t("email_not_found") : t("mail_sent_including_your_password")}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Profile;
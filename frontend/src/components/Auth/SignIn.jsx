import React, {useState} from "react";
import { Box, TextField, Radio, Checkbox, Typography, Button, Link } from "@mui/material";
import Class from "../../assets/Class.jpg";


const SignIn = () => {

    const [selectedRole, setSelectedRole] = useState('Trainer');

    const inputStyle = (loc) => ({
        position: "absolute",
        top: loc === 'email' ? "20%" : "35%",
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
    };


    const handleChange = (event) => {
        setSelectedRole(event.target.value);
    };

    return (
        <Box>
            <Box
                sx={{
                    width: '30%',
                    height: '500px',
                    backgroundColor: "white",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "start",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                    borderRadius: '10px',
                    position: "absolute",
                    left: '60%',
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
                    Sign In
                </Typography>
                <TextField label="Email" variant="outlined" required sx={inputStyle("email")}/>
                <TextField label="Password" variant="outlined" required sx={inputStyle("password")}/>
                <Typography   
                    sx={{
                        fontSize: 15,
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "Black",
                        position: "absolute",
                        left: '10%',
                        top: '50%',
                    }}>
                    Select Your Role
                </Typography>
                <Box
                    sx={{
                        position: "absolute",
                        left: '15%',
                        top: '55%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <Typography   
                        sx={{
                            fontSize: 15,
                            textAlign: "center",
                            color: "Black",
                        }}>
                        Trainer
                    </Typography>
                    <Radio
                        checked={selectedRole === 'Trainer'}
                        onChange={handleChange}
                        value="Trainer"
                    />
                    <Typography   
                        sx={{
                            fontSize: 15,
                            textAlign: "center",
                            color: "Black",
                        }}>
                        Trainee
                    </Typography>
                    <Radio
                        checked={selectedRole === 'Trainee'}
                        onChange={handleChange}
                        value="Trainee"
                    />
                </Box>
                <Box sx={{
                        position: "absolute",
                        left: '15%',
                        top: '65%',
                        color: "Black",
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '7px',
                    }}>
                    <Checkbox />
                    <Typography
                        sx={{
                            fontSize: 15,
                            textAlign: "center",
                            color: "Black",
                        }}
                    >
                        Remember Me
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
                    <Button sx={buttonStyle}>
                        Submit
                    </Button>
                    <Link href="/" sx={linkStyle}>
                        Forgot Your Password ?
                    </Link>
                </Box>
            </Box>
            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    zIndex: -10,
                    width: '50%',
                    height: '100vh',
                    backgroundImage: `url(${Class})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "0 0 150px 0",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                }}
            >
            </Box>
        </Box>
    );
};

export default SignIn;
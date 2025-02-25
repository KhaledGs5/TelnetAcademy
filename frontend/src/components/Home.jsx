import React from "react";
import { Box, Link, Typography } from "@mui/material";
import Class from "../assets/Class.jpg";
import { useLanguage } from "../languagecontext";

const Home = () => {

    const { t } = useLanguage();

    const buttonStyle = {
        color: 'white',
        backgroundColor: '#2CA8D5',
        padding: '5px 10px',
        borderRadius: '10px',
        textDecoration: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '25%',
        height: '100%',
        fontWeight: 'bold',
        '&:hover': {
          backgroundColor: '#76C5E1',
          color: 'white',
        },
    };

    return (
        <Box>
            <Box
                sx={{
                    width: '35%',
                    height: '500px',
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "start",
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
                        position: "absolute",
                        top: '5%',
                    }}
                >
                    {t("telnet_academy")}
                </Typography>
                <Typography   
                    sx={{
                        fontSize: 20,
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "text.primary",
                        position: "absolute",
                        left: '6%',
                        top: '40%',
                    }}>
                    {t("choose_your_position")}
                </Typography>
                <Box
                    sx={{
                        userSelect: "none",
                        cursor: "pointer",
                        color: "Black",
                        position: "absolute",
                        left: '8%',
                        top: '55%',
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        height: '9%',
                        gap: '20px'
                    }}
                    >
                    <Link href='/verify' sx={buttonStyle}>
                        {t("manager")}
                    </Link>
                    <Link href='/verify' sx={buttonStyle}>
                        {t("admin")}
                    </Link>
                    <Link href='/signin' sx={buttonStyle}>
                        {t("user")}
                    </Link>
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
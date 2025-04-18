import React, { useState, useEffect } from "react";
import { Box, Typography, Button} from "@mui/material";
import { useLanguage } from "../languagecontext";


const Navbar = () => {

    const { t } = useLanguage();  

    const [view, setView] = useState("home");


    // Styles .............

    const buttonStyle = (v) => ({
      color: 'text.primary',
      backgroundColor: v === view ? 'button.primary' :'button.tertiary',
      borderRadius: '10px',
      textDecoration: 'none',
      textAlign: 'start',
      fontWeight: 'bold',
      fontSize: '16px',
      lineHeight: 1.2,
      display: 'flex',
      justifyContent: 'start',
      alignItems: 'center',
      width: '100%',
      height: '50px',
      fontWeight: 'bold',
      textTransform: "none",
      padding: '10px 20px',
      '&:hover': {
        backgroundColor: '#76C5E1',
      }
    });

    return (
        <Box
          sx={{
            width:"100%",
            display:"flex",
            flexDirection: "row",
            justifyContent:"start",
            alignItems:"center",
            padding:"10px",
          }}
        >
          <Box
            sx={{
              width:"20%",
              height:"100vh",
              display:"flex",
              flexDirection: "column",
              justifyContent:"start",
              alignItems:"center",
              padding:"20px",
              borderRight:"1px solid #ccc",
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
                }}
            >
                {t("dashboard")}
            </Typography>
            <Box
              sx={{
                height:"auto",
                width:"100%",
                display:"flex",
                flexDirection:"column",
                justifyContent:"start",
                alignItems:"start",
                marginTop:"20px",
                padding:"10px",
                gap: "15px",
              }}
            >
              <Button
                sx={buttonStyle("home")}
                onClick={() => setView("home")}
              >
                {t("home")}
              </Button>
              <Button
                sx={buttonStyle("trainings")}
                onClick={() => setView("trainings")}
              >
                {t("trainings")}
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              width:"80%",
              height:"100vh",
              display:"flex",
              flexDirection: "row",
              gap: "20px",
              justifyContent:"center",
              alignItems:"center",
              padding:"20px",
            }}
          >

          </Box>
        </Box>
      );
};

export default Navbar;
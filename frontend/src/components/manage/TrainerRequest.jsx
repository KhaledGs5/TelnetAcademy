import React, { useState, useEffect } from "react";
import { getCookie , setCookie} from '../Cookies';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Link, Typography, Menu, MenuItem, Dialog, Button, DialogTitle, Badge, TableCell,TableRow,TableHead,TableContainer,Paper,TextField
    ,Checkbox,FormControlLabel,TableBody,Table
} from "@mui/material";
import axios from 'axios';
import io from "socket.io-client";
import { useLanguage } from "../../languagecontext";


const TrainerRequest = () => {

    const { t } = useLanguage();

    const location = useLocation();

    // Fetch All Forms

    const [forms, setForms] = useState([]);

    const fetchForms = () => {
       axios.get("http://localhost:5000/api/form")
        .then((response) => {
            console.log(response.data);
            setForms(response.data);
        })
        .catch((error) => {});
    };

    useEffect(() => {
        fetchForms();
    }, []);

    console.log(forms);

    // Styles .........

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


    return (
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
            <Box
                sx={{
                    width: '40%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    marginTop: '20px',
                }}  
            >
                <Link
                href="/trainerrequest"
                sx={linkStyle("/trainerrequest")}>
                    {t("trainer_requests")}
                </Link>
                <Link
                href="/traineerequest"
                sx={linkStyle("/traineerequest")}>
                    {t("trainee_requests")}
                </Link>
            </Box>
            <Box       
                sx={{
                    width: '96%',
                    height: 'auto',
                    boxSizing: 'border-box',
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "start",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
                    borderRadius: '10px',
                    padding: '30px',
                    gap: "10px",
                }}
            >
                {forms.map((form) => (
                    <Box
                        key={form._id}
                        sx={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '20px',
                        }}
                    >
                        Here
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default TrainerRequest;
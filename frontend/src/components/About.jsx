import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useLanguage } from "../languagecontext";

const AboutPage = () => {
    const { t } = useLanguage();

  const handleDownload = () => {
    const fileUrl = '/user-guide.pdf';
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', 'TelnetAcademy_User_Guide.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        width: '220px',
        height: '50px',
        fontWeight: 'bold',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#1A7A9D',
        },
    };

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
      <Container maxWidth="md">
        <Typography variant="h3" gutterBottom>
          Telnet Academy
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
            {t("about_page_description")}
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
            contact
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
            {t("user_guide_message")}
        </Typography>
        <Button
          sx={buttonStyle}
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
            {t("download_user_guide")}
        </Button>
      </Container>
    </Box>
  );
};

export default AboutPage;

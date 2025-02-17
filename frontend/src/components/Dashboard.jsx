import React from "react";
import { Box } from "@mui/material";


const Navbar = () => {
    return (
        <Box
          sx={{
            width: 200,
            height: 100,
            backgroundColor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          Material UI Div
        </Box>
      );
};

export default Navbar;
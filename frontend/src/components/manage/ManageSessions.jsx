import React, { useState, useEffect } from "react";
import { useLanguage } from "../../languagecontext";
import { Box, TextField , Typography, Button,Input,IconButton, InputAdornment, Tooltip, OutlinedInput, FormControl, InputLabel, Pagination,Radio, Alert, Snackbar  } from "@mui/material";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MenuItem from '@mui/material/MenuItem';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import axios from "axios";
import * as XLSX from 'xlsx';

const ManageSessions = () => {

    const { t } = useLanguage();

    const [users, setUsers] = useState([]);

    //  Adding All Users
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
          alert("Please select a file.");
          return;
        }
      
        const reader = new FileReader();
        reader.onload = async () => {
          const data = reader.result;
          const workbook = XLSX.read(data, { type: 'array' });
      
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
      
          const jsonData = XLSX.utils.sheet_to_json(sheet);
      
          try {
            const response = await axios.post('http://localhost:5000/api/uploadUsers', { data: jsonData });
          } catch (error) {
          }
        };
      
        reader.readAsArrayBuffer(file);
      };


    // Update all users .................
    const [verifyUpdateAll, setVerifyUpdateAll] = useState(false);

    const showVerifyUpdateAllDialog = () => {
        setVerifyUpdateAll(true);
    };

    const hideVerifyUpdateAllDialog = () => {
        setVerifyUpdateAll(false);
    };

    // Delete all users ....................
    const [verifyDeleteAll, setVerifyDeleteAll] = useState(false);

    const showVerifyDeleteAllDialog = (userId) => {
        setVerifyDeleteAll(true);
    };

    const hideVerifyDeleteAllDialog = () => {
        setVerifyDeleteAll(false);
    };

    // Filters ....................
    const [selectedFilter, setSelectedFiler] = useState("all");
    const [searchedName, setSearchedName] = useState('');
    const [applyFilter, setApplyFilter] = useState(false);

    const FilterMonths = [
      "all", "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];    
    const [selectedMonth, setSelectedMonth] = useState("all");

    const FilterLocations = ['all', 'Telnet Sfax', 'Telnet Tunis', 'Microsoft Teams']
    const [selectedLocation, setSelectedLocation] = useState("all");

    const FilterModes = ['all', 'online', 'face_to_face']
    const [selectedMode, setSelectedMode] = useState("all");

    const FilterSkillTypes = ['all', 'technical_skill', 'soft_skill']
    const [selectedSkillType, setSelectedSkillType] = useState("all");
    
    const FilterTypes = ['all', 'internal', 'external']
    const [selectedType, setSelectedType] = useState("all");

    const [FilterTrainer, setFilterTrainer] = useState(['all']);
    const [selectedTrainer, setSelectedTrainer] = useState("all");

    const fetchTrainers = async () => {
      const response = await axios.get('http://localhost:5000/api/users');
      if (response.status === 200) {
        response.data.forEach((user) => {
          if (user.role === "trainer") {
            setFilterTrainer((prev) => [...prev, user.name]);
          }
        });
      }
    };

    useEffect(() => {
        fetchTrainers();
    }, []);

    const handleSearchChange = (e) => {
        setSearchedName(e.target.value);
    };

    const handleClearSearch = () =>{
        setSearchedName(''); 
    };

    const filteredUsers = Object.entries(users)
        .filter(([_, user]) => user !== undefined)
        .map(([key, user]) => ({ id: key, ...user }))
        .filter(user =>
        user &&
        user.name &&
        user.name.toLowerCase().includes(searchedName.toLowerCase()) &&
        (selectedMonth === user.role || selectedMonth === "all")
        )
        .sort((fuser, suser) => {
        if (selectedOrder && ((fuser[selectedOrder.toLowerCase()] !== undefined || fuser[selectedOrder] !== undefined)) &&
            (suser[selectedOrder.toLowerCase()] !== undefined || suser[selectedOrder] !== undefined)) {
            if (selectedOrder.toLowerCase() === "createdat") {
            const fuserDate = new Date(fuser[selectedOrder]);
            const suserDate = new Date(suser[selectedOrder]);
            const fuserTimestamp = fuserDate.getTime();
            const suserTimestamp = suserDate.getTime();
            return orderState === "Down"
                ? fuserTimestamp - suserTimestamp
                : suserTimestamp - fuserTimestamp;
            } else {
            return orderState === "Down"
                ? fuser[selectedOrder.toLowerCase()].toLowerCase().localeCompare(suser[selectedOrder.toLowerCase()].toLowerCase())
                : suser[selectedOrder.toLowerCase()].toLowerCase().localeCompare(fuser[selectedOrder.toLowerCase()].toLowerCase());
            }
        }
        return 0;
    });

    // Order ........................
    const [orderState, setOrderState] = useState('Down');
    const [selectedOrder, setSelectedOrder] = useState("createdAt");

    const handleChangeOrder = (sel) => {
        setOrderState(orderState === 'Up' ? 'Down' : 'Up');
        setSelectedOrder(sel);
    };

    // Styles ..............

    const buttonStyle = (sel) => ({
      color: 'white',
      backgroundColor: sel === selectedFilter ? '#2CA8D5' : 'button.tertiary',
      borderRadius: '10px',
      textDecoration: 'none',
      textAlign: 'start',
      fontWeight: 'bold',
      fontSize: '16px',
      lineHeight: 1.2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '140px',
      height: '70px',
      fontWeight: 'bold',
      textTransform: "none",
      color: 'text.primary',
      '&:hover': {
        backgroundColor: '#76C5E1',
        color: 'white',
      }
    });

    const orderStyle = {
      color: "text.primary",
      textTransform: "none",
    };

    return (
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
            position: "absolute",
            left: '2%',
            top: '15%',
            padding: '30px',
        }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "start",
              alignItems: "center",
              width: "100%",
              height: "100px",
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
                    marginLeft: 5,
                }}
            >
                {t("manage_sessions")}
            </Typography>
            <Box
              sx={{
                position: 'absolute',
                left: '30%',
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: '20px',
              }}
            >
                <Button 
                  sx={buttonStyle("all")}
                  onClick={() => setSelectedFiler("all")}
                >
                  {t("all")}
                </Button>
                <Button 
                  sx={buttonStyle("scheduled")}
                  onClick={() => setSelectedFiler("scheduled")}
                >
                  15<br/>{t("scheduled")}
                </Button>
                <Button 
                  sx={buttonStyle("in_progress")}
                  onClick={() => setSelectedFiler("in_progress")}
                >
                  11<br/>{t("in_progress")}
                </Button>
                <Button 
                  sx={buttonStyle("completed")}
                  onClick={() => setSelectedFiler("completed")}
                >
                  40<br/>{t("completed")}
                </Button>
                <Button 
                  sx={buttonStyle("not_full")}
                  onClick={() => setSelectedFiler("not_full")}
                >
                  5<br/>{t("not_full")}
                </Button>
                <Button 
                  sx={buttonStyle("full")}
                  onClick={() => setSelectedFiler("full")}
                >
                  10<br/>{t("full")}
                </Button>
            </Box>
          </Box>
          <Box
              sx={{
                  width: '100%',
                  position: "sticky",
                  top: 0,
                  paddingTop: '20px',
                  backgroundColor: "background.paper",
                  zIndex: 1,
                  height: '150px',
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: '10px',
              }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: '100%',
                        height: '70px',
                        gap: '20px',
                    }}
                >
                    <Button
                        sx={{...orderStyle, width: '15%', minWidth: '200px'}}
                        onClick={() => handleChangeOrder("createdAt")}
                    >
                        <Typography>
                            {t("sort_by_date_added")}
                        </Typography>
                        {selectedOrder === "createdAt" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Button
                        sx={{...orderStyle, width: '15%', minWidth: '200px'}}
                        onClick={() => handleChangeOrder("month")}
                    >
                        <Typography>
                            {t("sort_by_month")}
                        </Typography>
                        {selectedOrder === "month" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Input
                        placeholder={t("search_by_name")}
                        value={searchedName}
                        onChange={handleSearchChange}
                        sx={{
                            width: '20%'
                        }}
                        startAdornment={
                            <InputAdornment position="start">
                                <IconButton size="small">
                                    <SearchIcon />
                                </IconButton>
                            </InputAdornment>
                        }
                        endAdornment={
                            searchedName && (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClearSearch} size="small">
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    >
                    </Input>
                    <Tooltip title={t("add_user")} arrow> 
                        <IconButton color="primary" aria-label="add" size="small" 
                                sx={{ borderRadius: '50%'}}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={t("select_file")} arrow>
                        <label htmlFor="file-upload">
                            <IconButton color="primary" aria-label="select-file" size="small" component="span"
                            >
                                <UploadFileIcon />
                            </IconButton>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                        </label>
                    </Tooltip>

                    <Tooltip title={t("upload_file")} arrow>
                        <IconButton 
                            color="button.primary" 
                            aria-label="upload-file" 
                            size="small" 
                            onClick={handleUpload}
                            disabled={!file}
                            sx={{ borderRadius: '50%'}}
                        >
                            <CheckIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: '100%',
                      height: '70px',
                      gap: '20px',
                    }}
                >
                  <Button
                    sx={{
                      ...buttonStyle, width:'Auto', height:'55px', textTransform: 'none',
                      fontSize: 15, fontWeight: 'bold', backgroundColor: applyFilter ? '#2CA8D5 ': 'button.tertiary', 
                      color: 'text.primary', borderRadius: '10px', gap: '10px', padding : '10px',
                      minWidth: '170px', 
                    }}
                    onClick={() => setApplyFilter(!applyFilter)}
                  >
                    {applyFilter ? <FilterAltIcon/> : <FilterAltOffIcon/>}
                    {applyFilter ? t("filter_applied") : t("apply_filter")}
                  </Button>
                  <TextField
                        select
                        label={t("month")}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                              disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterMonths.map((month) => (
                            <MenuItem key={month} value={month}>
                                {t(month)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={t("location")}
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                              disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterLocations.map((location) => (
                            <MenuItem key={location} value={location}>
                                {t(location)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={t("mode")}
                        value={selectedMode}
                        onChange={(e) => setSelectedMode(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                              disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterModes.map((mode) => (
                            <MenuItem key={mode} value={mode}>
                                {t(mode)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={t("skill")}
                        value={selectedSkillType}
                        onChange={(e) => setSelectedSkillType(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                              disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterSkillTypes.map((skill) => (
                            <MenuItem key={skill} value={skill}>
                                {t(skill)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={t("type")}
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                              disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {t(type)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={t("trainer")}
                        value={selectedTrainer}
                        onChange={(e) => setSelectedTrainer(e.target.value)}
                        sx={{
                            width: '15%'
                        }}
                        SelectProps={{
                            MenuProps: {
                              disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterTrainer.map((trainer) => (
                            <MenuItem key={trainer} value={trainer}>
                                {t(trainer)}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
                <Box 
                    sx={{
                        width: '100%',
                        height: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                  <Box
                      sx={{
                          width: '90%',
                          height: '40px',
                          border: '1px solid lightgrey',
                          borderRadius: '5px',
                          display: 'flex',
                          justifyContent: "start",
                          alignItems: 'start',
                          gap: '5px',
                      }}
                  >
                      <Button
                          sx={{...orderStyle, width: '20%'}}
                          onClick={() => handleChangeOrder("Title")}
                      >
                          <Typography>
                              {t("title")}
                          </Typography>
                          {selectedOrder === "Title" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                      </Button>
                      <Button
                          sx={{...orderStyle, width: '20%'}}
                          onClick={() => handleChangeOrder("Name")}
                      >
                          <Typography>
                              {t("name")}
                          </Typography>
                          {selectedOrder === "Name" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                      </Button>
                      <Button
                          sx={{...orderStyle, width: '30%'}}
                          onClick={() => handleChangeOrder("Date")}
                      >
                          <Typography>
                              {t("date")}
                          </Typography>
                          {selectedOrder === "Date" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                      </Button>
                      <Button
                          sx={{...orderStyle, width: '15%'}}
                          onClick={() => handleChangeOrder("Duration")}
                      >
                          <Typography>
                              {t("duration")}
                          </Typography>
                          {selectedOrder === "Duration" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                      </Button>
                      <Button
                          sx={{...orderStyle, width: '15%'}}
                          onClick={() => handleChangeOrder("Places")}
                      >
                          <Typography>
                              {t("places")}
                          </Typography>
                          {selectedOrder === "Places" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                      </Button>
                      <Box sx={{width:'15%', display:"flex", flexDirection:"row", justifyContent:"end"}}>
                          <Tooltip title={t("save") + " " + t("all")} arrow> 
                              <IconButton onClick={showVerifyUpdateAllDialog} sx={{ color: "#76C5E1" }}>
                                  <SaveIcon />
                              </IconButton>
                          </Tooltip>
                          <Tooltip title={t("delete") + " " + t("all")} arrow> 
                              <IconButton onClick={showVerifyDeleteAllDialog} sx={{color:"#EA9696"}}>
                                  <DeleteIcon/>
                              </IconButton>
                          </Tooltip>
                      </Box>
                      <Dialog
                              open={verifyUpdateAll}
                              disableScrollLock={true}
                              onClose={hideVerifyUpdateAllDialog}
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
                              <DialogTitle>{t("confirm_update_all_users")}?</DialogTitle>
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
                                  onClick={hideVerifyUpdateAllDialog}>
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
                                  > 
                                      {t("yes")}
                                  </Button>
                              </Box>
                      </Dialog>
                      <Dialog
                          open={verifyDeleteAll}
                          disableScrollLock={true}
                          onClose={hideVerifyDeleteAllDialog}
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
                          <DialogTitle>{t("confirm_delete_all_users")}?</DialogTitle>
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
                              onClick={hideVerifyDeleteAllDialog}>
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
                              >
                                  {t("yes")}
                              </Button>
                          </Box>
                      </Dialog>
                  </Box>
                </Box>
          </Box>
        </Box>
      );
};

export default ManageSessions;
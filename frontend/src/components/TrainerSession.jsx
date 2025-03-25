import React, { useState, useEffect } from "react";
import { useLanguage } from "../languagecontext";
import { Box, TextField , Typography, Button,Input,IconButton, InputAdornment, Tooltip, OutlinedInput, FormControl, InputLabel, Pagination,Radio, Alert, Snackbar , Autocomplete, Popover,Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Paper, Checkbox, FormControlLabel  } from "@mui/material";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import GroupIcon from '@mui/icons-material/Group';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { getCookie } from "./Cookies";
import dayjs from 'dayjs';
import axios from "axios";

const TrainerSession = () => {

  const { t } = useLanguage();
  const [selectedTrainingId, setSelectedTrainingId] = useState(true);


  // Fetch All Trainings with corresponding sessions
  const [trainings, setTrainings] = useState([]);
  const user = getCookie("User");

  const updateStatus = () => {
    trainings.forEach((training) => {
        training.sessions.forEach((session) => {
            axios.put(`http://localhost:5000/api/sessions/${session._id}`, session)
                .then((response) => {})
                .catch((error) => {});
        });
        });
  };

  useEffect(() => {
    updateStatus();
  }, []);

  const fetchTrainings = () => {
    axios.get("http://localhost:5000/api/trainings")
        .then((response) => {
            const trainingsWithModified = response.data
            .filter((training) => {
                return training.trainer === user._id;
            })
            .map(training => ({
                ...training,
                sessions: [],
                full: training.nbOfAcceptedRequests >= training.nbOfParticipants,
            }));

            setTrainings(trainingsWithModified);

            trainingsWithModified.forEach((training) => {
                axios.get(`http://localhost:5000/api/sessions/training/${training._id}`)
                    .then((response) => {
                        const updatedSessions = response.data.map(session => ({
                            ...session,
                        }));
                        setTrainings((prevTrainings) =>
                            prevTrainings.map((t) =>
                                t._id === training._id ? { ...t, sessions: updatedSessions } : t
                            )
                        );
                    })
                    .catch((error) => {
                        console.error("Error fetching sessions:", error);
                    });
            });
        })
        .catch((error) => {
            console.error("Error fetching trainings:", error);
        });
  };



  // Verify Update Or Create Training...........

  const [showsVerificationAlert, setShowsVerifificationAlert] = useState(false);
  const [verifyAlertMessage, setVerifyAlertMessage] = useState("");
  const [verifyAlert, setVerifyAlert] = useState("error");
  const handleVerificationAlertClose = () => {
      setShowsVerifificationAlert(false);
  };


    const [TrainingTrainers, setTrainingTrainers] = useState([]); 

    

    // show training details by Id............
    const [showTraining, setShowTraining] = useState(false);

    const showTrainingDetails = (trainingId) => {
        setShowTraining(true);
        setSelectedTrainingId(trainingId);
    };

    const hideTrainingDetails = () => {
        setShowTraining(false);
    };
  
    // Order ........................
    const [orderState, setOrderState] = useState('Down');
    const [trainingOrderState, setTrainingOrderState]= useState('Down');  
    const [selectedOrder, setSelectedOrder] = useState("Name");
    const [selectedTrainingOrder, setSelectedTrainingOrder] = useState("createdAt");

    const handleChangeOrder = (sel) => {
        setOrderState(orderState === 'Up' ? 'Down' : 'Up');
        setSelectedOrder(sel);
    };

    const handleChangeTrainingOrder = (sel) => {
        setTrainingOrderState(trainingOrderState === 'Up' ? 'Down' : 'Up');
        setSelectedTrainingOrder(sel);
    };

    // Filters ....................
    const [otherFilterLocation, setOtherFilterLocation] = useState(false);
    const FilterColors = {
        "full": "#FFCDD2",
        "not_full": "#C8E6C9",
    }

    const [selectedFilter, setSelectedFiler] = useState("all");
    const [searchedTitle, setSearchedTitle] = useState('');
    const [applyFilter, setApplyFilter] = useState(false);

    const FilterMonths = [
      "all", "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december"
    ];    
    const [selectedMonth, setSelectedMonth] = useState("all");

    const FilterLocations = ['all', 'Telnet Sfax', 'Telnet Tunis Lac', 'Telnet Tunis CDS', 'Microsoft Teams']
    const [selectedLocation, setSelectedLocation] = useState("all");

    const FilterModes = ['all', 'online', 'face_to_face', 'hybrid']
    const [selectedMode, setSelectedMode] = useState("all");

    const FilterSkillTypes = ['all', 'technical_skill', 'soft_skill']
    const [selectedSkillType, setSelectedSkillType] = useState("all");
    
    const FilterTypes = ['all', 'internal', 'external']
    const [selectedType, setSelectedType] = useState("all");


    const fetchTrainers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        if (response.status === 200) {
          const trainers = response.data
            .filter(user => (user.role === "trainer" || user.role === "trainee_trainer"))
            .map(user => ({ name: user.name, id: user._id }));
    
          setTrainingTrainers(trainers);
        }
      } catch (error) {
        console.error("Error fetching trainers:", error);
      }
    };
    

    useEffect(() => {
        fetchTrainers();
        fetchTrainings();
    }, []);

    const handleSearchChange = (e) => {
        setSearchedTitle(e.target.value);
    };

    const handleClearSearch = () =>{
        setSearchedTitle(''); 
    };

    const filteredTrainings = Object.entries(trainings)
    .filter(([_, training]) => training !== undefined)
    .map(([key, training]) => ({ id: key, ...training }))
    .filter(training => 
        training &&
        training.title &&
        training.title.toLowerCase().includes(searchedTitle.toLowerCase()) && 
        (!applyFilter || ( 
            (selectedMonth === training.month || selectedMonth === "all") &&
            (selectedLocation === training.location || selectedLocation === "all") &&
            (selectedMode === training.mode || selectedMode === "all") &&
            (selectedSkillType === training.skillType || selectedSkillType === "all") &&
            (selectedType === training.type || selectedType === "all")
        )) &&
        ((selectedFilter === "full" && training.full) || (selectedFilter === "not_full" && !training.full) || selectedFilter === "all")
     ).sort((ftraining, straining) => {
      if (
        selectedTrainingOrder &&
        ((ftraining[selectedTrainingOrder.toLowerCase()] !== undefined || ftraining[selectedTrainingOrder] !== undefined) &&
        (straining[selectedTrainingOrder.toLowerCase()] !== undefined || straining[selectedTrainingOrder] !== undefined))
      ) {
        if (selectedTrainingOrder.toLowerCase() === "createdat") {
          const ftrainingDate = new Date(ftraining[selectedTrainingOrder]);
          const strainingDate = new Date(straining[selectedTrainingOrder]);
          return trainingOrderState === "Down"
            ? ftrainingDate - strainingDate
            : strainingDate - ftrainingDate;
        }else if (selectedTrainingOrder.toLowerCase() === "title"){
          return trainingOrderState === "Down"
          ? ftraining[selectedTrainingOrder.toLowerCase()].toLowerCase().localeCompare(straining[selectedTrainingOrder.toLowerCase()].toLowerCase())
          : straining[selectedTrainingOrder.toLowerCase()].toLowerCase().localeCompare(ftraining[selectedTrainingOrder.toLowerCase()].toLowerCase());
        }else if (selectedTrainingOrder.toLowerCase() === "nbofparticipants"){
          return trainingOrderState === "Down"
          ? ftraining[selectedTrainingOrder] - (straining[selectedTrainingOrder])
          : straining[selectedTrainingOrder] - (ftraining[selectedTrainingOrder]);
        }
      }
    });
        

    const filterSessions = (training) => {
      if (!training.sessions) return [];
    
      return training.sessions
      .filter((session) => {
        return session.status === selectedFilter || selectedFilter === "all" || selectedFilter === "full" || selectedFilter === "not_full";
      })
      .sort((fsession, ssession) => {
        if (
          selectedOrder &&
          ((fsession[selectedOrder.toLowerCase()] !== undefined || fsession[selectedOrder] !== undefined) &&
          (ssession[selectedOrder.toLowerCase()] !== undefined || ssession[selectedOrder] !== undefined))
        ) {
          if(selectedOrder.toLowerCase() === "duration"){
            return orderState === "Down"
             ? fsession[selectedOrder.toLowerCase()] - ssession[selectedOrder.toLowerCase()]
              : ssession[selectedOrder.toLowerCase()] - fsession[selectedOrder.toLowerCase()];
          }else{
            return orderState === "Down"
              ? fsession[selectedOrder.toLowerCase()].toLowerCase().localeCompare(ssession[selectedOrder.toLowerCase()].toLowerCase())
              : ssession[selectedOrder.toLowerCase()].toLowerCase().localeCompare(fsession[selectedOrder.toLowerCase()].toLowerCase());
          }
        }
        return 0;
      });
    };

    // Pagination ...............
    const [page, setPage] = useState(1);
    const itemsPerPage = 20; 

    const handlePageChange = (event, value) => {
        setPage(value);
    };
    const pageCount = Math.ceil(filteredTrainings.length / itemsPerPage);
    const displayedTrainings = filteredTrainings.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // handle changings in trainings

    const getTrainingById = (id) => {
        return Object.values(trainings).find(training => training._id === id) || null;
    };

    
    

    // Styles ..............

    const buttonStyle = {
      color: 'black',
      backgroundColor: 'button.tertiary',
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
      '&:hover': {
        backgroundColor: '#76C5E1',
      }
    };

    const orderStyle = {
      color: "text.primary",
      textTransform: "none",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
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
            gap: "10px",
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
                {t("sessions")}
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
                    sx={buttonStyle}
                    onClick={() => setSelectedFiler("all")}
                >
                {selectedFilter === "all" && (
                    <Box
                    sx={{
                        width: 12,
                        height: 12, 
                        backgroundColor: "#2CA8D5", 
                        borderRadius: "50%",
                        position: "absolute",
                        top: 10, 
                        right: 10, 
                        boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)", 
                    }}
                    />
                )}
                    {t("all")}
                </Button>
                <Button 
                    sx={{...buttonStyle, backgroundColor :"#C8E6C9"}}
                    onClick={() => setSelectedFiler("not_full")}
                >
                {selectedFilter === "not_full" && (
                    <Box
                    sx={{
                        width: 12,
                        height: 12, 
                        backgroundColor: "#2CA8D5", 
                        borderRadius: "50%",
                        position: "absolute",
                        top: 10, 
                        right: 10, 
                        boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)", 
                    }}
                    />
                )}
                    5<br/>{t("not_full")}
                </Button>
                <Button 
                    sx={{...buttonStyle, backgroundColor :"#FFCDD2"}}
                    onClick={() => setSelectedFiler("full")}
                >
                {selectedFilter === "full" && (
                    <Box
                    sx={{
                        width: 12,
                        height: 12, 
                        backgroundColor: "#2CA8D5", 
                        borderRadius: "50%",
                        position: "absolute",
                        top: 10, 
                        right: 10, 
                        boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)", 
                    }}
                    />
                )}
                    10<br/>{t("full")}
                </Button>
            </Box>
            </Box>
            <Box
                sx={{
                    width: '100%',
                    position: "sticky",
                    top: 0,
                    backgroundColor: "background.paper",
                    zIndex: 2,
                    height: 'auto',
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: '5px',
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
                        onClick={() => handleChangeTrainingOrder("createdAt")}
                    >
                        <Typography>
                            {t("sort_by_date_added")}
                        </Typography>
                        {selectedTrainingOrder === "createdAt" ? (trainingOrderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Input
                        placeholder={t("search_by_title")}
                        value={searchedTitle}
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
                            searchedTitle && (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClearSearch} size="small">
                                        <ClearIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }
                    >
                    </Input>
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
                        minWidth: '180px',       whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                    onClick={() => setApplyFilter(!applyFilter)}
                    >
                    {applyFilter ? <FilterAltIcon/> : <FilterAltOffIcon/>}
                    {applyFilter ? t("disable_filter") : t("apply_filter")}
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
                        select={!otherFilterLocation  && (FilterLocations.includes(selectedLocation) || selectedLocation === "")}
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
                        <Button 
                            sx={{
                                width: "100%",
                                textTransform: "none",
                                color: "black",
                            }}
                            onClick={() => 
                                setOtherFilterLocation(true)}
                        >
                            {t("other")}...
                        </Button>
                    </TextField>
                    <Dialog
                        open={otherFilterLocation}
                        onClose={() => setOtherFilterLocation(false)}
                        disableScrollLock={true}
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
                        <FormControl variant="outlined" sx={{ 
                                width: '200px',
                            }}
                        >
                            <InputLabel required>{t("location")}</InputLabel>
                            <OutlinedInput
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                label="Activity  ................"
                            />
                        </FormControl>
                        <Button
                            sx={{
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
                            onClick={() => {
                                setOtherFilterLocation(false);
                            }}
                        >
                            {t("save")}
                        </Button>
                    </Dialog>
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
                </Box>
                <Box
                    sx={{
                        width: '100%',
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
                        sx={{...orderStyle, width: '15%'}}
                        onClick={() => handleChangeTrainingOrder("Title")}
                    >
                        <Typography>
                            {t("title")}
                        </Typography>
                        {selectedTrainingOrder === "Title" ? (trainingOrderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Box
                        sx={{
                        width: '60%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'start',
                        alignItems: 'center',
                        gap: '5px',
                        }}
                    >
                        <Button
                        sx={{...orderStyle, width: '25%'}}
                        onClick={() => handleChangeOrder("Name")}
                        >
                            <Typography>
                                {t("name")}
                            </Typography>
                            {selectedOrder === "Name" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                        <Button
                            sx={{...orderStyle, width: '25%'}}
                            onClick={() => handleChangeOrder("Date")}
                        >
                            <Typography>
                                {t("date")}
                            </Typography>
                            {selectedOrder === "Date" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                        <Button
                            sx={{...orderStyle, width: '25%'}}
                            onClick={() => handleChangeOrder("Duration")}
                        >
                            <Typography>
                                {t("duration")}
                            </Typography>
                            {selectedOrder === "Duration" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                        <Button
                            sx={{...orderStyle, width: '25%'}}
                            onClick={() => handleChangeOrder("Location")}
                        >
                            <Typography>
                                {t("location")}
                            </Typography>
                            {selectedOrder === "Location" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                    </Box>
                    <Button
                        sx={{...orderStyle, width: '15%'}}
                        onClick={() => handleChangeTrainingOrder("nbOfParticipants")}
                    >
                        <Typography>
                            {t("nbOfParticipants")}
                        </Typography>
                        {selectedTrainingOrder === "nbOfParticipants" ? (trainingOrderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Box sx={{width:'10%', display:"flex", flexDirection:"row", justifyContent:"end"}}>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    width: '100%',
                    height: "auto",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                }}
            >
                {displayedTrainings
                .map(training => (
                    <Box
                        key={training._id}
                        sx={{
                            width: '100%',
                            height: 'auto',
                            display: 'flex',
                            flexDirection: "row",
                            justifyContent: "start",
                            alignItems: 'center',
                            boxSizing: 'border-box',
                            backgroundColor: "button.tertiary",
                            borderRadius: "10px",
                            paddingTop: "10px",
                            paddingBottom: "10px",
                            cursor: "pointer",
                            gap: "5px",  
                            transition: "background-color 0.2s ease-in-out",
                            "&:hover": {
                                backgroundColor: "background.navbar",
                            },
                        }}
                    >
                        <Box
                        sx={{
                            width: '15%',
                            display: 'flex',
                            flexDirection: 'column', 
                            justifyContent: 'start',
                            alignItems: 'start',
                            borderRight: '1px solid rgb(192, 192, 192)',
                            padding: 2,
                        }}
                        ><Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Box
                                sx={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: training.full ? FilterColors.full : FilterColors.not_full,
                                marginRight: "10px",
                                }}
                            />
                            {training.full ? 'Full' : 'Not Full'}
                        </Box>
                            <Typography 
                                    sx={{ 
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "start",
                                        justifyContent: "start",
                                    }}
                                >
                                    {training.title || t("title")}
                            </Typography>
                        </Box>
                        <Box
                        sx={{
                            width: '60%',
                            display: 'flex',
                            flexDirection: "column",
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '5px',
                        }}
                        >
                        {filterSessions(training).map((session) => (
                            <Box
                            key={session._id}
                            variant="outlined" 
                            sx={{
                                width: "100%",
                                height: "60px",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "start",
                                alignItems: 'center',
                                gap: '5px',
                                border: "1px solid #ccc", 
                                borderRadius: "5px", 
                                cursor: "pointer",
                            }}
                            >
                            <Typography 
                                sx={{ 
                                    width: "25%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {session.name || t("name")}
                            </Typography>
                            <Typography 
                                sx={{ 
                                    width: "25%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {session.date ? dayjs(session.date).format("YYYY-MM-DD HH:mm") : "" || t("date")}
                            </Typography>
                            <Typography 
                                sx={{ 
                                    width: "25%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {session.duration || t("duration")}
                            </Typography>
                            <Typography 
                                sx={{ 
                                    width: "25%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {session.location || t("location")}
                            </Typography>
                          </Box>
                        ))}
                        </Box> 
                        <Typography 
                        variant="outlined"
                            sx={{ 
                                border: "1px solid #ccc", 
                                borderRadius: "5px", 
                                cursor: "pointer",
                                height: "60px",
                                width: "15%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {training.nbOfParticipants|| t("numberOfParticipants")}
                        </Typography>
                        <Box 
                        sx={{width:'10%', display:"flex", flexDirection:"row", justifyContent:"end", paddingRight:"10px"}}
                        >
                            <Tooltip title={t("view_details")} arrow> 
                                <IconButton sx={{color:"#76C5E1"}}  onClick={() => {showTrainingDetails(training._id);
                                }}>
                                    <RemoveRedEyeIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("take_attendance")} arrow> 
                                <IconButton sx={{color:"#76C5E1"}} >
                                    <GroupIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                ))}
            </Box>
            <Dialog
                open={showTraining}
                onClose={hideTrainingDetails}
                disableScrollLock={true}
                PaperProps={{
                    sx: {
                        width: "800px",  
                        height: "auto", 
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "start",
                        alignItems: "center",
                        borderRadius: "10px",
                        gap: "20px",
                        padding: "20px",
                        scrollbarWidth: "none",
                        "&::-webkit-scrollbar": {
                            display: "none"  
                        }
                    }
                }}
            >
                <DialogTitle>{t("training_details")}</DialogTitle>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "20px",
                    }}
                >
                    <TextField
                        label={t("title")}
                        value={t(getTrainingById(selectedTrainingId)?.title)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("month")}
                        value={t(getTrainingById(selectedTrainingId)?.month)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "20px",
                    }}
                >
                    <TextField
                        label={t("skill")}
                        value={t(getTrainingById(selectedTrainingId)?.skillType)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("date")}
                        value={t(getTrainingById(selectedTrainingId)?.date)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "20px",
                    }}
                >
                    <TextField
                        label={t("nbOfHours")}
                        value={t(getTrainingById(selectedTrainingId)?.nbOfHours)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("location")}
                        value={t(getTrainingById(selectedTrainingId)?.location)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "20px",
                    }}
                >
                    <TextField
                        label={t("mode")}
                        value={t(getTrainingById(selectedTrainingId)?.mode)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("type")}
                        value={t(getTrainingById(selectedTrainingId)?.type)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        width: '100%',
                        gap: '20px',
                    }}
                >   
                    <TextField
                        label={t("nbOfSessions")}
                        value={t(getTrainingById(selectedTrainingId)?.nbOfSessions)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("trainer")}
                        value={TrainingTrainers.find(trainer => trainer.id === getTrainingById(selectedTrainingId)?.trainer)?.name || ""}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "20px",
                    }}
                >
                    <TextField
                        label={t("nbOfParticipants")}
                        value={t(getTrainingById(selectedTrainingId)?.nbOfParticipants)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                    <TextField
                        label={t("description")}
                        value={t(getTrainingById(selectedTrainingId)?.description)}
                        sx={{ 
                            width: "50%",
                            cursor: "pointer", 
                            "& .MuiInputBase-input": { cursor: "pointer" }, 
                            "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                        }}
                        InputProps={{
                            readOnly: true, 
                        }}
                    />
                </Box>
                <Box 
                    sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: '100%',
                    gap: '10px',
                    flexWrap: "wrap",
                    
                }}
                >
                    {Array.from({ length: getTrainingById(selectedTrainingId)?.nbOfSessions }, (_, index) => (
                        <Box 
                            key={index} 
                            sx={{ 
                            width: "100%", 
                            height: "auto",
                            borderRadius: '10px',
                            backgroundColor: 'background.noBigDiff',
                            padding: '10px',
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "start",
                            gap: '10px',
                            }}
                        >
                            {t("session")} {index + 1}
                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "20px",
                                }}
                            >
                                <TextField
                                    label={t("name")}
                                    value={getTrainingById(selectedTrainingId)?.sessions[index]?.name}
                                    sx={{ 
                                        width: "50%",
                                        cursor: "pointer", 
                                        "& .MuiInputBase-input": { cursor: "pointer" }, 
                                        "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                                    }}
                                    InputProps={{
                                        readOnly: true, 
                                    }}
                                />
                                <TextField
                                    label={t("date")}
                                    value={getTrainingById(selectedTrainingId)?.sessions[index]?.date}
                                    sx={{ 
                                        width: "50%",
                                        cursor: "pointer", 
                                        "& .MuiInputBase-input": { cursor: "pointer" }, 
                                        "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                                    }}
                                    InputProps={{
                                        readOnly: true, 
                                    }}
                                />
                            </Box>
                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "20px",
                                }}
                            >
                                <TextField
                                    label={t("duration")}
                                    value={getTrainingById(selectedTrainingId)?.sessions[index]?.duration}
                                    sx={{ 
                                        width: "50%",
                                        cursor: "pointer", 
                                        "& .MuiInputBase-input": { cursor: "pointer" }, 
                                        "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                                    }}
                                    InputProps={{
                                        readOnly: true, 
                                    }}
                                />
                                <TextField
                                    label={t("location")}
                                    value={getTrainingById(selectedTrainingId)?.sessions[index]?.location}
                                    sx={{ 
                                        width: "50%",
                                        cursor: "pointer", 
                                        "& .MuiInputBase-input": { cursor: "pointer" }, 
                                        "& .MuiOutlinedInput-root": { cursor: "pointer" } 
                                    }}
                                    InputProps={{
                                        readOnly: true, 
                                    }}
                                />
                            </Box>
                        </Box>
                    ))}
                </Box>
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
                onClick={hideTrainingDetails}>
                    {t("close")}
                </Button>
                </Box> 
            </Dialog>
            <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
            />
            <Snackbar open={showsVerificationAlert} autoHideDuration={3000} onClose={handleVerificationAlertClose}>
                <Alert onClose={handleVerificationAlertClose} severity={verifyAlert} variant="filled">
                    {t(verifyAlertMessage)}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TrainerSession;
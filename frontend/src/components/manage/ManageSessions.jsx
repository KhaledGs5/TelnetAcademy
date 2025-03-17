import React, { useState, useEffect } from "react";
import { useLanguage } from "../../languagecontext";
import { Box, TextField , Typography, Button,Input,IconButton, InputAdornment, Tooltip, OutlinedInput, FormControl, InputLabel, Pagination,Radio, Alert, Snackbar , Autocomplete, Popover  } from "@mui/material";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import MenuItem from '@mui/material/MenuItem';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { StaticDatePicker, LocalizationProvider , DateTimePicker} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from 'dayjs';
import axios from "axios";
import * as XLSX from 'xlsx';

const ManageSessions = () => {

  const { t } = useLanguage();
  const [selectedTrainingId, setSelectedTrainingId] = useState(true);

  const [time, setTime] = useState(dayjs().format("YYYY-MM-DD hh:mm A"));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(dayjs().format("YYYY-MM-DD hh:mm A"));
    }, 1000); 
    return () => clearInterval(interval); 
  }, []);
  

  const [newTrainingTitle, setNewTrainingTitle] = useState("");
  const [newTrainingMonth, setNewTrainingMonth] = useState("");
  const [newTrainingSkillType, setNewTrainingSkillType] = useState("");
  const [newTrainingDate,setNewTrainingDate]= useState("");
  const [newTrainingNbOfHours, setNewTrainingNbOfHours] = useState(0);
  const [newTrainingLocation, setNewTrainingLocation] = useState("");
  const [newTrainingMode, setNewTrainingMode] = useState("");
  const [newTrainingType, setNewTrainingType] = useState("");
  const [newTrainingTrainer, setNewTrainingTrainer] = useState("");
  const [newTrainingDescription, setNewTrainingDescription] = useState("");
  const [newTrainingNbOfSessions, setNewTrainingNbOfSessions] = useState(0);
  const [newTrainingNbOfParticipants, setNewTrainingNbOfParticipants ] = useState(0);
  

  const [newSessionsNames, setNewSessionsNames] = useState([]);
  const [newSessionsDates, setNewSessionsDates] = useState([]);
  const [newSessionsDurations, setNewSessionsDurations] = useState([]);
  const [newSessionsLocations, setNewSessionsLocations] = useState([]);


  // Fetch All Tranings with corresponding sessions
  const [trainings, setTrainings] = useState([]);

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
            const trainingsWithModified = response.data.map(training => ({
                ...training,
                modified: false,
                sessions: [],
                full: training.nbOfAcceptedRequests >= training.nbOfParticipants,
            }));

            setTrainings(trainingsWithModified);

            trainingsWithModified.forEach((training) => {
                axios.get(`http://localhost:5000/api/sessions/training/${training._id}`)
                    .then((response) => {
                        const updatedSessions = response.data.map(session => ({
                            ...session,
                            otherSessionLocation: false, 
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

  // Adding new Training
  const [newTraining, setNewTraining] = useState(false);
  const [otherLocation, setOtherLocation] = useState(false);
  const [otherFilterLocation, setOtherFilterLocation] = useState(false);
  const [otherSessionsLocations, setOtherSessionsLocations] = useState([]);
  const [otherUpdateLocation, setOtherUpdateLocation] = useState(false);
  const [otherSessionsUpdateLocations, setOtherSessionsUpdateLocations] = useState([]);

  const TrainingMonths = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  const getMonthDate = (monthName) => {
    const monthIndex = TrainingMonths.indexOf(monthName);
    if (monthIndex === -1) return dayjs(); 
    return dayjs().month(monthIndex).startOf("month");
  };

  const [selectedDays, setSelectedDays] = useState([]);
  const [dateAnchorEl, setDateAnchorEl] = useState(null);

  const handleOpenDatePicker = (event) => {
    setDateAnchorEl(event.currentTarget);
  };

  const handleCloseDatePicker = () => {
    setDateAnchorEl(null);
  };

  const handleDateChange = (newValue) => {
    const selectedDay = newValue.date(); 

    setSelectedDays((prevDays) => {
      let updatedDays;
      if (prevDays.includes(selectedDay)) {
        updatedDays = prevDays.filter((day) => day !== selectedDay);
      } else {
        updatedDays = [...prevDays, selectedDay].sort((a, b) => a - b);
      }

      setNewTrainingDate(updatedDays.join(" "));
      return updatedDays;
    });
  };

  const TrainingSkillTypes = ["soft_skill", "technical_skill"];
  const TrainingModes = ["online", "face_to_face", "hybrid"];
  const TrainingLocations = ['Telnet Sfax', 'Telnet Tunis Lac', 'Telnet Tunis CDS', 'Microsoft Teams'];
  const TrainingTypes = ["internal", "external"];
  const [TrainingTrainers, setTrainingTrainers] = useState([]); 
  
  const showNewTrainingForm = () => {
      setNewTraining(true);
  };

  const hideNewTrainingForm = () => {
      setNewTraining(false);
  };

  const handleAddTraining = () => {
      const newTraining = {
          title: newTrainingTitle,
          month: newTrainingMonth,
          skillType: newTrainingSkillType,
          date: newTrainingDate,
          nbOfHours: newTrainingNbOfHours,
          location: newTrainingLocation,
          mode: newTrainingMode,
          type: newTrainingType,
          description: newTrainingDescription,
          nbOfSessions: newTrainingNbOfSessions,
          nbOfParticipants: newTrainingNbOfParticipants,
          trainer: newTrainingTrainer,
      };
      axios.post("http://localhost:5000/api/trainings", newTraining)
        .then((response) => {
          fetchTrainings();
          hideNewTrainingForm();
          addSessions(response.data._id);
        })
        .catch((error) => {
          console.error("Error adding training:", error);
        });
      
      const addSessions = (trainingId) => {
        for (let i = 0; i < newTrainingNbOfSessions; i++) {
          const newSession = {
            name: newSessionsNames[i],
            date: newSessionsDates[i],
            duration: newSessionsDurations[i],
            location: newSessionsLocations[i],
            training: trainingId, 
          };
      
          axios.post("http://localhost:5000/api/sessions", newSession)
            .then(() => {
            })
            .catch((error) => {
            });
        }
      };
   };

    //  Adding All Trainings
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

    // Updating training by Id............
    const [updateTraining, setUpdateTraining] = useState(false);
    const [selectedUpdateDays, setSelectedUpdateDays] = useState([]);
    const handleUpdateDateChange = (newValue, id) => {
        const selectedDay = newValue.date(); 
    
        setSelectedUpdateDays((prevDays) => {
          let updatedDays;
          if (prevDays.includes(selectedDay)) {
            updatedDays = prevDays.filter((day) => day !== selectedDay);
          } else {
            updatedDays = [...prevDays, selectedDay].sort((a, b) => a - b);
          }
          setTrainings((prevTranings) => {
            const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
            if (!trainingKey) return prevTranings;     
            return {
                ...prevTranings,
                [trainingKey]: {
                    ...prevTranings[trainingKey],
                    date: updatedDays.join(" "),
                    modified: true,
                },
            };
        });
          return updatedDays;
        });
    };

    const showUpdateTrainingForm = (trainingId) => {
        setUpdateTraining(true);
        setSelectedTrainingId(trainingId);
        const training = getTrainingById(trainingId);
        if (training && training.date) {
            setSelectedUpdateDays(training.date.split(" ").map(day => parseInt(day)));
        }
    };

    const hideUpdateTrainingForm = () => {
        setUpdateTraining(false);
    };

    const [verifyUpdate, setVerifyUpdate] = useState(false);
    const [selectedTrainingNbOfSessions, setSelectedTrainingNbOfSessions] = useState(0);

    const showVerifyUpdateDialog = (trainingId) => {
        setSelectedTrainingId(trainingId);
        setVerifyUpdate(true);
    };

    const hideVerifyUpdateDialog = () => {
        setVerifyUpdate(false);
    };
    
    const handleUpdateTraining = (trainingId) => {
      const updatedTraining = Object.values(trainings).find(training => training._id === trainingId);
      console.log(updatedTraining);
      
      if (!updatedTraining) return;
  
      axios.put(`http://localhost:5000/api/trainings/${trainingId}`, updatedTraining)
          .then(() => { 
              hideVerifyUpdateDialog();
              setVerifyAlert("success");
          })
          .catch((error) => {
              setVerifyAlertMessage(error.response?.data?.error || "An error occurred");
              setVerifyAlert("error");
              setShowsVerifificationAlert(true);
          });

    updatedTraining.sessions.forEach(session => {
        axios.put(`http://localhost:5000/api/sessions/${session._id}`, session)
            .catch(error => {});
    });

    for (let i = selectedTrainingNbOfSessions; i < getTrainingById(selectedTrainingId)?.nbOfSessions; i++) {
        const newSession = {
          name: newSessionsNames[i],
          date: newSessionsDates[i],
          duration: newSessionsDurations[i],
          location: newSessionsLocations[i],
          training: selectedTrainingId, 
        };
    
        axios.post("http://localhost:5000/api/sessions", newSession)
          .then(() => {
          })
          .catch((error) => {
          });
      }
      fetchTrainings();
  
      setTrainings((prevTrainings) => ({
          ...prevTrainings,
          [Object.keys(prevTrainings).find(key => prevTrainings[key]._id === trainingId)]: {
              ...updatedTraining,
              modified: false
          }
      }));
  };
  

    // Update all trainings .................
    const [verifyUpdateAll, setVerifyUpdateAll] = useState(false);

    const showVerifyUpdateAllDialog = () => {
        setVerifyUpdateAll(true);
    };

    const hideVerifyUpdateAllDialog = () => {
        setVerifyUpdateAll(false);
    };

    const handleUpdateAllTrainings = () => {
        const listofchangedtrainings = Object.values(trainings)
            .filter((training) => training.modified)
            .map((training) => training._id);
    
        listofchangedtrainings.forEach((trainingId) => handleUpdateTraining(trainingId));
        hideVerifyUpdateAllDialog();
    }; 

    // Deleting user by Id..............
    const [verifyDelete, setVerifyDelete] = useState(false);

    const showVerifyDeleteDialog = (trainingId) => {
        setSelectedTrainingId(trainingId);
        setVerifyDelete(true);
    };

    const hideVerifyDeleteDialog = () => {
        setVerifyDelete(false);
    };

    const handleDeleteTraining = (trainingId) => {
        axios.delete(`http://localhost:5000/api/trainings/${trainingId}`)
            .then((response) => {
                console.log(response.data.message);
                hideVerifyDeleteDialog();
            })
            .catch((error) => {
                console.error("Error deleting training:", error);
            });
        
        setTrainings((prevTrainings) => {
            const updatedTrainings = Object.fromEntries(
                Object.entries(prevTrainings).filter(([_, training]) => training._id !== trainingId) 
            );
            return updatedTrainings;
        });
    };
    

    // Delete all trainings ....................
    const [verifyDeleteAll, setVerifyDeleteAll] = useState(false);

    const showVerifyDeleteAllDialog = (userId) => {
        setVerifyDeleteAll(true);
    };

    const hideVerifyDeleteAllDialog = () => {
        setVerifyDeleteAll(false);
    };

    const handleDeleteAllTrainings = () => {
        const listofalltrainings = Object.values(trainings)
        .map((training) => training._id);
    
        listofalltrainings.forEach((trainingId) => handleDeleteTraining(trainingId));
        hideVerifyDeleteAllDialog();
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
    const FilterColors = {
        "scheduled": "#E0E0E0",
        "in_progress": "#90CAF9",
        "completed": "#A5D6A7",
        "full": "#FFCDD2",
        "not_full": "#C8E6C9",
    }

    const getSessionColor = (session, time) => {
        if (isNaN(session.duration)) {
            console.error('Invalid session duration');
            return "";
        }

        let hours = Math.floor(session.duration);
        let minutes = Math.round((session.duration - hours) * 100);

        let startDate = dayjs(session.date, 'YYYY-MM-DD hh:mm A');
        if (!startDate.isValid()) {
            console.error('Invalid session date');
            return "";
        }

        let endDate = startDate.add(hours, 'hour').add(minutes, 'minute');

        let currentTime = dayjs(time, 'YYYY-MM-DD hh:mm A');
        if (!currentTime.isValid()) {
            console.error('Invalid time');
            return "";
        }
        let col = "";

        if (currentTime.isBefore(startDate)) {
            col = FilterColors.scheduled;
            session.status = "scheduled";
        }
        if (currentTime.isBetween(startDate, endDate, null, '[)')) {
            col = FilterColors.in_progress;
            session.status = "in_progress";
        };
        if (currentTime.isAfter(endDate)) {
            col = FilterColors.completed;
            session.status = "completed";
        };
    
        return col;
    };

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

    const [FilterTrainer, setFilterTrainer] = useState([{ name: 'all', id: 0 }]);
    const [selectedTrainer, setSelectedTrainer] = useState(0);

    const fetchTrainers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        if (response.status === 200) {
          const trainers = response.data
            .filter(user => user.role === "trainer")
            .map(user => ({ name: user.name, id: user._id }));
    
          setFilterTrainer([{ name: 'all', id: 0 }, ...trainers]);
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
            (selectedType === training.type || selectedType === "all") &&
            (selectedTrainer === training.trainer || selectedTrainer === 0)
        ))
    &&
    ((selectedFilter === "full" && training.full) || (selectedFilter === "not_full" && !training.full) || (selectedFilter === "all")
       || (selectedFilter === "completed") || (selectedFilter === "in_progress") || (selectedFilter === "scheduled"))
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

    const handleTitleChange = (e, id) => {
      setTrainings((prevTranings) => {
        const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
        if (!trainingKey) return prevTranings;     
        return {
            ...prevTranings,
            [trainingKey]: {
                ...prevTranings[trainingKey],
                title: e.target.value,
                modified: true,
            },
        };
      });
    };
    const handleMonthChange = (e, id) => {
        setTrainings((prevTranings) => {
          const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
          if (!trainingKey) return prevTranings;     
          return {
              ...prevTranings,
              [trainingKey]: {
                  ...prevTranings[trainingKey],
                  month: e.target.value,
                  modified: true,
              },
          };
        });
    };
    const handleSkillTypeChange = (e, id) => {
    setTrainings((prevTranings) => {
        const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
        if (!trainingKey) return prevTranings;     
        return {
            ...prevTranings,
            [trainingKey]: {
                ...prevTranings[trainingKey],
                skillType: e.target.value,
                modified: true,
            },
        };
    });
    };
    const handleTrainingDateChange = (e, id) => {
    setTrainings((prevTranings) => {
        const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
        if (!trainingKey) return prevTranings;     
        return {
            ...prevTranings,
            [trainingKey]: {
                ...prevTranings[trainingKey],
                date: e.target.value,
                modified: true,
            },
        };
    });
    };
    const handleNbOfHoursChange = (e, id) => {
        setTrainings((prevTranings) => {
          const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
          if (!trainingKey) return prevTranings;     
          return {
              ...prevTranings,
              [trainingKey]: {
                  ...prevTranings[trainingKey],
                  nbOfHours: parseInt(e.target.value),
                  modified: true,
              },
          };
        });
    };
    const handleLocationChange = (e, id) => {
        setTrainings((prevTranings) => {
          const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
          if (!trainingKey) return prevTranings;     
          return {
              ...prevTranings,
              [trainingKey]: {
                  ...prevTranings[trainingKey],
                  location: e.target.value,
                  modified: true,
              },
          };
        });
    };
    const handleModeChange = (e, id) => {
        setTrainings((prevTranings) => {
          const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
          if (!trainingKey) return prevTranings;     
          return {
              ...prevTranings,
              [trainingKey]: {
                  ...prevTranings[trainingKey],
                  mode: e.target.value,
                  modified: true,
              },
          };
        });
    };
    const handleTypeChange = (e, id) => {
    setTrainings((prevTranings) => {
        const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
        if (!trainingKey) return prevTranings;     
        return {
            ...prevTranings,
            [trainingKey]: {
                ...prevTranings[trainingKey],
                type: e.target.value,
                modified: true,
            },
        };
    });
    };
    const handleNbOfSessionsChange = (e, id) => {
        setTrainings((prevTranings) => {
          const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
          if (!trainingKey) return prevTranings;     
          return {
              ...prevTranings,
              [trainingKey]: {
                  ...prevTranings[trainingKey],
                  nbOfSessions: parseInt(e.target.value),
                  modified: true,
              },
          };
        });
    };
    const handleTrainerChange = (value, id) => {
        setTrainings((prevTranings) => {
          const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
          if (!trainingKey) return prevTranings;     
          return {
              ...prevTranings,
              [trainingKey]: {
                  ...prevTranings[trainingKey],
                  trainer: value,
                  modified: true,
              },
          };
        });
    };
     const handleDescriptionChange = (e, id) => {
        setTrainings((prevTranings) => {
          const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
          if (!trainingKey) return prevTranings;     
          return {
              ...prevTranings,
              [trainingKey]: {
                  ...prevTranings[trainingKey],
                  description: e.target.value,
                  modified: true,
              },
          };
        });
    };
    const handleNbOfParticipantsChange = (e, id) => {
        setTrainings((prevTranings) => {
          const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === id);
          if (!trainingKey) return prevTranings;     
          return {
              ...prevTranings,
              [trainingKey]: {
                  ...prevTranings[trainingKey],
                  nbOfParticipants: parseInt(e.target.value),
                  modified: true,
              },
          };
        });
    };
    const handleSessionNameChange = (e, tid, sid) => {
      setTrainings((prevTranings) => {
        const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === tid);
        if (!trainingKey) return prevTranings;
        return {
            ...prevTranings,
            [trainingKey]: {
                ...prevTranings[trainingKey],
                sessions: prevTranings[trainingKey].sessions.map((session) => {
                    if (session._id === sid) {
                        return {
                            ...session,
                            name: e.target.value,
                        };
                    }
                    return session;
                }),
                modified: true,
            },
        };
      });
    };
    const handleSessionDateChange = (e, tid, sid) => {
        setTrainings((prevTranings) => {
          const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === tid);
          if (!trainingKey) return prevTranings;
          return {
              ...prevTranings,
              [trainingKey]: {
                  ...prevTranings[trainingKey],
                  sessions: prevTranings[trainingKey].sessions.map((session) => {
                      if (session._id === sid) {
                          return {
                              ...session,
                              date: e?.toISOString() || "",
                          };
                      }
                      return session;
                  }),
                  modified: true,
              },
          };
        });
    };
    const handleSessionDurationChange = (e, tid, sid) => {
    setTrainings((prevTranings) => {
        const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === tid);
        if (!trainingKey) return prevTranings;
        return {
            ...prevTranings,
            [trainingKey]: {
                ...prevTranings[trainingKey],
                sessions: prevTranings[trainingKey].sessions.map((session) => {
                    if (session._id === sid) {
                        return {
                            ...session,
                            duration: parseInt(e.target.value),
                        };
                    }
                    return session;
                }),
                modified: true,
            },
        };
    });
    };
    const handleSessionLocationChange = (e, tid, sid) => {
    setTrainings((prevTranings) => {
        const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === tid);
        if (!trainingKey) return prevTranings;
        return {
            ...prevTranings,
            [trainingKey]: {
                ...prevTranings[trainingKey],
                sessions: prevTranings[trainingKey].sessions.map((session) => {
                    if (session._id === sid) {
                        return {
                            ...session,
                            location: e.target.value,
                        };
                    }
                    return session;
                }),
                modified: true,
            },
        };
    });
    };
    const openSessionOtherLocation = (e, tid, sid) => {
        setTrainings((prevTranings) => {
            const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === tid);
            if (!trainingKey) return prevTranings;
            return {
                ...prevTranings,
                [trainingKey]: {
                    ...prevTranings[trainingKey],
                    sessions: prevTranings[trainingKey].sessions.map((session) => {
                        if (session._id === sid) {
                            return {
                                ...session,
                                otherSessionLocation: true,
                            };
                        }
                        return session;
                    }),
                    modified: true,
                },
            };
        });
    };
    const closeSessionOtherLocation = (e, tid, sid) => {
        setTrainings((prevTranings) => {
            const trainingKey = Object.keys(prevTranings).find(key => prevTranings[key]._id === tid);
            if (!trainingKey) return prevTranings;
            return {
                ...prevTranings,
                [trainingKey]: {
                    ...prevTranings[trainingKey],
                    sessions: prevTranings[trainingKey].sessions.map((session) => {
                        if (session._id === sid) {
                            return {
                                ...session,
                                otherSessionLocation: false,
                            };
                        }
                        return session;
                    }),
                    modified: true,
                },
            };
        });
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
                sx={{...buttonStyle, backgroundColor : "#E0E0E0"}}
                onClick={() => setSelectedFiler("scheduled")}
            >
            {selectedFilter === "scheduled" && (
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
                15<br/>{t("scheduled")}
            </Button>
            <Button 
            sx={{
                ...buttonStyle,
                backgroundColor: "#90CAF9",
                position: "relative",
            }}
            onClick={() => setSelectedFiler("in_progress")}
            >
            {selectedFilter === "in_progress" && (
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
            11
            <br />
            {t("in_progress")}{selectedFilter === "in_progress" ? "." : null}
            </Button>
            <Button 
                sx={{...buttonStyle, backgroundColor:"#A5D6A7"}}
                onClick={() => setSelectedFiler("completed")}
            >
            {selectedFilter === "completed" && (
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
                40<br/>{t("completed")}
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
                    <Tooltip title={t("add_training")} arrow> 
                        <IconButton color="primary" aria-label="add" size="small" 
                                sx={{ borderRadius: '50%'}} onClick={showNewTrainingForm}>
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
                    <Dialog
                        open={newTraining}
                        onClose={hideNewTrainingForm}
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
                        <DialogTitle>{t("add_new_training")}</DialogTitle>
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
                            <FormControl variant="outlined" sx={{ 
                            width: '50%',
                            }}
                            >
                                <InputLabel required>{t("title")}</InputLabel>
                                <OutlinedInput
                                    value={newTrainingTitle}
                                    onChange={(e) => setNewTrainingTitle(e.target.value)}
                                    label="Title......."
                                />
                            </FormControl>
                            <TextField
                                select
                                label={t("month")}
                                value={newTrainingMonth}
                                onChange={(e) => setNewTrainingMonth(e.target.value)}
                                sx={{
                                    width: '50%',
                                }}
                                >
                                {TrainingMonths.map((month) => (
                                    <MenuItem key={month} value={month}>
                                        {t(month)}
                                    </MenuItem>
                                ))}
                            </TextField>
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
                                select
                                label={t("skill")}
                                value={newTrainingSkillType}
                                onChange={(e) => setNewTrainingSkillType(e.target.value)}
                                sx={{
                                    width: '50%',
                                }}
                                >
                                {TrainingSkillTypes.map((skillType) => (
                                    <MenuItem key={skillType} value={skillType}>
                                        {t(skillType)}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <FormControl variant="outlined" sx={{ width: "50%" }}>
                                <InputLabel required>{t("date")}</InputLabel>
                                <OutlinedInput
                                readOnly
                                value={newTrainingDate}
                                onChange={(e) => setNewTrainingDate(e.target.value)}
                                label="Date......."
                                endAdornment={
                                    <InputAdornment position="end">
                                    <IconButton onClick={handleOpenDatePicker} edge="end">
                                        <CalendarTodayIcon />
                                    </IconButton>
                                    </InputAdornment>
                                }
                                />
                            </FormControl>
                            <Popover
                                open={Boolean(dateAnchorEl)}
                                anchorEl={dateAnchorEl}
                                onClose={handleCloseDatePicker}
                                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                            >
                                <StaticDatePicker
                                displayStaticWrapperAs="desktop"
                                views={["day"]}
                                minDate={dayjs(getMonthDate(newTrainingMonth)).startOf("month")}
                                maxDate={dayjs(getMonthDate(newTrainingMonth)).endOf("month")}
                                onChange={handleDateChange}
                                sx={{
                                    "& .MuiPickersDay-root": {
                                    backgroundColor: "transparent !important",
                                    "&.Mui-selected": {
                                        backgroundColor: "transparent !important",
                                        color: "inherit",
                                    },
                                    "&:hover": {
                                        backgroundColor: "#f0f0f0 !important",
                                    },
                                    },
                                }}
                                />
                            </Popover>
                            </LocalizationProvider>
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
                            <FormControl variant="outlined" 
                            sx={{ 
                                width: '50%',
                            }}
                            >
                                <InputLabel required>{t("nbOfHours")}</InputLabel>
                                <OutlinedInput
                                type="number"
                                    value={newTrainingNbOfHours}
                                    onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
                                        setNewTrainingNbOfHours(value);
                                    }
                                    }}
                                    label="Number Of Hours......."
                                />
                            </FormControl>
                            <TextField
                                select={!otherLocation  && (TrainingLocations.includes(newTrainingLocation) || newTrainingLocation === "")}
                                label={t("location")}
                                value={newTrainingLocation}
                                onChange={(e) => setNewTrainingLocation(e.target.value)}
                                sx={{
                                    width: '50%',
                                }}
                                >
                                {TrainingLocations.map((location) => (
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
                                        setOtherLocation(true)}
                                >
                                    {t("other")}...
                                </Button>
                            </TextField>
                            <Dialog
                                open={otherLocation}
                                onClose={() => setOtherLocation(false)}
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
                                        value={newTrainingLocation}
                                        onChange={(e) => setNewTrainingLocation(e.target.value)
                                         }
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
                                        setOtherLocation(false);
                                    }}
                                >
                                    {t("save")}
                                </Button>
                            </Dialog>
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
                                select
                                label={t("mode")}
                                value={newTrainingMode}
                                onChange={(e) => setNewTrainingMode(e.target.value)}
                                sx={{
                                    width: '50%',
                                }}
                                >
                                {TrainingModes.map((mode) => (
                                    <MenuItem key={mode} value={mode}>
                                        {t(mode)}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label={t("type")}
                                value={newTrainingType}
                                onChange={(e) => setNewTrainingType(e.target.value)}
                                sx={{
                                    width: '50%',
                                }}
                                >
                                {TrainingTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {t(type)}
                                    </MenuItem>
                                ))}
                            </TextField>
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
                            <FormControl variant="outlined" 
                            sx={{ 
                                width: '50%',
                            }}
                            >
                                <InputLabel required>{t("nbOfSessions")}</InputLabel>
                                <OutlinedInput
                                type="number"
                                    value={newTrainingNbOfSessions}
                                    onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === "" || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
                                        setNewTrainingNbOfSessions(value);
                                    };
                                    setOtherSessionsLocations(Array.from({ length: Number(value) }, () => false));
                                    }}
                                    label="Number Of Sessions......."
                                />
                            </FormControl>
                            <Autocomplete
                            sx={{ width: '50%',}}
                            options={TrainingTrainers}
                            getOptionLabel={(option) => option.name}
                            value={TrainingTrainers.find(trainer => trainer.id === newTrainingTrainer) || null}
                            onChange={(event, newValue) => setNewTrainingTrainer(newValue ? newValue.id : "")}
                            renderInput={(params) => (
                                <TextField 
                                {...params} 
                                label={t("trainer")} 
                                variant="outlined"
                                sx={{ width: "100%" }} 
                                />
                            )}
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
                        <FormControl variant="outlined" 
                            sx={{ 
                            width: '50%',
                            }}
                        >
                            <InputLabel required>{t("nbOfParticipants")}</InputLabel>
                            <OutlinedInput
                            type="number"
                            value={newTrainingNbOfParticipants}
                            onChange={(e) => setNewTrainingNbOfParticipants(e.target.value)}
                            label="Number Of Participants......."
                            />
                        </FormControl>
                        <FormControl variant="outlined" 
                            sx={{ 
                            width: '50%',
                            }}
                        >
                            <InputLabel required>{t("description")}</InputLabel>
                            <OutlinedInput
                            multiline
                            type="text"
                            value={newTrainingDescription}
                            onChange={(e) => setNewTrainingDescription(e.target.value)}
                            label="Description......."
                            />
                        </FormControl>
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
                            {Array.from({ length: newTrainingNbOfSessions }, (_, index) => (
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
                                        <FormControl variant="outlined" 
                                        sx={{ 
                                        width: '50%',
                                        }}
                                        >
                                            <InputLabel required>{t("name")}</InputLabel>
                                            <OutlinedInput
                                            value={newSessionsNames[index]}
                                            onChange={(e) =>
                                                setNewSessionsNames((prevSessions) => {
                                                    const updatedSessions = [...prevSessions]; 
                                                    updatedSessions[index] = e.target.value; 
                                                    return updatedSessions; 
                                                })
                                            }
                                            label="Name......."
                                            />
                                        </FormControl>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DateTimePicker
                                            sx={{ 
                                            width: '50%',
                                            }}
                                            disableScrollLock={true}
                                            shouldDisableDate={(date) => {
                                            const dayOfMonth = date.date();
                                            return !selectedDays.includes(dayOfMonth); 
                                            }}
                                            minDate={dayjs(getMonthDate(newTrainingMonth)).startOf("month")}
                                            maxDate={dayjs(getMonthDate(newTrainingMonth)).endOf("month")}
                                            label={t("date")}
                                            value={newSessionsDates[index] ? dayjs(newSessionsDates[index]) : null}
                                            onChange={(dateTime) => {
                                            if (dateTime) {
                                                setNewSessionsDates((prevDates) => {
                                                const updatedDates = [...prevDates];
                                                updatedDates[index] = dateTime.format("YYYY-MM-DD HH:mm");
                                                return updatedDates;
                                                });
                                            }
                                            }}
                                        />
                                        </LocalizationProvider>
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
                                        <FormControl variant="outlined" 
                                        sx={{ 
                                        width: '50%',
                                        }}
                                        >
                                        <InputLabel required>{t("duration")}</InputLabel>
                                        <OutlinedInput
                                            type="number"
                                            value={newSessionsDurations[index]}
                                            onChange={(e) =>
                                                setNewSessionsDurations((prevSessions) => {
                                                    const updatedSessions = [...prevSessions]; 
                                                    updatedSessions[index] = e.target.value; 
                                                    return updatedSessions; 
                                                })
                                            }
                                            label="Duration......."
                                        />
                                        </FormControl>
                                        <TextField
                                            select={!otherSessionsLocations[index] && (TrainingLocations.includes(newSessionsLocations[index]) || !newSessionsLocations[index])}
                                            label={t("location")}
                                            value={newSessionsLocations[index]}
                                            onChange={(e) => setNewSessionsLocations((prevSessions) => {
                                                const updatedSessions = [...prevSessions]; 
                                                updatedSessions[index] = e.target.value; 
                                                return updatedSessions; 
                                            })}
                                            sx={{
                                                width: '50%',
                                            }}
                                            >
                                            {TrainingLocations.map((location) => (
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
                                                setOtherSessionsLocations((prevLocations) => {
                                                    const updatedLocations = [...prevLocations];
                                                    updatedLocations[index] = true; 
                                                    return updatedLocations;
                                                })
                                            }
                                        >
                                            {t("other")}...
                                        </Button>
                                        </TextField>
                                        <Dialog
                                            open={Boolean(otherSessionsLocations[index])}
                                            onClose={() => 
                                                setOtherSessionsLocations((prevLocations) => {
                                                    const updatedLocations = [...prevLocations];
                                                    updatedLocations[index] = false; 
                                                    return updatedLocations;
                                                })
                                            }
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
                                            <FormControl variant="outlined" sx={{ width: '200px' }}>
                                                <InputLabel required>{t("location")}</InputLabel>
                                                <OutlinedInput
                                                    value={newSessionsLocations[index] || ""} 
                                                    onChange={(e) => setNewSessionsLocations((prevSessions) => {
                                                        const updatedSessions = [...prevSessions]; 
                                                        updatedSessions[index] = e.target.value; 
                                                        return updatedSessions; 
                                                    })}
                                                    label="Activity ................"
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
                                                onClick={() => 
                                                    setOtherSessionsLocations((prevLocations) => {
                                                        const updatedLocations = [...prevLocations];
                                                        updatedLocations[index] = false; 
                                                        return updatedLocations;
                                                    })
                                                }
                                            >
                                                {t("save")}
                                            </Button>
                                        </Dialog>
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
                        onClick={hideNewTrainingForm}>
                            {t("cancel")}
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
                        onClick={handleAddTraining}>
                            {t("add")}
                        </Button>
                        </Box>
                    </Dialog>
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
                            <MenuItem key={trainer.id} value={trainer.id}>
                                {t(trainer.name)}
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
                        paddingRight: '25px',
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
                        <DialogTitle>{t("confirm_update_all_trainings")}?</DialogTitle>
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
                            onClick={handleUpdateAllTrainings}
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
                        <DialogTitle>{t("confirm_delete_all_trainings")}?</DialogTitle>
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
                            onClick={handleDeleteAllTrainings}
                            >
                                {t("yes")}
                            </Button>
                        </Box>
                    </Dialog>
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
                        <TextField
                            variant="outlined"
                            required
                            placeholder={t("title")}
                            size="small"
                            value={training.title}
                            sx={{
                            width: "100%",
                            height: "auto",
                            "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                            }}
                            onChange={(e) => handleTitleChange(e, training._id)}
                        />
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
                            sx={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "start",
                                alignItems: 'center',
                                gap: '5px',
                            }}
                            >
                            <TextField variant="outlined" required placeholder={t("Name")} value={session.name} sx={{width:"25%"}} 
                            onChange={(e) => handleSessionNameChange(e, training._id, session._id)}
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                sx={{ 
                                    width: '25%',
                                }}
                                disableScrollLock={true}
                                label={t("date")}
                                value={dayjs(session.date)}
                                onChange={(e) => handleSessionDateChange(e, training._id, session._id)}
                                />
                            </LocalizationProvider>
                            <FormControl variant="outlined" sx={{width:"25%"}}>
                                <OutlinedInput
                                    type='Number'
                                    value={session.duration}
                                    onChange={(e) => handleSessionDurationChange(e, training._id , session._id)}
                                />
                            </FormControl>
                            <TextField
                                select={!session.otherSessionLocation && (TrainingLocations.includes(session.location) || !session.location)}
                                value={session.location}
                                onChange={(e) => handleSessionLocationChange(e, training._id , session._id)}
                                sx={{
                                    width: '25%',
                                }}
                                SelectProps={{
                                    MenuProps: {
                                    disableScrollLock: true, 
                                    }
                                }}
                                >
                                {TrainingLocations.map((location) => (
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
                                    onClick={(e) => openSessionOtherLocation(e, training._id, session._id)
                                    }
                                >
                                    {t("other")}...
                                </Button>
                            </TextField>
                            <Dialog
                                open={session.otherSessionLocation}
                                onClose={(e) => closeSessionOtherLocation(e, training._id, session._id)
                                }
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
                                <FormControl variant="outlined" sx={{ width: '200px' }}>
                                    <InputLabel required>{t("location")}</InputLabel>
                                    <OutlinedInput
                                        value={session.location}
                                        onChange={(e) => handleSessionLocationChange(e, training._id , session._id)}
                                        label="Activity ................"
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
                                    onClick={ 
                                        (e) => closeSessionOtherLocation(e, training._id, session._id)
                                    }
                                >
                                    {t("save")}
                                </Button>
                            </Dialog>
                            <Box
                            sx={{
                                marginRight: '10px',
                                width: "10px",
                                height: "10px", 
                                backgroundColor: getSessionColor(session,time),
                                borderRadius: "50%",
                            }}
                            />
                            </Box>
                        ))}
                        </Box> 
                        <FormControl variant="outlined" sx={{width:"15%"}}>
                            <OutlinedInput
                                type='Number'
                                value={training.nbOfParticipants}
                                onChange={(e) => handleNbOfParticipantsChange(e, training._id)}
                            />
                        </FormControl>
                        <Box 
                        sx={{width:'10%', display:"flex", flexDirection:"row", justifyContent:"end"}}
                        >
                            <Tooltip title={t("view_details")} arrow> 
                                <IconButton sx={{color:"#76C5E1"}}  onClick={() => {showUpdateTrainingForm(training._id);
                                    setSelectedTrainingNbOfSessions(getTrainingById(training._id)?.nbOfSessions || 0);
                                }}>
                                    <RemoveRedEyeIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("save")} arrow>
                                <IconButton sx={{color:"#76C5E1"}} disabled={!training.modified} onClick={() => showVerifyUpdateDialog(training._id)}>
                                    <SaveIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("delete")} arrow> 
                                <IconButton sx={{color:"#EA9696"}} onClick={() => showVerifyDeleteDialog(training._id)}>
                                    <DeleteIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                ))}
            </Box>
            <Dialog
            open={verifyUpdate}
            disableScrollLock={true}
            onClose={hideVerifyUpdateDialog}
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
            <DialogTitle>{t("confirm_update_training")}?</DialogTitle>
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
                onClick={hideVerifyUpdateDialog}>
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
                onClick={() => handleUpdateTraining(selectedTrainingId)}>
                    {t("yes")}
                </Button>
            </Box>
            </Dialog>
            <Dialog
            open={verifyDelete}
            disableScrollLock={true}
            onClose={hideVerifyDeleteDialog}
            PaperProps={{
                sx: {
                    width: "auto",  
                    height: "auto", 
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "",
                    alignItems: "center",
                    borderRadius: "10px",
                    padding: '20px',
                }
            }}
        >
            <DialogTitle>{t("confirm_delete_training")}?</DialogTitle>
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
                onClick={hideVerifyDeleteDialog}>
                    {t("no")}
                </Button>
                <Button sx={{
                    color: 'white',
                    backgroundColor: '#2CA8D5',
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
                onClick={() => handleDeleteTraining(selectedTrainingId)}>
                    {t("yes")}
                </Button>
            </Box>
            </Dialog>
            <Dialog
                open={updateTraining}
                onClose={hideUpdateTrainingForm}
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
                <DialogTitle>{t("update_training")}</DialogTitle>
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
                    <FormControl variant="outlined" sx={{ 
                    width: '50%',
                    }}
                    >
                        <InputLabel required>{t("title")}</InputLabel>
                        <OutlinedInput
                            value={getTrainingById(selectedTrainingId)?.title}
                            onChange={(e) => handleTitleChange(e, selectedTrainingId)}
                            label="Title......."
                        />
                    </FormControl>
                    <TextField
                        select
                        label={t("month")}
                        value={getTrainingById(selectedTrainingId)?.month}
                        onChange={(e) => handleMonthChange(e, selectedTrainingId)}
                        sx={{
                            width: '50%',
                        }}
                        >
                        {TrainingMonths.map((month) => (
                            <MenuItem key={month} value={month}>
                                {t(month)}
                            </MenuItem>
                        ))}
                    </TextField>
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
                        select
                        label={t("skill")}
                        value={getTrainingById(selectedTrainingId)?.skillType}
                        onChange={(e) => handleSkillTypeChange(e, selectedTrainingId)}
                        sx={{
                            width: '50%',
                        }}
                        >
                        {TrainingSkillTypes.map((skillType) => (
                            <MenuItem key={skillType} value={skillType}>
                                {t(skillType)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <FormControl variant="outlined" sx={{ width: "50%" }}>
                        <InputLabel required>{t("date")}</InputLabel>
                        <OutlinedInput
                        readOnly
                        value={getTrainingById(selectedTrainingId)?.date}
                        onChange={(e) => handleTrainingDateChange(e, selectedTrainingId)}
                        label="Date......."
                        endAdornment={
                            <InputAdornment position="end">
                            <IconButton onClick={handleOpenDatePicker} edge="end">
                                <CalendarTodayIcon />
                            </IconButton>
                            </InputAdornment>
                        }
                        />
                    </FormControl>
                    <Popover
                        open={Boolean(dateAnchorEl)}
                        anchorEl={dateAnchorEl}
                        onClose={handleCloseDatePicker}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    >
                        <StaticDatePicker
                        displayStaticWrapperAs="desktop"
                        views={["day"]}
                        minDate={dayjs(getMonthDate(getTrainingById(selectedTrainingId)?.month)).startOf("month")}
                        maxDate={dayjs(getMonthDate(getTrainingById(selectedTrainingId)?.month)).endOf("month")}
                        onChange={(newValue) => handleUpdateDateChange(newValue , selectedTrainingId)}
                        sx={{
                            "& .MuiPickersDay-root": {
                            backgroundColor: "transparent !important",
                            "&.Mui-selected": {
                                backgroundColor: "transparent !important",
                                color: "inherit",
                            },
                            "&:hover": {
                                backgroundColor: "#f0f0f0 !important",
                            },
                            },
                        }}
                        />
                    </Popover>
                    </LocalizationProvider>
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
                    <FormControl variant="outlined" 
                    sx={{ 
                        width: '50%',
                    }}
                    >
                        <InputLabel required>{t("nbOfHours")}</InputLabel>
                        <OutlinedInput
                        type="number"
                            value={getTrainingById(selectedTrainingId)?.nbOfHours}
                            onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
                                handleNbOfHoursChange(e, selectedTrainingId);
                            }
                            }}
                            label="Number Of Hours......."
                        />
                    </FormControl>
                    <TextField
                        select={!otherUpdateLocation  && (TrainingLocations.includes(getTrainingById(selectedTrainingId)?.location) || getTrainingById(selectedTrainingId)?.location === "")}
                        label={t("location")}
                        value={getTrainingById(selectedTrainingId)?.location}
                        onChange={(e) => handleLocationChange(e, selectedTrainingId)}
                        sx={{
                            width: '50%',
                        }}
                        >
                        {TrainingLocations.map((location) => (
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
                                setOtherUpdateLocation(true)}
                        >
                            {t("other")}...
                        </Button>
                    </TextField>
                    <Dialog
                        open={otherUpdateLocation}
                        onClose={() => setOtherUpdateLocation(false)}
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
                                value={getTrainingById(selectedTrainingId)?.location}
                                onChange={(e) => handleLocationChange(e, selectedTrainingId)}
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
                                setOtherUpdateLocation(false);
                            }}
                        >
                            {t("save")}
                        </Button>
                    </Dialog>
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
                        select
                        label={t("mode")}
                        value={getTrainingById(selectedTrainingId)?.mode}
                        onChange={(e) => handleModeChange(e, selectedTrainingId)}
                        sx={{
                            width: '50%',
                        }}
                        >
                        {TrainingModes.map((mode) => (
                            <MenuItem key={mode} value={mode}>
                                {t(mode)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label={t("type")}
                        value={getTrainingById(selectedTrainingId)?.type}
                        onChange={(e) => handleTypeChange(e, selectedTrainingId)}
                        sx={{
                            width: '50%',
                        }}
                        >
                        {TrainingTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {t(type)}
                            </MenuItem>
                        ))}
                    </TextField>
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
                    <FormControl variant="outlined" 
                    sx={{ 
                        width: '50%',
                    }}
                    >
                        <InputLabel required>{t("nbOfSessions")}</InputLabel>
                        <OutlinedInput
                        type="number"
                            value={getTrainingById(selectedTrainingId)?.nbOfSessions}
                            onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
                                handleNbOfSessionsChange(e, selectedTrainingId)
                            };
                            }}
                            label="Number Of Sessions......."
                        />
                    </FormControl>
                    <Autocomplete
                    sx={{ width: '50%',}}
                    options={TrainingTrainers}
                    getOptionLabel={(option) => option.name}
                    value={TrainingTrainers.find(trainer => trainer.id === getTrainingById(selectedTrainingId)?.trainer) || null}
                    onChange={(event, newValue) => handleTrainerChange(newValue ? newValue.id : "",selectedTrainingId)}
                    renderInput={(params) => (
                        <TextField 
                        {...params} 
                        label={t("trainer")} 
                        variant="outlined"
                        sx={{ width: "100%" }} 
                        />
                    )}
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
                <FormControl variant="outlined" 
                    sx={{ 
                    width: '50%',
                    }}
                >
                    <InputLabel required>{t("nbOfParticipants")}</InputLabel>
                    <OutlinedInput
                    type="number"
                    value={getTrainingById(selectedTrainingId)?.nbOfParticipants}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || (Number(value) >= 0 && Number.isInteger(Number(value)))) {
                            handleNbOfParticipantsChange(e, selectedTrainingId)
                        };
                    }}
                    label="Number Of Participants......."
                    />
                </FormControl>
                <FormControl variant="outlined" 
                    sx={{ 
                    width: '50%',
                    }}
                >
                    <InputLabel required>{t("description")}</InputLabel>
                    <OutlinedInput
                    multiline
                    type="text"
                    value={getTrainingById(selectedTrainingId)?.description}
                    onChange={(e) => handleDescriptionChange(e, selectedTrainingId)}
                    label="Description......."
                    />
                </FormControl>
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
                                <FormControl variant="outlined" 
                                sx={{ 
                                width: '50%',
                                }}
                                >
                                    <InputLabel required>{t("name")}</InputLabel>
                                    <OutlinedInput
                                    value={
                                        getTrainingById(selectedTrainingId)?.sessions[index]?.name ??
                                        newSessionsNames[index]
                                    }
                                    onChange={(e) => {
                                        const training = getTrainingById(selectedTrainingId);
                                        const session = training?.sessions[index];
                                    
                                        if (session) {
                                        handleSessionNameChange(e, selectedTrainingId, session._id);
                                        } else {
                                        setNewSessionsNames((prevSessions) => {
                                            const updatedSessions = [...prevSessions];
                                            updatedSessions[index] = e.target.value;
                                            return updatedSessions;
                                        });
                                        }
                                    }}
                                    label="Name......."
                                    />
                                </FormControl>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    sx={{ 
                                    width: '50%',
                                    }}
                                    label={t("date")}
                                    shouldDisableDate={(date) => {
                                        const dayOfMonth = date.date();
                                        return !selectedUpdateDays.includes(dayOfMonth); 
                                    }}
                                    minDate={dayjs(getMonthDate(getTrainingById(selectedTrainingId)?.month)).startOf("month")}
                                    maxDate={dayjs(getMonthDate(getTrainingById(selectedTrainingId)?.month)).endOf("month")}
                                    value={
                                        getTrainingById(selectedTrainingId)?.sessions[index]?.date
                                          ? dayjs(getTrainingById(selectedTrainingId)?.sessions[index]?.date)
                                          : newSessionsDates[index]
                                      }
                                      onChange={(dateTime) => {
                                        const training = getTrainingById(selectedTrainingId);
                                        const session = training?.sessions[index];
                                      
                                        if (session) {
                                          handleSessionDateChange(dateTime, selectedTrainingId, session._id);
                                        } else {
                                          setNewSessionsDates((prevDates) => {
                                            const updatedDates = [...prevDates];
                                            updatedDates[index] = dateTime;
                                            return updatedDates;
                                          });
                                        }
                                      }}
                                      
                                />
                                </LocalizationProvider>
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
                                <FormControl variant="outlined" 
                                sx={{ 
                                width: '50%',
                                }}
                                >
                                <InputLabel required>{t("duration")}</InputLabel>
                                <OutlinedInput
                                    type="number"
                                    value={
                                        getTrainingById(selectedTrainingId)?.sessions[index]?.duration ??
                                        newSessionsDurations[index]
                                      }
                                      onChange={(e) => {
                                        const training = getTrainingById(selectedTrainingId);
                                        const session = training?.sessions[index];
                                      
                                        if (session) {
                                          handleSessionDurationChange(e, selectedTrainingId, session._id);
                                        } else {
                                          setNewSessionsDurations((prevDurations) => {
                                            const updatedDurations = [...prevDurations];
                                            updatedDurations[index] = e.target.value;
                                            return updatedDurations;
                                          });
                                        }
                                      }}
                                      
                                    label="Duration......."
                                />
                                </FormControl>
                                <TextField
                                    select={!otherSessionsUpdateLocations[index] && (TrainingLocations.includes(getTrainingById(selectedTrainingId)?.sessions[index]?.location) || !getTrainingById(selectedTrainingId)?.sessions[index]?.location)}
                                    label={t("location")}
                                    value={
                                        getTrainingById(selectedTrainingId)?.sessions[index]?.location ??
                                        newSessionsLocations[index]
                                      }
                                      onChange={(e) => {
                                        const training = getTrainingById(selectedTrainingId);
                                        const session = training?.sessions[index];
                                      
                                        if (session) {
                                          handleSessionLocationChange(e, selectedTrainingId, session._id);
                                        } else {
                                          setNewSessionsLocations((prevLocations) => {
                                            const updatedLocations = [...prevLocations];
                                            updatedLocations[index] = e.target.value;
                                            return updatedLocations;
                                          });
                                        }
                                      }}
                                    sx={{
                                        width: '50%',
                                    }}
                                    >
                                    {TrainingLocations.map((location) => (
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
                                            setOtherSessionsUpdateLocations((prevLocations) => {
                                                const updatedLocations = [...prevLocations];
                                                updatedLocations[index] = true; 
                                                return updatedLocations;
                                            })
                                        }
                                    >
                                        {t("other")}...
                                    </Button>
                                </TextField>
                                <Dialog
                                    open={Boolean(otherSessionsUpdateLocations[index])}
                                    onClose={() => 
                                        setOtherSessionsUpdateLocations((prevLocations) => {
                                            const updatedLocations = [...prevLocations];
                                            updatedLocations[index] = false; 
                                            return updatedLocations;
                                        })
                                    }
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
                                    <FormControl variant="outlined" sx={{ width: '200px' }}>
                                        <InputLabel required>{t("location")}</InputLabel>
                                        <OutlinedInput
                                            value={getTrainingById(selectedTrainingId)?.sessions[index]?.location}
                                            onChange={(e) => handleSessionLocationChange(e, selectedTrainingId, getTrainingById(selectedTrainingId)?.sessions[index]?._id)}
                                            label="Activity ................"
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
                                        onClick={() => 
                                            setOtherSessionsUpdateLocations((prevLocations) => {
                                                const updatedLocations = [...prevLocations];
                                                updatedLocations[index] = false; 
                                                return updatedLocations;
                                            })
                                        }
                                    >
                                        {t("save")}
                                    </Button>
                                </Dialog>
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
                onClick={hideUpdateTrainingForm}>
                    {t("cancel")}
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
                onClick={() => {
                    handleUpdateTraining(selectedTrainingId);
                    hideUpdateTrainingForm();
                }}>
                    {t("save")}
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

export default ManageSessions;
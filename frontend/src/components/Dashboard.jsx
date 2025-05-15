import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Button, Tooltip, IconButton, Rating,
  TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody,OutlinedInput,InputLabel,FormControl,
  DialogTitle,Dialog,MenuItem,TextField
 } from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useLanguage } from "../languagecontext";
import * as echarts from 'echarts';
import { Divider } from '@mui/material';
import api from "../api";
import dayjs from "dayjs";
import * as htmlToImage from 'html-to-image';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavbar } from '../NavbarContext';
import { useUser } from '../UserContext';

const Navbar = () => {

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

    const paperStyle = {
      width: "50%",
      height: '400px',
      boxSizing: 'border-box',
      backgroundColor: "background.paper",
      display: "flex",
      flexDirection: "column",
      alignItems: "start",
      justifyContent: "start",
      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
      borderRadius: '10px',
      padding:"20px",
    }

    const filterStyle = {
      color: 'black',
      backgroundColor: 'button.tertiary',
      borderRadius: '10px',
      textDecoration: 'none',
      textAlign: 'start',
      fontWeight: 'bold',
      fontSize: '14px',
      lineHeight: 1.2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '120px',
      height: '60px',
      fontWeight: 'bold',
      textTransform: "none",
      '&:hover': {
        backgroundColor: '#76C5E1',
      }
    };

    const subButtonStyle = (v) => ({
      color: 'text.primary',
      backgroundColor: v === statView ? 'button.primary' :'button.tertiary',
      borderRadius: '10px',
      textDecoration: 'none',
      textAlign: 'start',
      fontWeight: 'bold',
      fontSize: '16px',
      lineHeight: 1.2,
      display: 'flex',
      justifyContent: 'start',
      alignItems: 'center',
      width: '70%',
      height: '50px',
      fontWeight: 'bold',
      textTransform: "none",
      padding: '10px 20px',
      '&:hover': {
        backgroundColor: '#76C5E1',
      }
    });

    // ..............

    const { t } = useLanguage(); 
    const { user } = useUser();
    const monthMap = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11
    };
    
    const {selectedRole} = useNavbar();

    const [view, setView] = useState("trainings");
    const [statView, setStatView] = useState("charts");
    const [startMonth, setStartMonth] = useState(null);
    const [endMonth, setEndMonth] = useState(null); 

    //Export To Word
    const [fileName, setFileName] = useState("");
    const [exportWord, setExportWord] = useState(false);

    const showExportWord = () => {
      setExportWord(true);
    };

    const hideExportWord = () => {
      setExportWord(false);
    };

    const exportToWord = async () => {
      try {
        const sectionIds = ['section1', 'section2', 'section3','section4','section5','section6','section7']; 

        const imagesWithSizes = await Promise.all(
          sectionIds.map(async (id) => {
            const section = document.getElementById(id);
            if (section) {
              const rect = section.getBoundingClientRect();
              const image = await htmlToImage.toPng(section);
              return { image, width: rect.width, height: rect.height, id };
            }
            return null;
          })
        );
   
        const validImages = imagesWithSizes.filter(item => item !== null);
    
        const html = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                xmlns:w='urn:schemas-microsoft-com:office:word'>
          <head>
            <title>Training Recap</title>
            <style>
              body { font-family: Arial; margin: 0; padding: 20px; }
              h1 { text-align: center; }
              .page { page-break-after: always; }
              img {
                display: block;
                max-width: 100%;
                height: auto;
                object-fit: contain;
              }
            </style>
          </head>
          <body>
            <h1>EMV Training Recap</h1>
            ${validImages.map(({ image, width, height, id }, i) => {
              const scaleWidthFactor = 1; 
              const scaleHeightFactor = 1;
              const newWidth = width * scaleWidthFactor;
              const newHeight = height * scaleHeightFactor;
              return `
                <div class="${i < validImages.length - 1 ? 'page' : 'last-page'}">
                  <img src="${image}" width="${newWidth}" height="${newHeight}" />
                </div>
              `;
            }).join('')}
          </body>
          </html>
        `;

        const blob = new Blob(['\ufeff', html], { 
          type: 'application/msword' 
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        hideExportWord();
        
      } catch (error) {
        console.error('Export failed:', error);
      }
    };

        
    // Filters ................
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [registFilter, setRegistFilter] = useState("all");
  
    // Refs for charts
    const skillTypeChart = useRef(null);
    const hoursChart = useRef(null);
    const genderChart = useRef(null);
    const activityChart = useRef(null);
    const gradeChart = useRef(null);
    const regisChart = useRef(null);
    const trainingsByMonthChart = useRef(null);
    const traineesByMonthChart = useRef(null);

  
    // State for all data
    const [rawData, setRawData] = useState({
      trainings: [],
      sessions: [],
      users: [],
      feedbacks: {}
    });
  
    // State for filtered data
    const [filteredData, setFilteredData] = useState({
      trainings: [],
      sessions: [],
      users: []
    });
  
    // State for metrics
    const [metrics, setMetrics] = useState({
      // Training counts
      numberOfTrainings: 0,
      numberOfSoftSkillsTrainings: 0,
      numberOfInternTechnicalSkillsTrainings: 0,
      numberOfExternTechnicalSkillsTrainings: 0,
      numberOfFTFTrainings: 0,
      numberOfOnlineTrainings: 0,
      numberOfSatisfactorilyEvaluatedTrainings: 0,
  
      // Hours
      numberOfSoftSkillsHours: 0,
      numberOfTechnicalSkillsHours: 0,
      numberOfAttendedHours: 0,
  
      // Participants
      numberOfTrainees: 0,
      numberOfParticipants: 0,
      numberOfTrainedEmployees: 0,
      numberOfEmployees: 0,
      numberOfInternalTrainers: 0,
  
      // Requests
      numberOfReq: 0,
      numberOfApproved: 0,
      numberOfConfirmed: 0,
      numberOfScheduled: 0,
      numberOfInProgress: 0,
      numberOfCompleted: 0,
      requestsPerMonth: Array(12).fill(0),
  
      // Rates
      rateOfConfirmedMale: 0,
      rateOfConfirmedFemale: 0,
      rateOfEnablersConfirmedActivity: 0,
      rateOfMechanicalConfirmedActivity: 0,
      rateOfInformationSystemsConfirmedActivity: 0,
      rateOfDataboxConfirmedActivity: 0,
      rateOfTelecomConfirmedActivity: 0,
      rateOfQualityConfirmedActivity: 0,
      rateOfEpaysysConfirmedActivity: 0,
      rateOfMediaAndEnergyConfirmedActivity: 0,
      rateOfElectronicsConfirmedActivity: 0,
      rateOfSpaceConfirmedActivity: 0,
      rateOfOtherConfirmedActivity: 0,
      rateOfF1ConfirmedGrade: 0,
      rateOfF2ConfirmedGrade: 0,
      rateOfF3ConfirmedGrade: 0,
      rateOfF4ConfirmedGrade: 0,
      rateOfM1ConfirmedGrade: 0,
      rateOfM2ConfirmedGrade: 0,
      rateOfM3ConfirmedGrade: 0,
      rateOfM4ConfirmedGrade: 0,
      rateOfM5ConfirmedGrade: 0,
      rateOfM6ConfirmedGrade: 0,
      rateOfL1ConfirmedGrade: 0,
      rateOfL2ConfirmedGrade: 0,
      rateOfL3ConfirmedGrade: 0,
      rateOfL4ConfirmedGrade: 0,
      rateOfEnablersActivity: 0,
      rateOfMechanicalActivity: 0,
      rateOfInformationSystemsActivity: 0,
      rateOfDataboxActivity: 0,
      rateOfTelecomActivity: 0,
      rateOfQualityActivity: 0,
      rateOfEpaysysActivity: 0,
      rateOfMediaAndEnergyActivity: 0,
      rateOfElectronicsActivity: 0,
      rateOfSpaceActivity: 0,
      rateOfOtherActivity: 0,
      rateOfF1Grade: 0,
      rateOfF2Grade: 0,
      rateOfF3Grade: 0,
      rateOfF4Grade: 0,
      rateOfM1Grade: 0,
      rateOfM2Grade: 0,
      rateOfM3Grade: 0,
      rateOfM4Grade: 0,
      rateOfM5Grade: 0,
      rateOfM6Grade: 0,
      rateOfL1Grade: 0,
      rateOfL2Grade: 0,
      rateOfL3Grade: 0,
      rateOfL4Grade: 0,
      numberOfEnablersTrainees : 0,
      numberOfMechanicalTrainees : 0,
      numberOfInformationSystemsTrainees : 0,
      numberOfDataboxTrainees : 0,
      numberOfQualityTrainees : 0,
      numberOfEpaysysTrainees : 0,
      numberOfMediaAndEnergyTrainees : 0,
      numberOfElectronicsTrainees : 0,
      numberOfSpaceTrainees : 0,
      numberOfTelecomTrainees : 0,
      numberOfOtherAct : 0,
      numberOfF1Trainees : 0,
      numberOfF2Trainees : 0,
      numberOfF3Trainees : 0,
      numberOfF4Trainees : 0,
      numberOfM1Trainees : 0,
      numberOfM2Trainees : 0,
      numberOfM3Trainees : 0,
      numberOfM4Trainees : 0,
      numberOfM5Trainees : 0,
      numberOfM6Trainees : 0,
      numberOfL1Trainees : 0,
      numberOfL2Trainees : 0,
      numberOfL3Trainees : 0,
      numberOfL4Trainees : 0,
      numberOfEnablersConfirmedTrainees : 0,
      numberOfMechanicalConfirmedTrainees : 0,
      numberOfInformationSystemsConfirmedTrainees : 0,
      numberOfDataboxConfirmedTrainees : 0,
      numberOfQualityConfirmedTrainees : 0,
      numberOfEpaysysConfirmedTrainees : 0,
      numberOfMediaAndEnergyConfirmedTrainees : 0,
      numberOfElectronicsConfirmedTrainees : 0,
      numberOfSpaceConfirmedTrainees : 0,
      numberOfTelecomConfirmedTrainees : 0,
      numberOfOtherConfirmedAct : 0,
      numberOfF1ConfirmedTrainees : 0,
      numberOfF2ConfirmedTrainees : 0,
      numberOfF3ConfirmedTrainees : 0,
      numberOfF4ConfirmedTrainees : 0,
      numberOfM1ConfirmedTrainees : 0,
      numberOfM2ConfirmedTrainees : 0,
      numberOfM3ConfirmedTrainees : 0,
      numberOfM4ConfirmedTrainees : 0,
      numberOfM5ConfirmedTrainees : 0,
      numberOfM6ConfirmedTrainees : 0,
      numberOfL1ConfirmedTrainees : 0,
      numberOfL2ConfirmedTrainees : 0,
      numberOfL3ConfirmedTrainees : 0,
      numberOfL4ConfirmedTrainees : 0,
    });

    const [completedTrainings, setCompletedTrainings] = useState([]);
    const [traineesData, setTraineesData] = useState({});
    const [allRequests, setAllRequests] = useState([]);
    const [trainedEmployees, setTrainedEmployees] = useState([]);
  
    // formatDaysWithMonth
    const formatDaysWithMonth = (dateString, month) => {
      if (!dateString) return "";
    
      const days = dateString.split(" ").map(Number);
  
      const getDayWithSuffix = (day) => {
        if (day >= 11 && day <= 13) return `${day}th`; 
        const lastDigit = day % 10;
        if (lastDigit === 1) return `${day}st`;
        if (lastDigit === 2) return `${day}nd`;
        if (lastDigit === 3) return `${day}rd`;
        return `${day}th`;
      };
    
      const formattedDays = days.map(getDayWithSuffix);
      const finalDaysFormat = formattedDays.length > 1 
        ? formattedDays.slice(0, -1).join(", ") + " and " + formattedDays.slice(-1) 
        : formattedDays[0];
    
      return `${finalDaysFormat} ${month}`;
    };
  
    const getTrainingById = (id) => {
      return rawData.trainings.find(training => training._id === id) || null;
    };

    const getTrainingSessionsById = (id) => {
      return rawData.sessions.filter(session => session.training === id);
    };

    const getFirstSessionByTraining = (selectedTraining) => {
      const filtered = selectedTraining === 'all'
        ? rawData.sessions
        : rawData.sessions.filter(session => session.training === selectedTraining);

      const sorted = filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

      return sorted[0] || null;
    };

    const getLastSessionByTraining = (selectedTraining) => {
      const filtered = selectedTraining === 'all'
        ? rawData.sessions
        : rawData.sessions.filter(session => session.training === selectedTraining);

      const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

      return sorted[0] || null;
    };

  
    // Data fetching
    const fetchAllData = async () => {
      try {
        const [trainingsRes, sessionsRes, usersRes] = await Promise.all([
          api.get("/api/trainings"),
          api.get("/api/sessions"),
          api.get("/api/users")
        ]);
  
        setRawData({
          trainings: trainingsRes.data,
          sessions: sessionsRes.data,
          users: usersRes.data,
          feedbacks: {}
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    // Data filtering
    const filterData = () => {
      const isTrainer = (user?.role === "trainer" || selectedRole === "trainer");
      const isTrainee = (user?.role === "trainee" || selectedRole === "trainee"); 
      const isManager = (user?.role === "manager");
      const currentYear = dayjs().year();
  
      // Filter trainings
      const filteredTrainings = rawData.trainings.filter(training => {  
        const trainingMonthDate = dayjs(
          training.month.charAt(0).toUpperCase() + 
          training.month.slice(1).toLowerCase() + ` ${currentYear}`, 
          'MMMM YYYY'
        );
        const inRange =
          (startMonth === null || trainingMonthDate.isAfter(startMonth)) &&
          (endMonth === null || trainingMonthDate.isBefore(endMonth));
  
        const trainingsMatch = (((isTrainer && training.trainer === user?._id) || (isManager && inRange && training.delivered) || (isTrainee 
          && (training.confirmedtrainees.includes(user?._id) || training.acceptedtrainees.includes(user?._id) || training.rejectedtrainees.includes(user?._id))
        ))); 
        return trainingsMatch;
      });
  
      // Filter sessions
      const filteredSessions = rawData.sessions.filter(session => 
        filteredTrainings.some(training => training._id === session.training)
      );
  
      // Filter users
      const filteredUsers = rawData.users.filter(user => 
        (user?.role !== "manager") && (user?.role !== "admin")
      );
  
      setFilteredData({
        trainings: filteredTrainings,
        sessions: filteredSessions,
        users: filteredUsers
      });
    };

    // Calculate metrics
    const calculateMetrics = async () => {
      const {
        trainings,
        sessions,
        users
      } = filteredData;

      // Basic counts
      const softSkills = trainings.filter(t => t.skillType === "soft_skill");
      const internTechnicalSkills = trainings.filter(t => t.skillType === "technical_skill" && t.type === "internal");
      const externTechnicalSkills = trainings.filter(t => t.skillType === "technical_skill" && t.type === "external");
      const technicalSkills = trainings.filter(t => t.skillType === "technical_skill");
      const FTFTrainings = trainings.filter(t => t.mode === "face_to_face");
      const OnlineTrainings = trainings.filter(t => t.mode === "online");


  
      const confirmedTrainees = trainings
        .map(training => {
          const sessions = rawData.sessions.filter(
            session => session.training === training._id
          );

          const attendees = training.confirmedtrainees.filter(traineeId =>
            sessions.some(session => session.presenttrainees.includes(traineeId))
          );

          return attendees;
        })
        .flat();
      console.log(confirmedTrainees);
      
      // Gender rates
      const genders = await Promise.all(
        confirmedTrainees.map(async (id) => {
          try {
            const response = await api.get(`/api/users/${id}`);
            return { id, gender: response.data.gender };
          } catch (error) {
            console.error("Error fetching trainee gender", error);
            return { id, gender: null };
          }
        })
      );
      const maleConfirmedTrainees = genders.filter(t => t.gender === "male").map(t => t.id);
      const femaleConfirmedTrainees = genders.filter(t => t.gender === "female").map(t => t.id);
  
      // Activity rates
      const activitiesConfirmed = await Promise.all(
        confirmedTrainees.map(async (id) => {
          try {
            const response = await api.get(`/api/users/${id}`);
            return { id, activity: response.data.activity };
          } catch (error) {
            console.error("Error fetching trainee activity", error);
            return { id, activity: null };
          }
        })
      );

      const knownActivities = [
        "enablers", 
        "mechanical", 
        "formation_systems", 
        "databox", 
        "telecom", 
        "quality", 
        "e-paysys", 
        "media&energy", 
        "electronics", 
        "space"
      ];
  
      const activityConfirmedCounts = {
        enablers: activitiesConfirmed.filter(a => a.activity === "enablers").length,
        mechanical: activitiesConfirmed.filter(a => a.activity === "mechanical").length,
        informationSystems: activitiesConfirmed.filter(a => a.activity === "formation_systems").length,
        databox: activitiesConfirmed.filter(a => a.activity === "databox").length,
        telecom: activitiesConfirmed.filter(a => a.activity === "telecom").length,
        quality: activitiesConfirmed.filter(a => a.activity === "quality").length,
        epaysys: activitiesConfirmed.filter(a => a.activity === "e-paysys").length,
        mediaEnergy: activitiesConfirmed.filter(a => a.activity === "media&energy").length,
        electronics: activitiesConfirmed.filter(a => a.activity === "electronics").length,
        space: activitiesConfirmed.filter(a => a.activity === "space").length,
        other: activitiesConfirmed.filter(a => !knownActivities.includes(a.activity)).length,
      };

      const activities = users.filter(u => u.role !== "trainer").map(user => user.activity);

      const activityCounts = {
        enablers: activities.filter(a => a === "enablers").length,
        mechanical: activities.filter(a => a === "mechanical").length,
        informationSystems: activities.filter(a => a === "formation_systems").length,
        databox: activities.filter(a => a === "databox").length,
        telecom: activities.filter(a => a === "telecom").length,
        quality: activities.filter(a => a === "quality").length,
        epaysys: activities.filter(a => a === "e-paysys").length,
        mediaEnergy: activities.filter(a => a === "media&energy").length,
        electronics: activities.filter(a => a === "electronics").length,
        space: activities.filter(a => a === "space").length,
        other: activities.filter(a => !knownActivities.includes(a)).length,
      };

      const activitiesTrained = users.filter(u => u.role !== "trainer" && u.isTrained).map(user => user.activity);
  
      const activityTrainedCounts = {
        enablers: activitiesTrained.filter(a => a === "enablers").length,
        mechanical: activitiesTrained.filter(a => a === "mechanical").length,
        informationSystems: activitiesTrained.filter(a => a === "formation_systems").length,
        databox: activitiesTrained.filter(a => a === "databox").length,
        telecom: activitiesTrained.filter(a => a === "telecom").length,
        quality: activitiesTrained.filter(a => a === "quality").length,
        epaysys: activitiesTrained.filter(a => a === "e-paysys").length,
        mediaEnergy: activitiesTrained.filter(a => a === "media&energy").length,
        electronics: activitiesTrained.filter(a => a === "electronics").length,
        space: activitiesTrained.filter(a => a === "space").length,
        other: activitiesTrained.filter(a => !knownActivities.includes(a)).length,
      };
      // Grade rates
      const gradesConfirmed = await Promise.all(
        confirmedTrainees.map(async (id) => {
          try {
            const response = await api.get(`/api/users/${id}`);
            return { id, grade: response.data.grade };
          } catch (error) {
            console.error("Error fetching trainee grade", error);
            return { id, grade: null };
          }
        })
      );
  
      const gradeConfirmedCounts = {
        F1: gradesConfirmed.filter(g => g.grade === "F1").length,
        F2: gradesConfirmed.filter(g => g.grade === "F2").length,
        F3: gradesConfirmed.filter(g => g.grade === "F3").length,
        F4: gradesConfirmed.filter(g => g.grade === "F4").length,
        M1: gradesConfirmed.filter(g => g.grade === "M1").length,
        M2: gradesConfirmed.filter(g => g.grade === "M2").length,
        M3: gradesConfirmed.filter(g => g.grade === "M3").length,
        M4: gradesConfirmed.filter(g => g.grade === "M4").length,
        M5: gradesConfirmed.filter(g => g.grade === "M5").length,
        M6: gradesConfirmed.filter(g => g.grade === "M6").length,
        L1: gradesConfirmed.filter(g => g.grade === "L1").length,
        L2: gradesConfirmed.filter(g => g.grade === "L2").length,
        L3: gradesConfirmed.filter(g => g.grade === "L3").length,
        L4: gradesConfirmed.filter(g => g.grade === "L4").length,
      };

      const grades = users.filter(u => u.role !== "trainer").map(user => user.grade);

      const gradeCounts = {
        F1: grades.filter(g => g === "F1").length,
        F2: grades.filter(g => g === "F2").length,
        F3: grades.filter(g => g === "F3").length,
        F4: grades.filter(g => g === "F4").length,
        M1: grades.filter(g => g === "M1").length,
        M2: grades.filter(g => g === "M2").length,
        M3: grades.filter(g => g === "M3").length,
        M4: grades.filter(g => g === "M4").length,
        M5: grades.filter(g => g === "M5").length,
        M6: grades.filter(g => g === "M6").length,
        L1: grades.filter(g => g === "L1").length,
        L2: grades.filter(g => g === "L2").length,
        L3: grades.filter(g => g === "L3").length,
        L4: grades.filter(g => g === "L4").length
      };

      const gradesTrained = users.filter(u => u.role !== "trainer" && u.isTrained).map(user => user.grade);

      const gradesTrainedCounts = {
        F1: gradesTrained.filter(g => g === "F1").length,
        F2: gradesTrained.filter(g => g === "F2").length,
        F3: gradesTrained.filter(g => g === "F3").length,
        F4: gradesTrained.filter(g => g === "F4").length,
        M1: gradesTrained.filter(g => g === "M1").length,
        M2: gradesTrained.filter(g => g === "M2").length,
        M3: gradesTrained.filter(g => g === "M3").length,
        M4: gradesTrained.filter(g => g === "M4").length,
        M5: gradesTrained.filter(g => g === "M5").length,
        M6: gradesTrained.filter(g => g === "M6").length,
        L1: gradesTrained.filter(g => g === "L1").length,
        L2: gradesTrained.filter(g => g === "L2").length,
        L3: gradesTrained.filter(g => g === "L3").length,
        L4: gradesTrained.filter(g => g === "L4").length
      };
  
      // Request counts
      let reqnumber = 0;
      let appnumber = 0;
      let confnumber = 0;
  
      trainings.forEach((training) => {
        reqnumber += (training.nbOfReceivedRequests || 0);
        appnumber += (training.nbOfAcceptedRequests || 0);
        confnumber += (training.nbOfConfirmedRequests || 0);
      });
  
      // Session status counts
      let nbofsch = 0;
      let nbofinprog = 0;
      let nbofcomp = 0;
  
      rawData.sessions.forEach((session) => {
        if (session.status === "scheduled") {
          nbofsch++;
        } else if (session.status === "in_progress") {
          nbofinprog++;
        } else {
          nbofcomp++;
        }
      });
  
      // Attended hours
      let attendedhours = 0;
      sessions.forEach((session) => {
        attendedhours += ((session.presenttrainees.length * session.duration) || 0);
      });
  
      // Participants count
      let nbofparticipants = 0;
      trainings.forEach((training) => {
        nbofparticipants += (training.nbOfParticipants || 0);
      });
  
      // User counts
      const TrainedEmployees = users.filter((u) => u.isTrained);
      const Employees = users.filter((u) => (u.role !== "manager") && (u.role !== "admin"));
      const InternalTraines = users.filter((u) => (u.type === "internal") && (u.role !== "manager") && (u.role !== "admin"));
      setTrainedEmployees(TrainedEmployees);
  
      // Requests per month
      const requests = rawData.trainings
        .flatMap((training) =>
          training.requestshistory.map((request) => ({
            ...request,
            training,
          }))
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));
  
      const requestsByMonth = Array(12).fill(0); 
      requests.forEach((req) => {
        const monthIndex = new Date(req.date).getMonth(); 
        requestsByMonth[monthIndex]++;
      });

      //Calculate Sat Trainings

      const satTrainings = trainings.filter(t => ((t.hotEvalRate || 2) + (t.coldEvalRate || 2))/2 >= 3);
  
      // Calculate total
      const totalConfirmedTrainees = confirmedTrainees.length || 1;
      const totalTrainees = users.filter((u) => u.role !== "trainer").length || 1;
  
      // Update metrics state
      setMetrics(prev => ({
        ...prev,
        // Training counts
        numberOfTrainings: rawData.trainings.length,
        numberOfSoftSkillsTrainings: softSkills.length,
        numberOfInternTechnicalSkillsTrainings: internTechnicalSkills.length,
        numberOfExternTechnicalSkillsTrainings: externTechnicalSkills.length,
        numberOfFTFTrainings: FTFTrainings.length,
        numberOfOnlineTrainings: OnlineTrainings.length,
  
        // Hours
        numberOfSoftSkillsHours: softSkills.reduce((acc, t) => acc + t.nbOfHours, 0),
        numberOfTechnicalSkillsHours: technicalSkills.reduce((acc, t) => acc + t.nbOfHours, 0),
        numberOfAttendedHours: attendedhours,
  
        // Participants
        numberOfTrainees: confirmedTrainees.length,
        numberOfParticipants: nbofparticipants,
        numberOfTrainedEmployees: TrainedEmployees.length,
        numberOfEmployees: Employees.length,
        numberOfInternalTrainers: InternalTraines.length,
  
        // Requests
        numberOfReq: reqnumber,
        numberOfApproved: appnumber,
        numberOfConfirmed: confnumber,
        numberOfScheduled: nbofsch,
        numberOfInProgress: nbofinprog,
        numberOfCompleted: nbofcomp,
        requestsPerMonth: requestsByMonth,
        //Sat Trainings Number

        numberOfSatisfactorilyEvaluatedTrainings:satTrainings.length,
  
        // Rates
        rateOfConfirmedMale: (maleConfirmedTrainees.length / totalConfirmedTrainees) * 100,
        rateOfConfirmedFemale: (femaleConfirmedTrainees.length / totalConfirmedTrainees) * 100,
        rateOfEnablersConfirmedActivity: (activityConfirmedCounts.enablers / totalConfirmedTrainees) * 100,
        rateOfMechanicalConfirmedActivity: (activityConfirmedCounts.mechanical / totalConfirmedTrainees) * 100,
        rateOfInformationSystemsConfirmedActivity: (activityConfirmedCounts.informationSystems / totalConfirmedTrainees) * 100,
        rateOfDataboxConfirmedActivity: (activityConfirmedCounts.databox / totalConfirmedTrainees) * 100,
        rateOfTelecomConfirmedActivity: (activityConfirmedCounts.telecom / totalConfirmedTrainees) * 100,
        rateOfQualityConfirmedActivity: (activityConfirmedCounts.quality / totalConfirmedTrainees) * 100,
        rateOfEpaysysConfirmedActivity: (activityConfirmedCounts.epaysys / totalConfirmedTrainees) * 100,
        rateOfMediaAndEnergyConfirmedActivity: (activityConfirmedCounts.mediaEnergy / totalConfirmedTrainees) * 100,
        rateOfElectronicsConfirmedActivity: (activityConfirmedCounts.electronics / totalConfirmedTrainees) * 100,
        rateOfSpaceConfirmedActivity: (activityConfirmedCounts.space / totalConfirmedTrainees) * 100,
        rateOfOtherConfirmedActivity: (activityConfirmedCounts.other / totalConfirmedTrainees) * 100,
        rateOfF1ConfirmedGrade: (gradeConfirmedCounts.F1 / totalConfirmedTrainees) * 100,
        rateOfF2ConfirmedGrade: (gradeConfirmedCounts.F2 / totalConfirmedTrainees) * 100,
        rateOfF3ConfirmedGrade: (gradeConfirmedCounts.F3 / totalConfirmedTrainees) * 100,
        rateOfF4ConfirmedGrade: (gradeConfirmedCounts.F4 / totalConfirmedTrainees) * 100,
        rateOfM1ConfirmedGrade: (gradeConfirmedCounts.M1 / totalConfirmedTrainees) * 100,
        rateOfM2ConfirmedGrade: (gradeConfirmedCounts.M2 / totalConfirmedTrainees) * 100,
        rateOfM3ConfirmedGrade: (gradeConfirmedCounts.M3 / totalConfirmedTrainees) * 100,
        rateOfM4ConfirmedGrade: (gradeConfirmedCounts.M4 / totalConfirmedTrainees) * 100,
        rateOfM5ConfirmedGrade: (gradeConfirmedCounts.M5 / totalConfirmedTrainees) * 100,
        rateOfM6ConfirmedGrade: (gradeConfirmedCounts.M6 / totalConfirmedTrainees) * 100,
        rateOfL1ConfirmedGrade: (gradeConfirmedCounts.L1 / totalConfirmedTrainees) * 100,
        rateOfL2ConfirmedGrade: (gradeConfirmedCounts.L2 / totalConfirmedTrainees) * 100,
        rateOfL3ConfirmedGrade: (gradeConfirmedCounts.L3 / totalConfirmedTrainees) * 100,
        rateOfL4ConfirmedGrade: (gradeConfirmedCounts.L4 / totalConfirmedTrainees) * 100,
        numberOfEnablersConfirmedTrainees : activityConfirmedCounts.enablers,
        numberOfMechanicalConfirmedTrainees : activityConfirmedCounts.mechanical,
        numberOfInformationSystemsConfirmedTrainees : activityConfirmedCounts.informationSystems,
        numberOfDataboxConfirmedTrainees : activityConfirmedCounts.databox,
        numberOfQualityConfirmedTrainees : activityConfirmedCounts.quality,
        numberOfEpaysysConfirmedTrainees : activityConfirmedCounts.epaysys,
        numberOfMediaAndEnergyConfirmedTrainees : activityConfirmedCounts.mediaEnergy,
        numberOfElectronicsConfirmedTrainees : activityConfirmedCounts.electronics,
        numberOfSpaceConfirmedTrainees : activityConfirmedCounts.space,
        numberOfTelecomConfirmedTrainees : activityConfirmedCounts.telecom,
        numberOfOtherConfirmedAct : activityConfirmedCounts.other,
        numberOfF1ConfirmedTrainees : gradeConfirmedCounts.F1,
        numberOfF2ConfirmedTrainees : gradeConfirmedCounts.F2,
        numberOfF3ConfirmedTrainees : gradeConfirmedCounts.F3,
        numberOfF4ConfirmedTrainees : gradeConfirmedCounts.F4,
        numberOfM1ConfirmedTrainees : gradeConfirmedCounts.M1,
        numberOfM2ConfirmedTrainees : gradeConfirmedCounts.M2,
        numberOfM3ConfirmedTrainees : gradeConfirmedCounts.M3,
        numberOfM4ConfirmedTrainees : gradeConfirmedCounts.M4,
        numberOfM5ConfirmedTrainees : gradeConfirmedCounts.M5,
        numberOfM6ConfirmedTrainees : gradeConfirmedCounts.M6,
        numberOfL1ConfirmedTrainees : gradeConfirmedCounts.L1,
        numberOfL2ConfirmedTrainees : gradeConfirmedCounts.L2,
        numberOfL3ConfirmedTrainees : gradeConfirmedCounts.L3,
        numberOfL4ConfirmedTrainees : gradeConfirmedCounts.L4,

        rateOfEnablersActivity: (activityConfirmedCounts.enablers / totalConfirmedTrainees) * 100,
        rateOfMechanicalActivity: (activityConfirmedCounts.mechanical / totalConfirmedTrainees) * 100,
        rateOfInformationSystemsActivity: (activityCounts.informationSystems / totalTrainees) * 100,
        rateOfDataboxActivity: (activityCounts.databox / totalTrainees) * 100,
        rateOfTelecomActivity: (activityCounts.telecom / totalTrainees) * 100,
        rateOfQualityActivity: (activityCounts.quality / totalTrainees) * 100,
        rateOfEpaysysActivity: (activityCounts.epaysys / totalTrainees) * 100,
        rateOfMediaAndEnergyActivity: (activityCounts.mediaEnergy / totalTrainees) * 100,
        rateOfElectronicsActivity: (activityCounts.electronics / totalTrainees) * 100,
        rateOfSpaceActivity: (activityCounts.space / totalTrainees) * 100,
        rateOfOtherActivity: (activityCounts.other / totalTrainees) * 100,
        rateOfF1Grade: (gradeCounts.F1 / totalTrainees) * 100,
        rateOfF2Grade: (gradeCounts.F2 / totalTrainees) * 100,
        rateOfF3Grade: (gradeCounts.F3 / totalTrainees) * 100,
        rateOfF4Grade: (gradeCounts.F4 / totalTrainees) * 100,
        rateOfM1Grade: (gradeCounts.M1 / totalTrainees) * 100,
        rateOfM2Grade: (gradeCounts.M2 / totalTrainees) * 100,
        rateOfM3Grade: (gradeCounts.M3 / totalTrainees) * 100,
        rateOfM4Grade: (gradeCounts.M4 / totalTrainees) * 100,
        rateOfM5Grade: (gradeCounts.M5 / totalTrainees) * 100,
        rateOfM6Grade: (gradeCounts.M6 / totalTrainees) * 100,
        rateOfL1Grade: (gradeCounts.L1 / totalTrainees) * 100,
        rateOfL2Grade: (gradeCounts.L2 / totalTrainees) * 100,
        rateOfL3Grade: (gradeCounts.L3 / totalTrainees) * 100,
        rateOfL4Grade: (gradeCounts.L4 / totalTrainees) * 100,
        numberOfEnablersTrainees : activityTrainedCounts.enablers,
        numberOfMechanicalTrainees : activityTrainedCounts.mechanical,
        numberOfInformationSystemsTrainees : activityTrainedCounts.informationSystems,
        numberOfDataboxTrainees : activityTrainedCounts.databox,
        numberOfQualityTrainees : activityTrainedCounts.quality,
        numberOfEpaysysTrainees : activityTrainedCounts.epaysys,
        numberOfMediaAndEnergyTrainees : activityTrainedCounts.mediaEnergy,
        numberOfElectronicsTrainees : activityTrainedCounts.electronics,
        numberOfSpaceTrainees : activityTrainedCounts.space,
        numberOfTelecomTrainees : activityTrainedCounts.telecom,
        numberOfOtherAct : activityTrainedCounts.other,
        numberOfF1Trainees : gradesTrainedCounts.F1,
        numberOfF2Trainees : gradesTrainedCounts.F2,
        numberOfF3Trainees : gradesTrainedCounts.F3,
        numberOfF4Trainees : gradesTrainedCounts.F4,
        numberOfM1Trainees : gradesTrainedCounts.M1,
        numberOfM2Trainees : gradesTrainedCounts.M2,
        numberOfM3Trainees : gradesTrainedCounts.M3,
        numberOfM4Trainees : gradesTrainedCounts.M4,
        numberOfM5Trainees : gradesTrainedCounts.M5,
        numberOfM6Trainees : gradesTrainedCounts.M6,
        numberOfL1Trainees : gradesTrainedCounts.L1,
        numberOfL2Trainees : gradesTrainedCounts.L2,
        numberOfL3Trainees : gradesTrainedCounts.L3,
        numberOfL4Trainees : gradesTrainedCounts.L4,
      }));
  
      // Update trainees data
      const traineeIds = [...new Set(requests.map((req) => req.trainee))];
      const traineeDataArray = await Promise.all(
        traineeIds.map((id) => api.get(`/api/users/${id}`))
      );
      const traineesData = Object.fromEntries(
        traineeDataArray.map(({ data }) => [data._id, data])
      );
  
      setTraineesData(traineesData);
      setAllRequests(requests);
    };
  
    // Initialize completed trainings
    useEffect(() => {
      const filtered = filteredData.trainings
        .filter((t) => {
          const sessions = rawData.sessions.filter(
            session => session.training === t._id
          );
          const attended = sessions.some(session => session.presenttrainees.includes(user?._id));
          const isTrainer = (user?.role === "trainer" || selectedRole === "trainer");
          const isTrainee = (user?.role === "trainee" || selectedRole === "trainee"); 
          const isManager = (user?.role === "manager");
          const condition = (isTrainee && attended) || ((isTrainer || isManager) && t.delivered);

          return  condition;
        })
        .map(training => ({
          ...training,
          showDetails: false
        }));
      setCompletedTrainings(filtered);
    }, [filteredData.trainings]);
  
    const updateShowDetails = (trainingId, value) => {
      setCompletedTrainings(prevTrainings =>
        prevTrainings.map(training =>
          training._id === trainingId
            ? { ...training, showDetails: value }
            : training
        )
      );
    };    
  
    // Main data flow
    useEffect(() => {
      fetchAllData();
    }, []);
  
    useEffect(() => {
      if (rawData.trainings.length > 0) {
        filterData();
      }
    }, [rawData, startMonth, endMonth]);
  
    useEffect(() => {
      calculateMetrics();
    }, [filteredData]);

    // Get Training by month ..........
    
    const getTrainingsByMonth = (month) => {
      return filteredData.trainings.filter(training => training.month === month);
    }

    const getPlannedTrainingsByMonth = (month) => {
      return rawData.trainings.filter(training => training.month === month && training.delivered === false).length;
    }
    const getCompletedTrainingsByMonth = (month) => {
      return rawData.trainings.filter(training => training.month === month && training.delivered === true).length;
    }

    const getTraineesByMonth = (month) => {
      const trainings = getTrainingsByMonth(month);

      const trainees = trainings.flatMap(training => {
        const sessions = rawData.sessions.filter(session => session.training === training._id);
        
        return training.confirmedtrainees.filter(traineeId =>
          sessions.some(session => session.presenttrainees.includes(traineeId))
        );
    });

      // const uniqueTrainees = [...new Set(trainees)];

      return trainees.length;
    };

    const getNumberOfHoursByMonth = (month) => {
      const trainings = getTrainingsByMonth(month);
      const totalHours = trainings.reduce((acc, training) => {
        return acc + (training.nbOfHours || 0);
      }, 0);
      return totalHours;
    };

    // Chart rendering
    useEffect(() => {
      const skillChartInstance = skillTypeChart.current && echarts.init(skillTypeChart.current);
      const hoursChartInstance = hoursChart.current && echarts.init(hoursChart.current);
      const genderChartInstance = genderChart.current && echarts.init(genderChart.current);
      const activityChartInstance = activityChart.current && echarts.init(activityChart.current);
      const gradeChartInstance = gradeChart.current && echarts.init(gradeChart.current);
      const registChartInstance = regisChart.current && echarts.init(regisChart.current);
      const trainingsByMonthChartInstance = trainingsByMonthChart.current && echarts.init(trainingsByMonthChart.current);
      const traineesByMonthChartInstance = traineesByMonthChart.current && echarts.init(traineesByMonthChart.current);
  
      const skillType = {
        title: {
          text: t("total_number_of_trainings") + " : " + metrics.numberOfTrainings,
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          data: [t("soft skills"), t("internal tech"), t("external tech")],
          bottom: 0,
        },
        xAxis: {
          type: "category",
          axisLabel: {
            interval: 0,
          },
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: t("soft skills"),
            data: [metrics.numberOfSoftSkillsTrainings, 0, 0],
            type: "bar",
            itemStyle: { color: "#91CC75" },
            barWidth: 60,
            stack: "stacked",
          },
          {
            name: t("internal tech"),
            data: [0, metrics.numberOfInternTechnicalSkillsTrainings, 0],
            type: "bar",
            itemStyle: { color: "#FAC858" },
            barWidth: 60,
            stack: "stacked",
          },
          {
            name: t("external tech"),
            data: [0, 0, metrics.numberOfExternTechnicalSkillsTrainings],
            type: "bar",
            itemStyle: { color: "#EE6666" },
            barWidth: 60,
            stack: "stacked",
          },
        ],
      };
  
      const hours = {
        title: {
          text: t("trainings_per_hour"),
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          data: [t("total_hours_of_technical_skills_training"), t("total_hours_of_soft_skills_training")],
          bottom: 0,
        },
        xAxis: {
          type: "category",
          axisLabel: {
            interval: 0,
          },
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: t("total_hours_of_technical_skills_training"),
            data: [metrics.numberOfTechnicalSkillsHours, 0],
            type: "bar",
            itemStyle: { color: "#FAC858" },
            barWidth: 80,
            stack: "stacked",
          },
          {
            name: t("total_hours_of_soft_skills_training"),
            data: [0, metrics.numberOfSoftSkillsHours],
            type: "bar",
            itemStyle: { color: "#EE6666" },
            barWidth: 80,
            stack: "stacked",
          },
        ],
      };
  
      const gender = {
        title: {
          text: t("participation_rate_by_gender"),
        },
        tooltip: {
          trigger: 'item'
        },
        legend: {
          bottom: "10%",
          left: 'right',
        },
        series: [
          {
            name: t("gender"),
            type: 'pie',
            radius: '50%',
            data: [
              { value: metrics.rateOfConfirmedMale, name: t("male") },
              { value: metrics.rateOfConfirmedFemale, name: t("female") },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
  
      const activity = {
        title: {
          text: t("participation_rate_by_activity"),
          left: 0,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: "2%",
          right: '5%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} %'
          }
        },
        yAxis: {
          type: 'category',
          data: [
            t("enablers"),
            t("mechanical"),
            t("formation_systems"),
            t("databox"),
            t("telecom"),
            t("quality"),
            t("e-paysys"),
            t("media&energy"),
            t("electronics"),
            t("space"),
            t("other")
          ]
        },
        series: [
          {
            name: t("participation_rate"),
            type: 'bar',
            stack: 'total',
            label: {
              show: true,
              position: 'insideLeft',
              formatter: '{c} %'
            },
            itemStyle: {
              color: '#5470C6'
            },
            emphasis: {
              focus: 'series'
            },
            data: [
              metrics.rateOfEnablersConfirmedActivity,
              metrics.rateOfMechanicalConfirmedActivity,
              metrics.rateOfInformationSystemsConfirmedActivity,
              metrics.rateOfDataboxConfirmedActivity,
              metrics.rateOfTelecomConfirmedActivity,
              metrics.rateOfQualityConfirmedActivity,
              metrics.rateOfEpaysysConfirmedActivity,
              metrics.rateOfMediaAndEnergyConfirmedActivity,
              metrics.rateOfElectronicsConfirmedActivity,
              metrics.rateOfSpaceConfirmedActivity,
              metrics.rateOfOtherConfirmedActivity
            ]
          }
        ]
      };
  
      const grade = {
        title: {
          text: t("participation_rate_by_grade"),
          left: 0,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: "2%",
          right: '5%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} %'
          }
        },
        yAxis: {
          type: 'category',
          data: [
            t("F1"),
            t("F2"),
            t("F3"),
            t("F4"),
            t("M1"),
            t("M2"),
            t("M3"),
            t("M4"),
            t("M5"),
            t("M6"),
            t("L1"),
            t("L2"),
            t("L3"),
            t("L4"),
          ]
        },
        series: [
          {
            name: t("participation_rate"),
            type: 'bar',
            stack: 'total',
            label: {
              show: true,
              position: 'insideLeft',
              formatter: '{c} %'
            },
            itemStyle: {
              color: '#5470C6'
            },
            emphasis: {
              focus: 'series'
            },
            data: [
              metrics.rateOfF1ConfirmedGrade,
              metrics.rateOfF2ConfirmedGrade,
              metrics.rateOfF3ConfirmedGrade,
              metrics.rateOfF4ConfirmedGrade,
              metrics.rateOfM1ConfirmedGrade,
              metrics.rateOfM2ConfirmedGrade,
              metrics.rateOfM3ConfirmedGrade,
              metrics.rateOfM4ConfirmedGrade,
              metrics.rateOfM5ConfirmedGrade,
              metrics.rateOfM6ConfirmedGrade,
              metrics.rateOfL1ConfirmedGrade,
              metrics.rateOfL2ConfirmedGrade,
              metrics.rateOfL3ConfirmedGrade,
              metrics.rateOfL4ConfirmedGrade,
            ]
          }
        ]
      };
  
      const regist = {
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },        
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: metrics.requestsPerMonth,
            type: 'bar'
          }
        ]
      };

      const labelOption = {
        show: true,
        position: 'inside',
        formatter: '{c}',
        fontSize: 12,
        rich: {
          name: {}
        }
      };

      const trainingsByMonth = {
        tooltip: {
            trigger: 'item'
          },
          legend: {
            top: 'top',
            data: [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ]
          },
          toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
              dataView: { show: true, readOnly: false },
              magicType: { show: true, type: ['stack', 'bar'] },
              restore: { show: true },
              saveAsImage: { show: true }
            }
          },
          xAxis: {
            type: 'category',
            data: ['Planned Trainings', 'Delivered Trainings']
          },
          yAxis: {
            type: 'value'
          },
          series: [
            {
              name: 'January',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("january"), getCompletedTrainingsByMonth("january")]
            },
            {
              name: 'February',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("february"), getCompletedTrainingsByMonth("february")]
            },
            {
              name: 'March',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("march"), getCompletedTrainingsByMonth("march")]
            },
            {
              name: 'April',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("april"), getCompletedTrainingsByMonth("april")]
            },
            {
              name: 'May',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("may"), getCompletedTrainingsByMonth("may")]
            },
            {
              name: 'June',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("june"), getCompletedTrainingsByMonth("june")]
            },
            {
              name: 'July',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("july"), getCompletedTrainingsByMonth("july")]
            },
            {
              name: 'August',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("august"), getCompletedTrainingsByMonth("august")]
            },
            {
              name: 'September',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("september"), getCompletedTrainingsByMonth("september")]
            },
            {
              name: 'October',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("october"), getCompletedTrainingsByMonth("october")]
            },
            {
              name: 'November',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("november"), getCompletedTrainingsByMonth("november")]
            },
            {
              name: 'December',
              type: 'bar',
              label: labelOption,
              data: [getPlannedTrainingsByMonth("december"), getCompletedTrainingsByMonth("december")]
            }
          ]
      };

      const numberOfTrainees = [
        getTraineesByMonth("january"),
        getTraineesByMonth("february"),
        getTraineesByMonth("march"),
        getTraineesByMonth("april"),
        getTraineesByMonth("may"),
        getTraineesByMonth("june"),
        getTraineesByMonth("july"),
        getTraineesByMonth("august"),
        getTraineesByMonth("september"),
        getTraineesByMonth("october"),
        getTraineesByMonth("november"),
        getTraineesByMonth("december")
      ];

      const totalHours = [
        getNumberOfHoursByMonth("january"),
        getNumberOfHoursByMonth("february"),
        getNumberOfHoursByMonth("march"),
        getNumberOfHoursByMonth("april"),
        getNumberOfHoursByMonth("may"),
        getNumberOfHoursByMonth("june"),
        getNumberOfHoursByMonth("july"),
        getNumberOfHoursByMonth("august"),
        getNumberOfHoursByMonth("september"),
        getNumberOfHoursByMonth("october"),
        getNumberOfHoursByMonth("november"),
        getNumberOfHoursByMonth("december")
      ];

      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const traineesByMonth = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999'
            }
          }
        },
        toolbox: {
          feature: {
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ['line', 'bar'] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        legend: {
          data: ['Number of Trainees', 'Total Hours']
        },
        xAxis: [
          {
            type: 'category',
            data: months,
            axisPointer: {
              type: 'shadow'
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: 'Trainees',
            axisLabel: {
              formatter: '{value}'
            }
          },
          {
            type: 'value',
            name: 'Hours',
            axisLabel: {
              formatter: '{value} hrs'
            }
          }
        ],
        series: [
          {
            name: 'Number of Trainees',
            type: 'bar',
            tooltip: {
              valueFormatter: function (value) {
                return value + ' trainees';
              }
            },
            data: numberOfTrainees
          },
          {
            name: 'Total Hours',
            type: 'line',
            yAxisIndex: 1,
            tooltip: {
              valueFormatter: function (value) {
                return value + ' hrs';
              }
            },
            data: totalHours
          }
        ]
      };
    
      if (skillChartInstance) {
        skillChartInstance.setOption(skillType);
      }
      if (hoursChartInstance) {
        hoursChartInstance.setOption(hours);
      }
      if (genderChartInstance) {
        genderChartInstance.setOption(gender);
      }
      if (activityChartInstance) {
        activityChartInstance.setOption(activity);
      }
      if (gradeChartInstance) {
        gradeChartInstance.setOption(grade);
      }
      if (registChartInstance) {
        registChartInstance.setOption(regist)
      }
      if (trainingsByMonthChartInstance) {
        trainingsByMonthChartInstance.setOption(trainingsByMonth);
      }
      if (traineesByMonthChartInstance) {
        traineesByMonthChartInstance.setOption(traineesByMonth);
      }
    
      return () => {
        skillChartInstance?.dispose();
        hoursChartInstance?.dispose();
        genderChartInstance?.dispose();
        activityChartInstance?.dispose();
        gradeChartInstance?.dispose();
        registChartInstance?.dispose();
      };
    }, [metrics, t, view, statView]);
  
    // Session grouping
    const now = dayjs();
    const nextWeek = now.add(7, 'day').endOf('day');
    const nextMonth = now.add(1, 'month').endOf('day');
    const thisMonthIndex = now.month();
    const nextMonthIndex = now.add(1, 'month').month();

    const sourceData = user.role === "manager" ? rawData : filteredData;
  
    const sessionsNextWeek = sourceData.sessions.filter(session =>
      (selectedFilter === "all" || selectedFilter === session.status) &&
      dayjs(session.date).isAfter(now) &&
      dayjs(session.date).isBefore(nextWeek)
    );
  
    const sessionsLaterThisMonth = sourceData.sessions.filter(session =>
      (selectedFilter === "all" || selectedFilter === session.status) &&
      dayjs(session.date).isAfter(nextWeek) &&
      dayjs(session.date).isBefore(nextMonth)
    );
  
    const sessionsAfterOneMonth = sourceData.sessions.filter(session =>
      (selectedFilter === "all" || selectedFilter === session.status) &&
      dayjs(session.date).isAfter(nextMonth)
    );

    const TrainingsThisMonth = rawData.trainings.filter(training => {
      const trainingMonthIndex = monthMap[training.month.toLowerCase()];
      return (trainingMonthIndex === thisMonthIndex && !training.delivered);
    });

    const TrainingsNextMonth = rawData.trainings.filter(training => {
      const trainingMonthIndex = monthMap[training.month.toLowerCase()];
      return (trainingMonthIndex === nextMonthIndex && !training.delivered);
    });

    const TrainingsAfterNextMonth = rawData.trainings.filter(training => {
      const trainingMonthIndex = monthMap[training.month.toLowerCase()];
      return (trainingMonthIndex > nextMonthIndex && !training.delivered);
    });
  
    // Render functions
    const renderSession = (session) => {
      const start = dayjs(session.date);
      const end = start.add(session.duration, 'hour');
  
      return (
        <ListItem key={session.date} disableGutters sx={{width:"100%"}}>
          <ListItemIcon>
            <CalendarTodayIcon fontSize="medium" />
          </ListItemIcon>
          <ListItemText
            primary={`${session.name} (${getTrainingById(session.training)?.title})`}
            secondary={
              <>
                <Typography variant="body2">
                  {`${start.format("ddd D-MMM-YYYY h:mm A")} - ${end.format("h:mm A")} (${session.location})`}
                </Typography>
                <Typography variant="caption" color="text.primary" sx={{position:"absolute", right:0}}>
                  {`${getTrainingById(session.training)?.nbOfParticipants - (getTrainingById(session.training)?.nbOfConfirmedRequests || 0)} places left (${(getTrainingById(session.training)?.nbOfConfirmedRequests || 0)}/${getTrainingById(session.training)?.nbOfParticipants})`}
                </Typography>
              </>
            }
          />
        </ListItem>
      );
    };
    const renderRegistration = (traineeId, training, date) => {
      const trainee = traineesData[traineeId];
      const traineeName = trainee?.name || "Unknown";
    
      return (
        <ListItem disableGutters sx={{ width: "100%" }} key={`${traineeId}-${training._id}`}>
          <ListItemIcon>
            <PersonAddAlt1Icon fontSize="medium" />
          </ListItemIcon>
          <ListItemText
            primary={
              <>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1">{traineeName}</Typography>
                  <Typography variant="caption" color="text.primary" sx={{position:"absolute", right:0}}>
                  {dayjs(date).format("DD-MM-YYYY HH:mm")}
                  </Typography>
                </Box>
              </>
              }
            secondary={
              <>
                <Typography variant="body1">{training.title}</Typography>
                <Typography variant="body2">
                  {formatDaysWithMonth(training.date, training.month)}
                </Typography>
              </>
            }
          />
        </ListItem>
      );
    };    
    const renderTraining = (training) => {
      return (
        <Box
          key={training._id}
          sx={{
            width: "100%",
            maxHeight: training.showDetails ? "800px" : "200px",
            overflowY: "auto",
            transition: "max-height 0.3s ease-in-out",
            mt: 2,
          }}
        >
          <ListItem disableGutters sx={{ width: "100%", }}>
            <ListItemIcon>
              <EventAvailableIcon fontSize="medium" />
            </ListItemIcon>
            <ListItemText
              primary={training.title}
              secondary={
                <>
                  <Typography variant="body2">
                    {formatDaysWithMonth(training.date, training.month)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.primary"
                    sx={{ position: "absolute", right: 0 }}
                  >
                  </Typography>
                </>
              }
            />
            {user?.role !== "trainee" && selectedRole!== "trainee"?<Rating name="Score" value={Math.round(((training.hotEvalRate || 2)+(training.coldEvalRate || 2))/2)} readOnly />:null}
            <Tooltip title={training.showDetails ? t("hide_details") : t("view_details")} arrow>
              <IconButton
                sx={{ color: "darkgrey" }}
                onClick={() => updateShowDetails(training._id, !training.showDetails)}
              >
                {training.showDetails ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          </ListItem>
          <Box
            sx={{
              width:"100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {training.showDetails && (
              <Box
                sx={{
                  width:"100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              > 
                <Typography
                    sx={{
                        fontSize: 18,
                        textAlign: "center",
                        letterSpacing: 0.2,
                        lineHeight: 1,
                        userSelect: "none",
                        cursor: "pointer",
                        color: "text.primary",
                        marginBottom: 1,
                        marginTop: 1,
                    }}
                >
                    {t("training_details")}
                </Typography>
                {user?.role === "manager"?<Box
                    sx={{
                      ...paperStyle,
                      width: "95%",
                      height:"auto",
                      marginBottom: 1,
                    }}
                  >
                      <Typography variant="subtitle1">{t("costs")}</Typography>
                      <Box
                        sx={{
                          width:"100%",
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 1,
                        }}
                      >
                        <Typography variant="body2">
                        <strong>{t("cost_per_trainer")}</strong> : {training.costPerTrainer} DT
                        </Typography>
                        <Typography variant="body2">
                        <strong>{t("cost_per_trainee")}</strong>: {training.costPerTrainee} DT
                        </Typography>
                      </Box>
                </Box>:null}
                {rawData.sessions
                .filter((session) => session.training === training._id)
                .map((session) => (
                  <Box
                    key={session._id}
                    sx={{
                      ...paperStyle,
                      width: "95%",
                      height:"auto",
                      marginBottom: 1, 
                    }}
                  >
                    <Box
                      sx={{
                        width:"100%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 1,
                      }}
                    >
                      <Typography variant="subtitle1">{session.name}</Typography>
                      <Typography variant="body2">
                      <strong>{t("date")}</strong> : {session.date}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      <strong>{t("number_of_present_trainee")}</strong> : {session.presenttrainees?.length || 0}
                    </Typography>
                  </Box>
                ))}
                <Typography
                    sx={{
                        fontSize: 18,
                        textAlign: "center",
                        letterSpacing: 0.2,
                        lineHeight: 1,
                        userSelect: "none",
                        cursor: "pointer",
                        color: "text.primary",
                        marginBottom: 1,
                        marginTop: 1,
                    }}
                >
                    {(user.role === "trainee" || selectedRole === "trainee")?t("your_details"):t("trainees_details")}
                </Typography>
                {training.confirmedtrainees?.filter((traineeId) => {
                    const trainee = user._id === traineeId;
                    const isTrainer = (user?.role === "trainer" || selectedRole === "trainer");
                    const isTrainee = (user?.role === "trainee" || selectedRole === "trainee"); 
                    const isManager = (user?.role === "manager");
                    return (
                      (trainee && isTrainee) || isManager || isTrainer
                    );
                  }).map((traineeId) => {
                  const user = filteredData.users.find(u => u._id === traineeId);
                  const trainingData = user?.trainingsAttended?.find(
                    t => t.training === training._id
                  );

                  if (!user || !trainingData) return null;

                  return (
                    <Box
                      key={user?._id}
                      elevation={2}
                      sx={{
                        ...paperStyle,
                        width: "95%",
                        height:"auto",
                        marginBottom: 1, 
                      }}
                    >
                      <Typography variant="h8">{user.name}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Typography><strong>{t("score")}</strong></Typography>
                        <Typography>{t("pre")} : <strong>{trainingData.scorePreTraining}</strong></Typography>
                        <Typography>{t("post")} : <strong>{trainingData.scorePostTraining}</strong></Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      );
    };
    const renderNews = (training) => {
      return (
        <ListItem key={training._id} disableGutters sx={{width:"100%"}}>
          <ListItemIcon>
            <CalendarTodayIcon fontSize="medium" />
          </ListItemIcon>
          <ListItemText
            primary={`${training.title}`}
            secondary={
              <>
                <Typography variant="body2">
                  {`${formatDaysWithMonth(training.date,training.month)} (${training.location})`}
                </Typography>
                <Typography variant="caption" color="text.primary" sx={{position:"absolute", right:0}}>
                  {`${training?.nbOfParticipants - (training?.nbOfConfirmedRequests || 0)} places left (${(training?.nbOfConfirmedRequests || 0)}/${training?.nbOfParticipants})`}
                </Typography>
              </>
            }
          />
        </ListItem>
      );
    };
    const renderEmployeeTraining = (id) => {
      const training = getTrainingById(id);
      const sessions = getTrainingSessionsById(id);

      if (!training) return null;

      return (
        <Box sx={{ width: '100%', 
          padding: '8px 12px',
          display: 'flex',
          flexDirection: "row",
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Box
            sx={{
              width: '30%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {training.title}
            </Typography>
            <Box sx={{ marginLeft: 2, marginBottom: 2 }}>
              {sessions.map((session) => (
                <Typography key={session._id} variant="body2">
                  {session.name}
                </Typography>
              ))}
            </Box>
          </Box>
          <Table size="small" sx={{ minWidth: '70%', border: '1px solid #ccc' }}>
            <TableHead>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: 250 }}>Month</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: 250 }}>Type</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: 250 }}>Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: 250 }}>Number Of Hours</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: 250 }}>Location</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', width: 250 }}>Mode</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell align="center">{t(training.month)}</TableCell>
                <TableCell align="center">{t(training.type)}</TableCell>
                <TableCell align="center">{formatDaysWithMonth(training.date,training.month)}</TableCell>
                <TableCell align="center">{training.nbOfHours}</TableCell>
                <TableCell align="center">{training.location}</TableCell>
                <TableCell align="center">{t(training.mode)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      );
    };


    // Selected Training in the recap .........
    const [selectedTraining, setSelectedTraining] = useState('all');

    // Tables ..............
    const firstmetrics = [
      { name: 'Total Number of planned trainings', recap: metrics.numberOfTrainings, objGap: '' },
      { name: 'Total Number of delivered Trainings', recap: completedTrainings.length, objGap: '' },
      { name: 'Total Number of delivered Soft skills Trainings', recap: metrics.numberOfSoftSkillsTrainings, objGap: '' },
      { name: 'Total Number of delivered Technical skills Trainings conducted by Internal trainers', recap: metrics.numberOfInternTechnicalSkillsTrainings, objGap: '' },
      { name: 'Total Number of delivered Technical skills Trainings conducted by External trainers', recap: metrics.numberOfExternTechnicalSkillsTrainings, objGap: '' },
      { name: 'Training Completion rate (Delivered/Planned) (obj 80%)', recap: ((completedTrainings.length / metrics.numberOfTrainings) * 100).toFixed(2) + '%', objGap: (80 - (completedTrainings.length / metrics.numberOfTrainings) * 100)  + '%'},
      { name: 'Total number of face to face trainings', recap: metrics.numberOfFTFTrainings, objGap: '' },
      { name: 'Percentage of face to face Trainings (Obj 75%)', recap: ((metrics.numberOfFTFTrainings/metrics.numberOfTrainings)*100).toFixed(2) + '%', objGap: (75 - (metrics.numberOfFTFTrainings/metrics.numberOfTrainings)*100).toFixed(2) +'%' },
      { name: 'Total number of online trainings', recap: metrics.numberOfOnlineTrainings, objGap: '' },
      { name: 'Percentage of online trainings (Obj 25%)', recap: ((metrics.numberOfOnlineTrainings/metrics.numberOfTrainings)*100).toFixed(2) + '%', objGap: (25 - (metrics.numberOfOnlineTrainings/metrics.numberOfTrainings)*100).toFixed(2) + '%' },
      { name: 'Number of participants', recap: metrics.numberOfParticipants, objGap: '' },
      { name: 'Total Hours of Soft skills training', recap: metrics.numberOfSoftSkillsHours, objGap: '' },
      { name: 'Total Hours of Technical skills training', recap: metrics.numberOfTechnicalSkillsHours, objGap: '' },
      { name: 'Total number of Training hours', recap: metrics.numberOfSoftSkillsHours + metrics.numberOfTechnicalSkillsHours, objGap: '' },
      { name: 'Total Number of trained employees per one training', recap: metrics.numberOfTrainedEmployees, objGap: ''},
      { name: 'Percentage of participation (number of trained employees/HC)', recap: ((metrics.numberOfTrainedEmployees/metrics.numberOfEmployees)*100).toFixed(2) + '%', objGap: '' },
      { name: 'Total number of hours per trainees', recap: metrics.numberOfAttendedHours, objGap: '' },
      { name: 'Average Number of hours per Trained employee', recap: (metrics.numberOfAttendedHours/(metrics.numberOfSoftSkillsHours + metrics.numberOfTechnicalSkillsHours)).toFixed(2), objGap: '' },
      { name: 'Average Training Duration by participant(number of training hours per part/ Number of trained Employees)', recap: (metrics.numberOfAttendedHours/metrics.numberOfTrainedEmployees), objGap: '' },
      { name: 'Current internal trainers number', recap: metrics.numberOfInternalTrainers, objGap: '' },
      { name: 'Internal Trainers Ratio ( number of trainers/current HC)', recap: metrics.numberOfInternalTrainers/metrics.numberOfEmployees , objGap: '' },
      { name: 'Current External Trainers', recap: metrics.numberOfEmployees - metrics.numberOfInternalTrainers, objGap: '' },
      { name: `Number of Satisfactorily Evaluated Trainings en ${new Date().getFullYear()}`, recap: metrics.numberOfSatisfactorilyEvaluatedTrainings, objGap: '' },
      { name: `Training Effectiveness Rate in ${new Date().getFullYear()} (obj 80%)`, recap: ((metrics.numberOfSatisfactorilyEvaluatedTrainings/completedTrainings.length)*100).toFixed(2) + '%', objGap: (80 - ((metrics.numberOfSatisfactorilyEvaluatedTrainings/completedTrainings.length)*100).toFixed(2)) + '%'},
    ];
    const secondmetrics = [
      { name: 'Type', recap: t(getTrainingById(selectedTraining)?.type), objGap: '' },
      { name: 'Location', recap: getTrainingById(selectedTraining)?.location, objGap: '' },
      { name: 'Number of hours', recap: getTrainingById(selectedTraining)?.nbOfHours, objGap: '' },
      { name: 'Number of received requests', recap: getTrainingById(selectedTraining)?.nbOfReceivedRequests, objGap: '' },
      { name: 'Number of invited participants (enrolled individuals)', recap: getTrainingById(selectedTraining)?.nbOfParticipants, objGap: '' },
      { name: 'NB of attendees', recap: getFirstSessionByTraining(selectedTraining)?.presenttrainees?.length ?? 0, objGap: ''},
      { name: 'Number of attendees who completed the training', recap: getLastSessionByTraining(selectedTraining)?.presenttrainees?.length ?? 0, objGap: '' },
      { name: 'Hot Evaluation total rate (Objective 80%)', recap: (getTrainingById(selectedTraining)?.hotEvalRate*100 || 0)/5 + '%' , objGap: 80 - (getTrainingById(selectedTraining)?.hotEvalRate*100 || 0)/5 + '%' },
      { name: 'Cold Evaluation total rate (Objective 70%)', recap: (getTrainingById(selectedTraining)?.coldEvalRate*100 || 0)/5 + '%' , objGap: 70 - (getTrainingById(selectedTraining)?.coldEvalRate*100 || 0)/5 + '%' },
      { name: 'Training fill rate (Number of Attendees/available seats=12)', recap: ((getFirstSessionByTraining(selectedTraining)?.presenttrainees?.length ?? 0) / (getTrainingById(selectedTraining)?.nbOfParticipants)), objGap: '' },
      { name: 'Completion rate (Number of attendees who completed/ nb of attendees)',recap: ((getFirstSessionByTraining(selectedTraining)?.presenttrainees?.length ?? 0) / (getLastSessionByTraining(selectedTraining)?.presenttrainees?.length ?? 0)), objGap: '' },
      { name: 'Training cost per trainer (TND)', recap: t(getTrainingById(selectedTraining)?.costPerTrainer), objGap: '' },
      { name: 'Training cost per trainee (TND)', recap: t(getTrainingById(selectedTraining)?.costPerTrainee), objGap: '' },
    ];
    const fourthmetrics = [
      { grade: 'F1', nboftrainees: metrics.numberOfF1ConfirmedTrainees, employees: metrics.numberOfF1Trainees, HCgradesdistribution: metrics.rateOfF1Grade.toFixed(2) + '%', participationRate: metrics.rateOfF1ConfirmedGrade.toFixed(2) + '%', participationRateDist : ((metrics.numberOfF1Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'F2', nboftrainees: metrics.numberOfF2ConfirmedTrainees, employees: metrics.numberOfF2Trainees, HCgradesdistribution: metrics.rateOfF2Grade.toFixed(2) + '%', participationRate: metrics.rateOfF2ConfirmedGrade.toFixed(2) + '%', participationRateDist : ((metrics.numberOfF2Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'F3', nboftrainees: metrics.numberOfF3ConfirmedTrainees, employees: metrics.numberOfF3Trainees, HCgradesdistribution: metrics.rateOfF3Grade.toFixed(2) + '%', participationRate: metrics.rateOfF3ConfirmedGrade.toFixed(2) + '%', participationRateDist : ((metrics.numberOfF3Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'F4', nboftrainees: metrics.numberOfF4ConfirmedTrainees, employees: metrics.numberOfF4Trainees, HCgradesdistribution: metrics.rateOfF4Grade.toFixed(2) + '%', participationRate: metrics.rateOfF4ConfirmedGrade.toFixed(2) + '%' , participationRateDist : ((metrics.numberOfF4Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'M1', nboftrainees: metrics.numberOfM1ConfirmedTrainees, employees: metrics.numberOfM1Trainees, HCgradesdistribution: metrics.rateOfM1Grade.toFixed(2) + '%', participationRate: metrics.rateOfM1ConfirmedGrade.toFixed(2) + '%' , participationRateDist : ((metrics.numberOfM1Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'M2', nboftrainees: metrics.numberOfM2ConfirmedTrainees, employees: metrics.numberOfM2Trainees, HCgradesdistribution: metrics.rateOfM2Grade.toFixed(2) + '%', participationRate: metrics.rateOfM2ConfirmedGrade.toFixed(2) + '%' , participationRateDist : ((metrics.numberOfM2Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'M3', nboftrainees: metrics.numberOfM3ConfirmedTrainees, employees: metrics.numberOfM3Trainees, HCgradesdistribution: metrics.rateOfM3Grade.toFixed(2) + '%', participationRate: metrics.rateOfM3ConfirmedGrade.toFixed(2) + '%' , participationRateDist : ((metrics.numberOfM3Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'M4', nboftrainees: metrics.numberOfM4ConfirmedTrainees, employees: metrics.numberOfM4Trainees, HCgradesdistribution: metrics.rateOfM4Grade.toFixed(2) + '%', participationRate: metrics.rateOfM4ConfirmedGrade.toFixed(2) + '%' , participationRateDist : ((metrics.numberOfM4Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'M5', nboftrainees: metrics.numberOfM5ConfirmedTrainees, employees: metrics.numberOfM5Trainees, HCgradesdistribution: metrics.rateOfM5Grade.toFixed(2) + '%', participationRate: metrics.rateOfM5ConfirmedGrade.toFixed(2) + '%' , participationRateDist : ((metrics.numberOfM5Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'M6', nboftrainees: metrics.numberOfM6ConfirmedTrainees, employees: metrics.numberOfM6Trainees, HCgradesdistribution: metrics.rateOfM6Grade.toFixed(2) + '%', participationRate: metrics.rateOfM6ConfirmedGrade.toFixed(2) + '%' , participationRateDist : ((metrics.numberOfM6Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'L1', nboftrainees: metrics.numberOfL1ConfirmedTrainees, employees: metrics.numberOfL1Trainees, HCgradesdistribution: metrics.rateOfL1Grade.toFixed(2) + '%', participationRate: metrics.rateOfL1ConfirmedGrade.toFixed(2) + '%', participationRateDist : ((metrics.numberOfL1Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'L2', nboftrainees: metrics.numberOfL2ConfirmedTrainees, employees: metrics.numberOfL2Trainees, HCgradesdistribution: metrics.rateOfL2Grade.toFixed(2) + '%', participationRate: metrics.rateOfL2ConfirmedGrade.toFixed(2) + '%' , participationRateDist : ((metrics.numberOfL2Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'L3', nboftrainees: metrics.numberOfL3ConfirmedTrainees, employees: metrics.numberOfL3Trainees, HCgradesdistribution: metrics.rateOfL3Grade.toFixed(2) + '%', participationRate: metrics.rateOfL3ConfirmedGrade.toFixed(2) + '%' , participationRateDist : ((metrics.numberOfL3Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { grade: 'L4', nboftrainees: metrics.numberOfL4ConfirmedTrainees, employees: metrics.numberOfL4Trainees, HCgradesdistribution: metrics.rateOfL4Grade.toFixed(2) + '%', participationRate: metrics.rateOfL4ConfirmedGrade.toFixed(2) + '%' , participationRateDist : ((metrics.numberOfL4Trainees/trainedEmployees.length)*100).toFixed(2) + '%'},
    ];
    const sixmetrics = [
      { activity: 'Space', nboftrainees: metrics.numberOfSpaceConfirmedTrainees, employees: metrics.numberOfSpaceTrainees, hcbyactivity: metrics.rateOfSpaceActivity.toFixed(2) + '%', participationRate: metrics.rateOfSpaceConfirmedActivity.toFixed(2) + '%', participationRateByAct: ((metrics.numberOfSpaceTrainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { activity: 'Electronics', nboftrainees: metrics.numberOfElectronicsConfirmedTrainees, employees: metrics.numberOfElectronicsTrainees, hcbyactivity: metrics.rateOfElectronicsActivity.toFixed(2) + '%', participationRate: metrics.rateOfElectronicsConfirmedActivity.toFixed(2) + '%', participationRateByAct:((metrics.numberOfElectronicsTrainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { activity: 'Media & Energy', nboftrainees: metrics.numberOfMediaAndEnergyConfirmedTrainees, employees: metrics.numberOfMediaAndEnergyTrainees, hcbyactivity: metrics.rateOfMediaAndEnergyActivity.toFixed(2) + '%', participationRate: metrics.rateOfMediaAndEnergyConfirmedActivity.toFixed(2) + '%', participationRateByAct:((metrics.numberOfMediaAndEnergyTrainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { activity: 'E-paysys', nboftrainees: metrics.numberOfEpaysysConfirmedTrainees, employees: metrics.numberOfEpaysysTrainees, hcbyactivity: metrics.rateOfEpaysysActivity.toFixed(2) + '%', participationRate: metrics.rateOfEpaysysConfirmedActivity.toFixed(2) + '%', participationRateByAct:((metrics.numberOfEpaysysTrainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { activity: 'Quality', nboftrainees: metrics.numberOfQualityConfirmedTrainees, employees: metrics.numberOfQualityTrainees, hcbyactivity: metrics.rateOfQualityActivity.toFixed(2) + '%', participationRate: metrics.rateOfQualityConfirmedActivity.toFixed(2) + '%', participationRateByAct:((metrics.numberOfQualityTrainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { activity: 'Telecom', nboftrainees: metrics.numberOfTelecomConfirmedTrainees, employees: metrics.numberOfTelecomTrainees, hcbyactivity: metrics.rateOfTelecomActivity.toFixed(2) + '%', participationRate: metrics.rateOfTelecomConfirmedActivity.toFixed(2) + '%', participationRateByAct:((metrics.numberOfTelecomTrainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { activity: 'Databox', nboftrainees: metrics.numberOfDataboxConfirmedTrainees, employees: metrics.numberOfDataboxTrainees, hcbyactivity: metrics.rateOfDataboxActivity.toFixed(2) + '%', participationRate: metrics.rateOfDataboxConfirmedActivity.toFixed(2) + '%', participationRateByAct:((metrics.numberOfDataboxTrainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { activity: 'Information Systems', nboftrainees: metrics.numberOfInformationSystemsConfirmedTrainees, employees: metrics.numberOfInformationSystemsTrainees, hcbyactivity: metrics.rateOfInformationSystemsActivity.toFixed(2) + '%', participationRate: metrics.rateOfInformationSystemsConfirmedActivity.toFixed(2) + '%', participationRateByAct:((metrics.numberOfInformationSystemsTrainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { activity: 'Mechanical', nboftrainees: metrics.numberOfMechanicalConfirmedTrainees, employees: metrics.numberOfMechanicalTrainees, hcbyactivity: metrics.rateOfMechanicalActivity.toFixed(2) + '%', participationRate: metrics.rateOfMechanicalConfirmedActivity.toFixed(2) + '%', participationRateByAct:((metrics.numberOfMechanicalTrainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { activity: 'Enablers', nboftrainees: metrics.numberOfEnablersConfirmedTrainees, employees: metrics.numberOfEnablersTrainees, hcbyactivity: metrics.rateOfEnablersActivity.toFixed(2) + '%', participationRate: metrics.rateOfEnablersConfirmedActivity.toFixed(2) + '%', participationRateByAct:((metrics.numberOfEnablersTrainees/trainedEmployees.length)*100).toFixed(2) + '%'},
      { activity: 'Other', nboftrainees: metrics.numberOfOtherConfirmedAct, employees: metrics.numberOfOtherAct, hcbyactivity: metrics.rateOfOtherActivity.toFixed(2) + '%', participationRate: metrics.rateOfOtherConfirmedActivity.toFixed(2) + '%', participationRateByAct:((metrics.numberOfOtherAct/trainedEmployees.length)*100).toFixed(2) + '%'},
    ];

    return (
        <Box
          sx={{
            width:"100%",
            display:"flex",
            flexDirection: "row",
            justifyContent:"start",
            alignItems:"start",
            padding:"10px",
            minHeight: view === "statistics" ? "2500px": "auto",
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
              position: "sticky",
              top : "20px",
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
                marginTop:"30px",
                padding:"10px",
                gap: "15px",
              }}
            >
              <Button
                sx={buttonStyle("trainings")}
                onClick={() => setView("trainings")}
              >
                {t("trainings")}
              </Button>
              {user?.role === "manager"?
              <Button
                sx={buttonStyle("statistics")}
                onClick={() => setView("statistics")}
              >
                {t("statistics")}
              </Button>:null}
              {view === "statistics" ?
              <Box
                sx={{
                  width:"100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Button
                  sx={subButtonStyle("charts")}
                  onClick={() => setStatView("charts")}
                >
                  {t("charts")}
                </Button>
                <Button
                  sx={subButtonStyle("recap")}
                  onClick={() => setStatView("recap")}
                >
                  {t("recap")}
                </Button>
                <Button
                  sx={subButtonStyle("employees")}
                  onClick={() => setStatView("employees")}
                >
                  {t("employees")}
                </Button>
                <Button
                  sx={subButtonStyle("employees_details")}
                  onClick={() => setStatView("employees_details")}
                >
                  {t("employees_details")}
                </Button>
              </Box>
              :null}
            </Box>
          </Box>
          <Box
            sx={{
              width:"80%",
              height:"100vh",
              display:"flex",
              flexDirection: "column",
              gap: "20px",
              justifyContent:"start",
              alignItems:"center",
              padding: "20px",
            }}
          >
            <Box
              sx={{
                width:"100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                paddingLeft: "40px",
                paddingRight: "40px",
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
                  {t(view)}
              </Typography>
              {user?.role === "manager"?<Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    views={['month']}
                    label="Start Month"
                    minDate={dayjs().startOf('year')}
                    maxDate={dayjs().endOf('year')}
                    value={startMonth}
                    onChange={(newValue) => setStartMonth(newValue)}
                    sx={{ width: 150 }}
                  />
                  <DatePicker
                    views={['month']}
                    label="End Month"
                    minDate={dayjs().startOf('year')}
                    maxDate={dayjs().endOf('year')}
                    value={endMonth}
                    onChange={(newValue) => setEndMonth(newValue)}
                    sx={{ width: 150 }}
                  />
                </LocalizationProvider>
              </Box>:null}
              {user?.role === "manager" && view === "statistics"?<Box
                sx={{
                  width:"20%",
                }}
              >
                <Button 
                  onClick={showExportWord}
                  sx={buttonStyle} 
                  startIcon={<FileDownloadIcon />}
                >
                  {t("download_statistics")}
                </Button>
              </Box>:null}
            </Box>
            {view === "statistics" && user?.role === "manager"?
            <Box
              id="statistics-container"
              sx={{
                width: "100%",
                height: 'auto',
                boxSizing: 'border-box',
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "start",
                gap: "20px",
                padding:"20px",
              }}
            >
              {statView === "charts"?<Box
                sx={{
                  width:"100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "start",
                  gap:"20px",
                }}
              >
                <Box
                    id="section1" 
                    sx={paperStyle}
                    ref={skillTypeChart}
                  />
                <Box
                    id="section2"
                    sx={paperStyle}
                    ref={hoursChart}
                  />
              </Box>:null}
              {statView === "charts"?<Box
                sx={{
                  width:"100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "start",
                  gap:"20px",
                }}
              >
                <Box
                  id="section3"
                  sx={paperStyle}
                  ref={activityChart}
                />
                <Box
                  id="section4"
                  sx={paperStyle}
                  ref={gradeChart}
                />
              </Box>:null}
              {statView === "charts"?<Box
                sx={{
                  width:"100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "start",
                  gap:"20px",
                }}
              >
                <Box
                  id="section5"
                  sx={paperStyle}
                  ref={trainingsByMonthChart}
                />
                <Box
                  id="section6"
                  sx={paperStyle}
                  ref={traineesByMonthChart}
                />
              </Box>:null}   
              {statView === "charts"?<Box
                id="section7"
                sx={paperStyle}
                ref={genderChart}
              />:null} 
              {statView === "recap"?<TableContainer id="section6" component={Paper} >
                <Table sx={{ minWidth: 400 }} aria-label="training metrics table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '60%' }}>Recap</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>Total - {new Date().getFullYear()}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>Obj Gap</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {firstmetrics.map((metric, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2">{metric.name}</Typography>
                        </TableCell>
                        <TableCell align="center">{metric.recap}</TableCell>
                        <TableCell align="center">{metric.objGap}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>:null} 
              {statView === "recap"?<TextField
                  select
                  label={t("training")}
                  value={selectedTraining}
                  onChange={(e) => setSelectedTraining(e.target.value)}
                  sx={{ width: '20%' }}
              >
                  <MenuItem key="all" value="all">
                      {t("select_training")}
                  </MenuItem>

                  {filteredData.trainings.map((training) => (
                      <MenuItem key={training._id} value={training._id}>
                          {training.title} 
                      </MenuItem>
                  ))}
              </TextField>:null}
              {statView === "recap"?<TableContainer id="section7" component={Paper}>
                <Table sx={{ minWidth: 400 }} aria-label="training metrics table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '60%' }}>Recap</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>Total - {new Date().getFullYear()}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>Obj Gap</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {secondmetrics.map((metric, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2">{metric.name}</Typography>
                        </TableCell>
                        <TableCell align="center">{metric.recap}</TableCell>
                        <TableCell align="center">{metric.objGap}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>:null} 
              {statView === "employees"?<Typography
                sx={{
                    fontSize: 24,
                    fontWeight: "bold",
                    textAlign: "center",
                    letterSpacing: 0.2,
                    lineHeight: 1,
                    userSelect: "none",
                    cursor: "pointer",
                }}
              >
                  {t("list_of_trained_employees")}
              </Typography>:null}
              {statView === "employees"?<TableContainer id="section8" component={Paper}>
                <Table sx={{ minWidth: 400 }} aria-label="training metrics table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>NB</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Name</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Gender</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>{`Grade ${new Date().getFullYear()}`}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>{`Job Title  ${new Date().getFullYear()}`}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>N + 1</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainedEmployees.map((metric, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row" sx={{textAlign:"center"}}>
                          <Typography variant="body2">{index+1}</Typography>
                        </TableCell>
                        <TableCell align="center">{metric.name}</TableCell>
                        <TableCell align="center">{t(metric.gender)}</TableCell>
                        <TableCell align="center">{metric.grade}</TableCell>
                        <TableCell align="center">{t(metric.jobtitle)}</TableCell>
                        <TableCell align="center">{metric.chef}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>:null}
              {statView === "employees"?<Typography
                sx={{
                    fontSize: 24,
                    fontWeight: "bold",
                    textAlign: "center",
                    letterSpacing: 0.2,
                    lineHeight: 1,
                    userSelect: "none",
                    cursor: "pointer",
                }}
              >
                  {t("total_number_of_trained_employees")} {`in ${new Date().getFullYear()}`} : {metrics.numberOfTrainedEmployees}
              </Typography>:null}
              {statView === "employees"?<TableContainer id="section9" component={Paper}>
                <Table sx={{ minWidth: 400 }} aria-label="training metrics table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Grade</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Total NB Of Trainees</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Employees</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>HC Grade'distribution</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Participation Rate</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Participation Rate Distribution By Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fourthmetrics.map((metric, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row" sx={{textAlign:"center"}}>
                          <Typography variant="body2">{metric.grade}</Typography>
                        </TableCell>
                        <TableCell align="center">{metric.nboftrainees}</TableCell>
                        <TableCell align="center">{t(metric.employees)}</TableCell>
                        <TableCell align="center">{metric.HCgradesdistribution}</TableCell>
                        <TableCell align="center">{t(metric.participationRate)}</TableCell>
                        <TableCell align="center">{t(metric.participationRateDist)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>:null}
              {statView === "employees"?<TableContainer id="section11" component={Paper}>
                <Table sx={{ minWidth: 400 }} aria-label="training metrics table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Activity</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Total NB Of Trainees</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Employees</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>HC by activity</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Participation Rate</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '15%' }}>Participation rate Distribution by Activity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sixmetrics.map((metric, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row" sx={{textAlign:"center"}}>
                          <Typography variant="body2">{metric.activity}</Typography>
                        </TableCell>
                        <TableCell align="center">{t(metric.nboftrainees)}</TableCell>
                        <TableCell align="center">{t(metric.employees)}</TableCell>
                        <TableCell align="center">{metric.hcbyactivity}</TableCell>
                        <TableCell align="center">{t(metric.participationRate)}</TableCell>
                        <TableCell align="center">{t(metric.participationRateByAct)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>:null}
              {statView === "employees_details" ? (
                <TableContainer
                  id="section8"
                  component={Paper}
                  sx={{
                    maxWidth: '100vw',
                    overflowX: 'auto',
                    margin: 'auto',
                  }}
                >
                  <Table
                    sx={{
                      minWidth: 1500,
                      tableLayout: 'fixed',
                    }}
                    aria-label="employee details table"
                  >
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: 60 }}>NB</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: 200 }}>Name</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: 120 }}>Gender</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: 180 }}>Activity</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: 150 }}>{`Grade ${new Date().getFullYear()}`}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: 200 }}>{`Job Title ${new Date().getFullYear()}`}</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: 180 }}>N + 1</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', width: 1500 }}>Trainings</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trainedEmployees.map((metric, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row" align="center">
                            <Typography variant="body2">{index + 1}</Typography>
                          </TableCell>
                          <TableCell align="center">{metric.name}</TableCell>
                          <TableCell align="center">{t(metric.gender)}</TableCell>
                          <TableCell align="center">{t(metric.activity)}</TableCell>
                          <TableCell align="center">{metric.grade}</TableCell>
                          <TableCell align="center">{t(metric.jobtitle)}</TableCell>
                          <TableCell align="center">{metric.chef}</TableCell>
                          <TableCell align="center" sx={{padding: "0px"}}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {metric.trainingsAttended?.map((training, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    width: '100%',
                                    height: "auto",
                                  }}
                                >
                                  {renderEmployeeTraining(training.training)}
                                </Box>
                              ))}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
            ) : null}
            </Box>:null}
            {view === "trainings" ? 
            <Box
              sx={{
                width: "100%",
                height: 'auto',
                boxSizing: 'border-box',
                display: "flex",
                flexDirection: "row",
                alignItems: "start",
                justifyContent: "start",
                gap: "20px",
                padding:"20px",
              }}
            >
              <Box
                sx={{
                  width:"50%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "start",
                  justifyContent: "start",
                  gap:"20px",
                }}
              >
                <Box sx={{...paperStyle, height: "auto", width: "100%"}}>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: "bold",
                      textAlign: "center",
                      letterSpacing: 0.5,
                      lineHeight: 1.2,
                      userSelect: "none",
                      cursor: "default",
                      color: "#333", 
                      fontFamily: "sans-serif",
                    }}
                  >
                    {(user.role==="trainee" || selectedRole==="trainee")?t("upcoming_enrolled_sessions"):t("upcoming_sessions")}
                  </Typography>
                  <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: '20px',
                        marginTop: "30px",
                      }}
                  >
                      <Button 
                          sx={filterStyle}
                          onClick={() => setSelectedFilter("all")}
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
                          sx={{...filterStyle, backgroundColor : "#E0E0E0"}}
                          onClick={() => setSelectedFilter("scheduled")}
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
                          {metrics.numberOfScheduled}<br/>{t("scheduled")}
                      </Button>
                      <Button 
                      sx={{
                          ...filterStyle,
                          backgroundColor: "#90CAF9",
                          position: "relative",
                      }}
                      onClick={() => setSelectedFilter("in_progress")}
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
                      {metrics.numberOfInProgress}<br/>{t("in_progress")}
                      <br />
                      </Button>
                  </Box>
                  {sessionsNextWeek.length > 0 && (
                    <>
                      <Typography variant="subtitle1" fontWeight="bold" mt={5}>{t("next_week")}</Typography>
                      <List dense sx={{width:"100%", marginBottom: 2}}>{sessionsNextWeek.map(renderSession)}</List>
                    </>
                  )}
                  {sessionsNextWeek.length !== 0 && <Divider sx={{ width: "90%" }} />}
                  {sessionsLaterThisMonth.length > 0 && (
                    <>
                      <Typography variant="subtitle1" fontWeight="bold" mt={2}>{t("later_this_month")}</Typography>
                      <List dense sx={{width:"100%" , marginBottom: 2}}>{sessionsLaterThisMonth.map(renderSession)}</List>
                    </>
                  )}
                  {sessionsLaterThisMonth.length !== 0 && <Divider sx={{ width: "90%" }} />}
                  {sessionsAfterOneMonth.length > 0 && (
                    <>
                      <Typography variant="subtitle1" fontWeight="bold" mt={2}>{t("after_one_month")}</Typography>
                      <List dense sx={{width:"100%", marginBottom: 2}}>{sessionsAfterOneMonth.map(renderSession)}</List>
                    </>
                  )}
                </Box>
                <Box sx={{...paperStyle, height: "auto", width: "100%"}}>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: "bold",
                      textAlign: "center",
                      letterSpacing: 0.5,
                      lineHeight: 1.2,
                      userSelect: "none",
                      cursor: "default",
                      color: "#333", 
                      fontFamily: "sans-serif",
                    }}
                  >
                    {t("completed_trainings")}
                  </Typography>
                  {completedTrainings.length > 0 && (
                    <>
                      <Box
                        sx={{
                          width:"100%",
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 2,
                        }}
                      >
                        <List dense sx={{width:"100%"}}>{completedTrainings.map(renderTraining)}</List>
                      </Box>
                      <Divider sx={{width:"90%"}} />
                    </>
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  width:"50%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "start",
                  gap:"20px",
                }}
              >
                <Box sx={{...paperStyle, height: "auto", width: "100%"}}>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: "bold",
                      textAlign: "center",
                      letterSpacing: 0.5,
                      lineHeight: 1.2,
                      userSelect: "none",
                      cursor: "default",
                      color: "#333", 
                      fontFamily: "sans-serif",
                    }}
                  >
                    {(user.role==="trainee" || selectedRole==="trainee")?t("news"):t("registrations")}
                  </Typography>
                  {(user.role==="trainee" || selectedRole==="trainee")?
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width:"100%",
                      justifyContent: "start",
                      alignItems: "start",
                      gap: '5px',
                      marginBottom: "20px",
                    }}
                  >
                    {TrainingsThisMonth.length > 0 && (
                      <>
                        <Typography variant="subtitle1" fontWeight="bold" mt={5}>{t("this_month")}</Typography>
                        <List dense sx={{width:"100%", marginBottom: 2}}>{TrainingsThisMonth.map(renderNews)}</List>
                      </>
                    )}
                    {TrainingsNextMonth.length > 0 && (
                      <>
                        <Typography variant="subtitle1" fontWeight="bold" mt={5}>{t("next_month")}</Typography>
                        <List dense sx={{width:"100%", marginBottom: 2}}>{TrainingsNextMonth.map(renderNews)}</List>
                      </>
                    )}
                    {TrainingsAfterNextMonth.length > 0 && (
                      <>
                        <Typography variant="subtitle1" fontWeight="bold" mt={5}>{t("after_next_month")}</Typography>
                        <List dense sx={{width:"100%", marginBottom: 2}}>{TrainingsAfterNextMonth.map(renderNews)}</List>
                      </>
                    )}
                  </Box>:null}
                  {(user.role!=="trainee" && selectedRole!=="trainee")?<Typography variant="body2" sx={{marginTop: "30px",fontWeight:"bold",marginBottom:"5px"}}>
                    {t("this_month")}
                  </Typography>:null}
                  {(user.role!=="trainee" && selectedRole!=="trainee")?
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: '20px',
                      marginBottom: "20px",
                    }}
                  >
                      <Button 
                          sx={{...filterStyle, backgroundColor : "#E0E0E0"}}
                      >
                          {metrics.numberOfReq}<br/>{t("requests")}
                      </Button>
                      <Button 
                      sx={{
                          ...filterStyle,
                          backgroundColor: "#90CAF9",
                          position: "relative",
                      }}
                      >
                      {metrics.numberOfApproved}<br/>{t("approved")}
                      <br />
                      </Button>
                      <Button 
                          sx={{...filterStyle, backgroundColor:"#A5D6A7"}}
                          onClick={() => setRegistFilter("attendance")}
                      >
                      {metrics.numberOfConfirmed}<br/>{t("confirmed")}
                      </Button>
                  </Box>:null}
                  {(user.role!=="trainee" && selectedRole!=="trainee")?<Typography variant="body2" sx={{marginTop: "20px",fontWeight:"bold",marginBottom:"5px"}}>
                    {t("registrations_received_by_month")}
                  </Typography>:null}
                  {(user.role!=="trainee" && selectedRole!=="trainee")?<Box
                    sx={{...paperStyle, width: "100%"}}
                    ref={regisChart}
                  />:null}
                </Box>
                {(user.role!=="trainee" && selectedRole!=="trainee")?<Box sx={{...paperStyle, height: "auto", width: "100%"}}>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: "bold",
                      textAlign: "center",
                      letterSpacing: 0.5,
                      lineHeight: 1.2,
                      userSelect: "none",
                      cursor: "default",
                      color: "#333", 
                      fontFamily: "sans-serif",
                    }}
                  >
                    {t("recent_registrations")}
                  </Typography>
                  <Box
                    sx={{
                      width:"100%",
                      paddingTop:"20px",
                      maxHeight: "500px",
                      overflowY: "auto",
                    }}
                  >
                    {allRequests?.map((req) => (
                      <Box
                        sx={{
                          width:"100%",
                          marginBottom: "10px",
                        }}
                      >
                        {renderRegistration(req.trainee, req.training, req.date)}
                        <Divider sx={{ width: "90%" }} />
                      </Box>
                    ))}
                  </Box>
                </Box>:null}
              </Box>
            </Box>
            :null}
          </Box>
          <Dialog
              open={exportWord}
              disableScrollLock={true}
              onClose={hideExportWord}
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
              <DialogTitle>{t("download_statistics")} ?</DialogTitle>
              <FormControl
              variant="outlined"
              sx={{
                  width: '100%',
              }}
              >
              <InputLabel>{t("name")}</InputLabel>
              <OutlinedInput
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  label={t("name")}
                  sx={{
                  alignItems: 'flex-start'
                  }}
              />
              </FormControl>
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
                      width: 'auto',
                      height: '40px',
                      marginTop: '10px',
                      textTransform: "none",
                      '&:hover': {
                          backgroundColor: '#EAB8B8',
                          color: 'white',
                      },
                  }} 
                  onClick={hideExportWord}>
                      {t("cancel")}
                  </Button>
                  <Button sx={{
                      color: 'white',
                      backgroundColor: '#2CA8D5',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      width: 'auto',
                      height: '40px',
                      marginTop: '10px',
                      textTransform: "none",
                      '&:hover': {
                          backgroundColor: '#76C5E1',
                          color: 'white',
                      },
                  }} 
                  onClick={exportToWord}
                  >
                      {t("download")}
                  </Button>
              </Box>
          </Dialog>
        </Box>
      );
};

export default Navbar;
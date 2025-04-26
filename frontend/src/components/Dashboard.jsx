import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Button, Tooltip, IconButton, Rating,
  TableContainer,Paper,Table,TableHead,TableRow,TableCell,TableBody
 } from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useLanguage } from "../languagecontext";
import * as echarts from 'echarts';
import { Divider } from '@mui/material';
import axios from "axios";
import dayjs from "dayjs";


const Navbar = () => {

    const { t } = useLanguage();  

    const [view, setView] = useState("statistics");

        
    // Filters ................
    const [selectedFilter, setSelectedFiler] = useState("all");
    const [registFilter, setRegistFilter] = useState("all");

    // Get Trainings Data .................
    const skillTypeChart = useRef(null);
    const hoursChart = useRef(null);
    const genderChart = useRef(null);
    const activityChart = useRef(null);
    const gradeChart = useRef(null);
    const regisChart = useRef(null);

    const [numberOfSoftSkillsTrainigs, setNumberOfSoftSkillsTrainings] = useState(0);
    const [numberOfInternTechnicalSkillsTrainigs, setNumberOfInternTechnicalSkillsTrainings] = useState(0);
    const [numberOfExternTechnicalSkillsTrainigs, setNumberOfExternTechnicalSkillsTrainings] = useState(0);
    const [numberOfTrainings, setNumberOfTrainings] = useState(0);
    const [numberOfSoftSkillsHours, setNumberOfSoftSkillsHours] = useState(0);
    const [numberOfTechnicalSkillsHours, setNumberOfTechnicalSkillsHours] = useState(0);
    const [rateOfMale, setRateOfMale] = useState(0);
    const [rateOfFemale, setRateOfFemale] = useState(0);
    const [rateOfEnablersActivity, setRateOfEnablersActivity] = useState(0);
    const [rateOfMechanicalActivity, setRateOfMechanicalActivity] = useState(0);
    const [rateOfInformationSystemsActivity, setRateOfInformationSystemsActivity] = useState(0);
    const [rateOfDataboxActivity, setRateOfDataboxActivity] = useState(0);
    const [rateOfTelecomActivity, setRateOfTelecomActivity] = useState(0);
    const [rateOfQualityActivity, setRateOfQualityActivity] = useState(0);
    const [rateOfEpaysysActivity, setRateOfEpaysysActivity] = useState(0);
    const [rateOfMediaAndEnergyActivity, setRateOfMediaAndEnergyActivity] = useState(0);
    const [rateOfElectronicsActivity, setRateOfElectronicsActivity] = useState(0);
    const [rateOfSpaceActivity, setRateOfSpaceActivity] = useState(0);
    const [rateOfF1Grade, setRateOfF1Grade] = useState(0);
    const [rateOfF2Grade, setRateOfF2Grade] = useState(0);
    const [rateOfF3Grade, setRateOfF3Grade] = useState(0);
    const [rateOfF4Grade, setRateOfF4Grade] = useState(0);
    const [rateOfM1Grade, setRateOfM1Grade] = useState(0);
    const [rateOfM2Grade, setRateOfM2Grade] = useState(0);
    const [rateOfM3Grade, setRateOfM3Grade] = useState(0);
    const [rateOfM4Grade, setRateOfM4Grade] = useState(0);
    const [rateOfM5Grade, setRateOfM5Grade] = useState(0);
    const [rateOfM6Grade, setRateOfM6Grade] = useState(0);
    const [numberOfTrainees, setNumberOfTrainees] = useState(0);
    const [numberOfFTFTrainings, setNumberOfFTFTrainings] = useState(0);
    const [numberOfOnlineTrainings, setNumberOfOnlineTrainings] = useState(0);
    const [numberOfParticipants, setNumberOfParticipants] = useState(0);
    const [numberOfTrainedEmployees, setNumberOfTrainedEmployees] = useState(0);
    const [numberOfEmployees, setNumberOfEmployees] = useState(0);

    const getTraineeGender = async (id) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/${id}`);
            const gender = response.data.gender;
            return gender;
        } catch (error) {
            console.error("Error fetching trainee gender", error);
            return null;
        }
    }

    const getTraineeActivity = async (id) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/users/${id}`);
            const activity = response.data.activity;
            return activity;
        } catch (error) {
            console.error("Error fetching trainee activity", error);
            return null;
        }
    }

    const getTraineeGrade = async (id) => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);
        return response.data.grade;
      } catch (error) {
        console.error("Error fetching trainee grade", error);
        return null;
      }
    };

    const [trainings, setTrainings] = useState([]);
    const [numberOfReq, setNumberOfReq] = useState(0);
    const [numberOfApproved, setNumberOfApproved] = useState(0);
    const [numberOfConfirmed, setNumberOfConfirmed] = useState(0);

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

    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/trainings");
            setTrainings(response.data);
            const filtered = response.data
            .filter(training => training.delivered === true)

            let reqnumber = 0;
            let appnumber = 0;
            let confnumber = 0;

            response.data.map((training) => {
              reqnumber += (training.nbOfReceivedRequests || 0);
              appnumber += (training.nbOfAcceptedRequests || 0);
              confnumber += (training.nbOfConfirmedRequests || 0);
            })

            setNumberOfReq(reqnumber);
            setNumberOfApproved(appnumber);
            setNumberOfConfirmed(confnumber);

            const softSkills = filtered.filter(t => t.skillType === "soft_skill");
            const internTechnicalSkills = filtered.filter(t => t.skillType === "technical_skill" && t.type === "internal");
            const externTechnicalSkills = filtered.filter(t => t.skillType === "technical_skill" && t.type === "external");
            const technicalSkills = filtered.filter(t => t.skillType === "technical_skill");
            const confirmedTrainees = response.data
            .map(t => t.confirmedtrainees)
            .flat();
            const genders = await Promise.all(
              confirmedTrainees.map(async (id) => {
                const gender = await getTraineeGender(id);
                return { id, gender };
              })
            );
            const maleTrainees = genders.filter(t => t.gender === "male").map(t => t.id);
            const femaleTrainees = genders.filter(t => t.gender === "female").map(t => t.id);

            const activities = await Promise.all(
              confirmedTrainees.map(async (id) => {
                const activity = await getTraineeActivity(id);
                return { id, activity };
              })
            );
            const enablersCount = activities.filter(a => a.activity === "enablers").length;
            const mechanicalCount = activities.filter(a => a.activity === "mechanical").length;
            const informationSystemsCount = activities.filter(a => a.activity === "formation_systems").length;
            const databoxCount = activities.filter(a => a.activity === "databox").length;
            const telecomCount = activities.filter(a => a.activity === "telecom").length;
            const qualityCount = activities.filter(a => a.activity === "quality").length;
            const epaysysCount = activities.filter(a => a.activity === "e-paysys").length;
            const mediaEnergyCount = activities.filter(a => a.activity === "media&energy").length;
            const electronicsCount = activities.filter(a => a.activity === "electronics").length;
            const spaceCount = activities.filter(a => a.activity === "space").length;

            const grades = await Promise.all(
              confirmedTrainees.map(async (id) => {
                const grade = await getTraineeGrade(id);
                return { id, grade };
              })
            );

            const FTFTrainings = response.data.filter(t => t.mode === "face_to_face");
            const OnlineTrainings = response.data.filter(t => t.mode === "online");

            let nbofparticipants = 0;

            response.data.map((training) => {
              nbofparticipants += (training.nbOfParticipants || 0);
            });

            setNumberOfParticipants(nbofparticipants);

            setNumberOfSoftSkillsTrainings(softSkills.length);
            setNumberOfInternTechnicalSkillsTrainings(internTechnicalSkills.length);
            setNumberOfExternTechnicalSkillsTrainings(externTechnicalSkills.length);
            setNumberOfTrainings(response.data.length);
            setNumberOfTechnicalSkillsHours(technicalSkills.reduce((acc, t) => acc + t.nbOfHours, 0));
            setNumberOfSoftSkillsHours(softSkills.reduce((acc, t) => acc + t.nbOfHours, 0));
            setNumberOfTrainees(confirmedTrainees.length);
            setRateOfMale((maleTrainees.length / confirmedTrainees.length) * 100);
            setRateOfFemale((femaleTrainees.length / confirmedTrainees.length) * 100);
            setRateOfEnablersActivity((enablersCount / confirmedTrainees.length) * 100);
            setRateOfMechanicalActivity((mechanicalCount / confirmedTrainees.length) * 100);
            setRateOfInformationSystemsActivity((informationSystemsCount / confirmedTrainees.length) * 100);
            setRateOfDataboxActivity((databoxCount / confirmedTrainees.length) * 100);
            setRateOfTelecomActivity((telecomCount / confirmedTrainees.length) * 100);
            setRateOfQualityActivity((qualityCount / confirmedTrainees.length) * 100);
            setRateOfEpaysysActivity((epaysysCount / confirmedTrainees.length) * 100);
            setRateOfMediaAndEnergyActivity((mediaEnergyCount / confirmedTrainees.length) * 100);
            setRateOfElectronicsActivity((electronicsCount / confirmedTrainees.length) * 100);
            setRateOfSpaceActivity((spaceCount / confirmedTrainees.length) * 100);
            setRateOfF1Grade((grades.filter(g => g.grade === "F1").length / confirmedTrainees.length) * 100);
            setRateOfF2Grade((grades.filter(g => g.grade === "F2").length / confirmedTrainees.length) * 100);
            setRateOfF3Grade((grades.filter(g => g.grade === "F3").length / confirmedTrainees.length) * 100);
            setRateOfF4Grade((grades.filter(g => g.grade === "F4").length / confirmedTrainees.length) * 100);
            setRateOfM1Grade((grades.filter(g => g.grade === "M1").length / confirmedTrainees.length) * 100);
            setRateOfM2Grade((grades.filter(g => g.grade === "M2").length / confirmedTrainees.length) * 100);
            setRateOfM3Grade((grades.filter(g => g.grade === "M3").length / confirmedTrainees.length) * 100);
            setRateOfM4Grade((grades.filter(g => g.grade === "M4").length / confirmedTrainees.length) * 100);
            setRateOfM5Grade((grades.filter(g => g.grade === "M5").length / confirmedTrainees.length) * 100);
            setRateOfM6Grade((grades.filter(g => g.grade === "M6").length / confirmedTrainees.length) * 100);
            setNumberOfFTFTrainings(FTFTrainings.length);
            setNumberOfOnlineTrainings(OnlineTrainings.length);

            const users = await axios.get("http://localhost:5000/api/users");

            const TrainedEmployees = users.data.filter((u) => u.isTrained);
            const Employees = users.data.filter((u) => (u.role !== "manager") && (u.role !== "admin"));

            setNumberOfTrainedEmployees(TrainedEmployees.length);
            setNumberOfEmployees(Employees.length)

        } catch (error) {
            console.error("Error fetching trainings data:", error);
        }
    }

    const getTrainingById = (id) => {
      return Object.values(trainings).find(training => training._id === id) || null;
    };

    const [sessions, setSessions] = useState([]);
    const [numberOfScheduled, setNumberOfScheduled] = useState(0);
    const [numberOfInProgress, setNumberOfInProgress] = useState(0);
    const [numberOfCompleted, setNumberOfCompleted] = useState(0);

    const fetchSessions = async () =>  {
      const response = await axios.get("http://localhost:5000/api/sessions");
      setSessions(response.data);
      let nbofsch = 0;
      let nbofinprog = 0;
      let nbofcomp = 0;

      response.data.map((session) => {
        if(session.status === "scheduled"){
          nbofsch++;
        }else if(session.status === "in_progress"){
          nbofinprog++;
        }else{
          nbofcomp++;
        }
      })

      setNumberOfCompleted(nbofcomp);
      setNumberOfInProgress(nbofinprog);
      setNumberOfScheduled(nbofsch);

    }

    const now = dayjs();
    const nextWeek = now.add(7, 'day').endOf('day');
    const nextMonth = now.add(1, 'month').endOf('day');

    const sessionsNextWeek = sessions.filter(session =>
      (selectedFilter === "all" || selectedFilter === session.status) &&
      dayjs(session.date).isAfter(now) &&
      dayjs(session.date).isBefore(nextWeek)
    );

    const sessionsLaterThisMonth = sessions.filter(session =>
      (selectedFilter === "all" || selectedFilter === session.status) &&
      dayjs(session.date).isAfter(nextWeek) &&
      dayjs(session.date).isBefore(nextMonth)
    );

    const sessionsAfterOneMonth = sessions.filter(session =>
      (selectedFilter === "all" || selectedFilter === session.status) &&
      dayjs(session.date).isAfter(nextMonth)
    );

    const renderSession = (session) => {
      const start = dayjs(session.date);
      const end = start.add(session.duration, 'hour');

      return (
        <ListItem key={session.date} disableGutters sx={{width:"100%"}}>
          <ListItemIcon>
            <CalendarTodayIcon fontSize="medium" />
          </ListItemIcon>
          <ListItemText
            primary={`${session.name}`}
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

    const [allRequests, setAllRequests] = useState([]);
    const [traineesData, setTraineesData] = useState({});
    const [requestsPerMonth, setRequestsPerMonth] = useState([]);
  
    useEffect(() => {
      const fetchTrainee = async () => {
        const requests = trainings
          .flatMap((training) =>
            training.requestshistory.map((request) => ({
              ...request,
              training,
            }))
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date));
  
        const traineeIds = [...new Set(requests.map((req) => req.trainee))];
  
        const traineeDataArray = await Promise.all(
          traineeIds.map((id) => axios.get(`http://localhost:5000/api/users/${id}`))
        );
  
        const traineesData = Object.fromEntries(
          traineeDataArray.map(({ data }) => [data._id, data])
        );

        const requestsByMonth = Array(12).fill(0); 

        requests.forEach((req) => {
          const monthIndex = new Date(req.date).getMonth(); 
          requestsByMonth[monthIndex]++;
        });

        setRequestsPerMonth(requestsByMonth);
        setAllRequests(requests);
        setTraineesData(traineesData);
      };
  
      fetchTrainee();
    }, [trainings]); 
  
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

    useEffect(() => {
      fetchData();
      fetchSessions();
    }, []);

    
    // Chartss.............

    useEffect(() => {
      const skillChartInstance = skillTypeChart.current && echarts.init(skillTypeChart.current);
      const hoursChartInstance = hoursChart.current && echarts.init(hoursChart.current);
      const genderChartInstance = genderChart.current && echarts.init(genderChart.current);
      const activityChartInstance = activityChart.current && echarts.init(activityChart.current);
      const gradeChartInstance = gradeChart.current && echarts.init(gradeChart.current);
      const registChartInstance = regisChart.current && echarts.init(regisChart.current);

      const skillType = {
        title: {
          text: t("total_number_of_trainings") + " : " + numberOfTrainings,
          textStyle: {
            color: "text.primary",
          },
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
            data: [numberOfSoftSkillsTrainigs, 0, 0],
            type: "bar",
            itemStyle: { color: "#91CC75" },
            barWidth: 60,
            stack: "stacked",
          },
          {
            name: t("internal tech"),
            data: [0, numberOfInternTechnicalSkillsTrainigs, 0],
            type: "bar",
            itemStyle: { color: "#FAC858" },
            barWidth: 60,
            stack: "stacked",
          },
          {
            name: t("external tech"),
            data: [0, 0, numberOfExternTechnicalSkillsTrainigs],
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
            data: [numberOfTechnicalSkillsHours, 0],
            type: "bar",
            itemStyle: { color: "#FAC858" },
            barWidth: 80,
            stack: "stacked",
          },
          {
            name: t("total_hours_of_soft_skills_training"),
            data: [0, numberOfSoftSkillsHours],
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
              { value: rateOfMale, name: t("male") },
              { value: rateOfFemale, name: t("female") },
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
      }
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
            t("space")
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
              rateOfEnablersActivity,
              rateOfMechanicalActivity,
              rateOfInformationSystemsActivity,
              rateOfDataboxActivity,
              rateOfTelecomActivity,
              rateOfQualityActivity,
              rateOfEpaysysActivity,
              rateOfMediaAndEnergyActivity,
              rateOfElectronicsActivity,
              rateOfSpaceActivity
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
              rateOfF1Grade,
              rateOfF2Grade,
              rateOfF3Grade,
              rateOfF4Grade,
              rateOfM1Grade,
              rateOfM2Grade,
              rateOfM3Grade,
              rateOfM4Grade,
              rateOfM5Grade,
              rateOfM6Grade,
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
            data: requestsPerMonth,
            type: 'bar'
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
    
      return () => {
        skillChartInstance?.dispose();
        hoursChartInstance?.dispose();
        genderChartInstance?.dispose();
        activityChartInstance?.dispose();
        gradeChartInstance?.dispose();
        registChartInstance?.dispose();
      };
    }, [
      numberOfTrainings,
      numberOfSoftSkillsTrainigs,
      numberOfInternTechnicalSkillsTrainigs,
      numberOfExternTechnicalSkillsTrainigs,
      numberOfSoftSkillsHours,
      numberOfTechnicalSkillsHours,
      rateOfFemale,
      rateOfMale,
      t,
      view,
    ]);

    const getTrainingScore = async (trainingId) => {
      let score = 0;
      let numberOfFeedbacks = 0;
    
      await axios.post(`http://localhost:5000/api/trainings/feedbacks/${trainingId}`)
        .then((response) => {
          const { coldFeedback, hotFeedback } = response.data;
    
          coldFeedback.forEach(feedback => {
            score += feedback.sentimentScore || 0;
            numberOfFeedbacks++;
          });
    
          hotFeedback.forEach(feedback => {
            score += feedback.sentimentScore || 0;
            numberOfFeedbacks++;
          });
        });
      if (numberOfFeedbacks === 0) numberOfFeedbacks++;
      return Math.round(score / numberOfFeedbacks);
    }; 

    const [completedTrainings, setCompletedTrainings] = useState([]);

    useEffect(() => {
      const filtered = trainings
        .filter(training => training.delivered === true)
        .map(training => ({
          ...training,
          showDetails: false
        }));
      setCompletedTrainings(filtered);
    }, [trainings]);
    
    const updateShowDetails = (trainingId, value) => {
      setCompletedTrainings(prevTrainings =>
        prevTrainings.map(training =>
          training._id === trainingId
            ? { ...training, showDetails: value }
            : training
        )
      );
    };    
  
    const [scores, setScores] = useState({});

    useEffect(() => {
      const fetchScores = async () => {
        const newScores = {};
        for (let training of trainings) {
          const score = await getTrainingScore(training._id);
          newScores[training._id] = score;
        }
        setScores(newScores);
      };
    
      if (trainings.length > 0) {
        fetchScores();
      }
    }, [trainings]);
    
    const renderTraining = (training) => {
      const score = scores[training._id];
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
          <ListItem disableGutters sx={{ width: "100%" }}>
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
            <Rating name="Score" value={score} readOnly />
            <Tooltip title={training.showDetails ? t("hide_details") : t("view_details")} arrow>
              <IconButton
                sx={{ color: "darkgrey" }}
                onClick={() => updateShowDetails(training._id, !training.showDetails)}
              >
                {training.showDetails ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
            </Tooltip>
          </ListItem>
        </Box>
      );
    };
    
    const metrics = [
      { name: 'Total Number of planned trainings', recap: numberOfTrainings, objGap: '' },
      { name: 'Total Number of delivered Trainings', recap: completedTrainings.length, objGap: '' },
      { name: 'Total Number of delivered Soft skills Trainings', recap: numberOfSoftSkillsTrainigs, objGap: '' },
      { name: 'Total Number of delivered Technical skills Trainings conducted by Internal trainers', recap: numberOfInternTechnicalSkillsTrainigs, objGap: '' },
      { name: 'Total Number of delivered Technical skills Trainings conducted by External trainers', recap: numberOfExternTechnicalSkillsTrainigs, objGap: '' },
      { name: 'Training Completion rate (Delivered/Planned) (obj 80%)', recap: ((completedTrainings.length / numberOfTrainings) * 100).toFixed(2) + '%', objGap: (80 - (completedTrainings.length / numberOfTrainings) * 100).toFixed(2) + '%'},
      { name: 'Total number of face to face trainings', recap: numberOfFTFTrainings, objGap: '' },
      { name: 'Percentage of face to face Trainings (Obj 75%)', recap: ((numberOfFTFTrainings/numberOfTrainings)*100).toFixed(2) + '%', objGap: (75 - (numberOfFTFTrainings/numberOfTrainings)*100).toFixed(2) +'%' },
      { name: 'Total number of online trainings', recap: numberOfOnlineTrainings, objGap: '' },
      { name: 'Percentage of online trainings (Obj 25%)', recap: ((numberOfOnlineTrainings/numberOfTrainings)*100).toFixed(2) + '%', objGap: (25 - (numberOfOnlineTrainings/numberOfTrainings)*100).toFixed(2) + '%' },
      { name: 'Number of participants', recap: numberOfParticipants, objGap: '' },
      { name: 'Total Hours of Soft skills training', recap: numberOfSoftSkillsHours, objGap: '' },
      { name: 'Total Hours of Technical skills training', recap: numberOfTechnicalSkillsHours, objGap: '' },
      { name: 'Total number of Training hours', recap: numberOfSoftSkillsHours + numberOfTechnicalSkillsHours, objGap: '' },
      { name: 'Total Number of trained employees per one training', recap: Math.round(numberOfTrainedEmployees / completedTrainings.length), objGap: '' },
      { name: 'Percentage of participation (number of trained employees/HC)', recap: ((numberOfTrainedEmployees/numberOfEmployees)*100).toFixed(2) + '%', objGap: '' },
      { name: 'Total number of hours per trainees', recap: ((numberOfSoftSkillsHours + numberOfTechnicalSkillsHours)/numberOfTrainedEmployees), objGap: '' },
      { name: 'Average Number of hours per Trained employee', recap: '', objGap: '' },
      { name: 'Average Training Duration by participant(number of training hours per part/ Number of trained Employees)', recap: '', objGap: '' },
      { name: 'Current internal trainers number', recap: '', objGap: '' },
      { name: 'Internal Trainers Ratio ( number of trainers/current HC)', recap: '', objGap: '' },
      { name: 'Current External Trainers', recap: '', objGap: '' },
      { name: 'Number of Satisfactorily Evaluated Trainings en 2024', recap: '', objGap: '' },
      { name: 'Training Effectiveness Rate in 2024 (obj 80%)', recap: '', objGap: '' },
    ];


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
                marginTop:"30px",
                padding:"10px",
                gap: "15px",
              }}
            >
              <Button
                sx={buttonStyle("statistics")}
                onClick={() => setView("statistics")}
              >
                {t("statistics")}
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
              flexDirection: "column",
              gap: "20px",
              justifyContent:"start",
              alignItems:"center",
              padding: "20px",
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
            {view === "statistics" ?
            <Box
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
              <Box
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
                    sx={paperStyle}
                    ref={skillTypeChart}
                  />
                <Box
                    sx={paperStyle}
                    ref={hoursChart}
                  />
              </Box>
              <Box
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
                  sx={paperStyle}
                  ref={activityChart}
                />
                <Box
                  sx={paperStyle}
                  ref={gradeChart}
                />
              </Box>   
              <Box
                sx={paperStyle}
                ref={genderChart}
              />
              <TableContainer component={Paper} sx={{ marginTop: 4 }}>
                <Table sx={{ minWidth: 400 }} aria-label="training metrics table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '60%' }}>Recap</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>Total -25</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', width: '20%' }}>Obj Gap</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.map((metric, index) => (
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
              </TableContainer>
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
                  {t("upcoming_sessions")}
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
                        sx={{...filterStyle, backgroundColor : "#E0E0E0"}}
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
                        {numberOfScheduled}<br/>{t("scheduled")}
                    </Button>
                    <Button 
                    sx={{
                        ...filterStyle,
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
                    {numberOfInProgress}<br/>{t("in_progress")}
                    <br />
                    </Button>
                    <Button 
                        sx={{...filterStyle, backgroundColor:"#A5D6A7"}}
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
                    {numberOfCompleted}<br/>{t("completed")}
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
                  width:"100%",
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
                    {t("registrations")}
                  </Typography>
                  <Typography variant="body2" sx={{marginTop: "30px",fontWeight:"bold",marginBottom:"5px"}}>
                    {t("this_month")}
                  </Typography>
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
                          {numberOfReq}<br/>{t("requests")}
                      </Button>
                      <Button 
                      sx={{
                          ...filterStyle,
                          backgroundColor: "#90CAF9",
                          position: "relative",
                      }}
                      >
                      {numberOfApproved}<br/>{t("approved")}
                      <br />
                      </Button>
                      <Button 
                          sx={{...filterStyle, backgroundColor:"#A5D6A7"}}
                          onClick={() => setRegistFilter("attendance")}
                      >
                      {numberOfConfirmed}<br/>{t("confirmed")}
                      </Button>
                  </Box>
                  <Typography variant="body2" sx={{marginTop: "20px",fontWeight:"bold",marginBottom:"5px"}}>
                    {t("registrations_received_by_month")}
                  </Typography>
                  <Box
                    sx={{...paperStyle, width: "100%"}}
                    ref={regisChart}
                  />
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
                    {t("recent_registrations")}
                  </Typography>
                  <Box
                    sx={{
                      width:"100%",
                      paddingTop:"20px",
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
                </Box>
              </Box>
            </Box>
            :null}
          </Box>
        </Box>
      );
};

export default Navbar;
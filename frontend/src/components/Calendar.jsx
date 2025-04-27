import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography, Button , Box} from "@mui/material";
import { getCookie } from './Cookies';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import format from "date-fns/format";
import { fr, enUS } from "date-fns/locale"; 
import axios from "axios";

const Calendar = () => {
  const user = getCookie("User");

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const Language = getCookie("Language");

  const startMonth = startOfMonth(currentMonth);
  const endMonth = endOfMonth(currentMonth);
  const startWeek = startOfWeek(startMonth);
  const endWeek = endOfWeek(endMonth);

  const handlePrevMonth = () => {
    const prevMonth = addDays(startMonth, -1);
    if (prevMonth.getFullYear() === currentMonth.getFullYear()) {
      setCurrentMonth(prevMonth);
    }
  };

  const handleNextMonth = () => {
    const nextMonth = addDays(endMonth, 1);
    if (nextMonth.getFullYear() === currentMonth.getFullYear()) {
      setCurrentMonth(nextMonth);
    }
  };

  const [trainings, setTrainings] = useState([]);

  const getTrainings = async () => {
    try {
      const trainingResponse = await axios.get("http://localhost:5000/api/trainings");
      
      const trainingsWithSessions = await Promise.all(
        trainingResponse.data.map(async (training) => {
          const sessionsResponse = await axios.get(`http://localhost:5000/api/sessions/training/${training._id}`);
          return {
            ...training,
            sessions: sessionsResponse.data,
          };
        })
      );
  
      setTrainings((prev) => [...prev, ...trainingsWithSessions]);
    } catch (error) {
      console.error("Failed to fetch trainings:", error);
    }
  };

  useEffect(() => {
    setTrainings([]);
    getTrainings();
  }, []);

  const renderDays = () => {
    const days = [];
    let startDate = startWeek;
    for (let i = 0; i < 7; i++) {
      days.push(
        <Grid item xs key={i}>
          <Typography variant="body1" align="center">
            {format(addDays(startDate, i), "EEE")}
          </Typography>
        </Grid>
      );
    }
    return days;
  };

  const renderCells = () => {
    const monthDays = [];
    let day = startWeek;
  
    while (day <= endWeek) {
      let week = [];
  
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const sessionsOnThisDay = trainings.filter(training => {
          return training.sessions.some(session => {
            const sessionDate = new Date(session.date);
            return isSameDay(sessionDate, cloneDay); 
          });
        });
  
        week.push(
          <Grid item xs key={cloneDay}>
            <Paper
              sx={{
                padding: 2,
                textAlign: "center",
                backgroundColor: isSameMonth(day, currentMonth)
                  ? isSameDay(day, selectedDate)
                    ? "#2CA8D5"
                    : "background.calendar"
                  : "background.dcalendar",
                color: isSameMonth(day, currentMonth) ? "black" : "grey",
                cursor: "pointer",
                "&:hover": { backgroundColor: "lightblue" },
                width: '100%',
                height: '150px',
                marginBottom: '10px',
              }}
              onClick={() => setSelectedDate(cloneDay)}
            >
              <Typography variant="body1" sx={{mb: 2}}>{format(cloneDay, "d")}</Typography>
              {sessionsOnThisDay.map(training => {
                // Determine the appropriate color based on conditions
                let trainingColor = '';
                if (training.confirmedtrainees?.includes(user._id) && !training.delivered) {
                  trainingColor = "#4CAF50"; // Confirmed Attendance
                } else if (training.acceptedtrainees?.includes(user._id) && !training.confirmedtrainees.includes(user._id)) {
                  trainingColor = "#FF9800"; // Waiting for Confirmation
                } else if (training.delivered) {
                  trainingColor = "lightgrey"; // Completed Trainings
                } else {
                  trainingColor = "#2196F3"; // Available Trainings
                }
  
                return (
                  <div key={training._id}>
                    <Typography variant="body2" align="center" sx={{ color: trainingColor }}>
                      <strong>{training.title}</strong>
                    </Typography>
                    {training.sessions.map(session => {
                      const sessionDate = new Date(session.date);
                      if (isSameDay(sessionDate, cloneDay)) {
                        return (
                          <Typography key={session._id} variant="body2" align="center" sx={{ color: trainingColor }}>
                            {session.name} ({format(sessionDate, 'h:mm a')})
                          </Typography>
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              })}
            </Paper>
          </Grid>
        );
        day = addDays(day, 1);
      }
  
      monthDays.push(
        <Grid container spacing={1} key={day}>
          {week}
        </Grid>
      );
    }
  
    return monthDays;
  };


  return (
    <Box sx={{ 
        maxWidth: "90%",
        margin: "auto",
        textAlign: "center",
        marginTop: "40px",
        display : "flex",
        flexDirection: "column",
    }}
    >
      <Typography variant="h5">{format(currentMonth, "MMMM yyyy" , { locale: (Language === "fr")?fr:enUS })}</Typography>
      <Box
        sx={{ 
          width: "100%",
          margin: "auto",
          textAlign: "center",
          marginTop: "10px",
          marginBottom: "10px",
          display : "flex",
          flexDirection: "row",
          justifyContent: "space-between",
      }}
      >
        <Button onClick={handlePrevMonth}>⬅️ Prev</Button>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Confirmed Attendance */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 20, height: 16, backgroundColor: "#4CAF50", borderRadius: "3px"}}></Box>
            <Typography variant="body2">Confirmed Attendance</Typography>
          </Box>
          
          {/* Waiting for Confirmation */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 20, height: 16, backgroundColor: "#FF9800", borderRadius: "3px" }}></Box>
            <Typography variant="body2">Waiting for Confirmation</Typography>
          </Box>
          
          {/* Available Trainings */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 20, height: 16, backgroundColor: "#2196F3", borderRadius: "3px" }}></Box>
            <Typography variant="body2">Available Trainings</Typography>
          </Box>

          {/* Completed Trainings */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 20, height: 16, backgroundColor: "lightgrey", borderRadius: "3px" }}></Box>
            <Typography variant="body2">Completed Trainings</Typography>
          </Box>
        </Box>
        <Button onClick={handleNextMonth}>Next ➡️</Button>
      </Box>
      <Grid container spacing={1}>{renderDays()}</Grid>
      {renderCells()}
    </Box>
  );
};

export default Calendar;

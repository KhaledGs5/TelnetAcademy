import React, { useState } from "react";
import { Grid, Paper, Typography, Button , Box} from "@mui/material";
import { getCookie } from './Cookies';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import format from "date-fns/format";
import { fr, enUS } from "date-fns/locale"; 

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const Language = getCookie("Language");

  const startMonth = startOfMonth(currentMonth);
  const endMonth = endOfMonth(currentMonth);
  const startWeek = startOfWeek(startMonth);
  const endWeek = endOfWeek(endMonth);

  const handlePrevMonth = () => setCurrentMonth(addDays(startMonth, -1));
  const handleNextMonth = () => setCurrentMonth(addDays(endMonth, 1));

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
                width: '140px',
                height: '80px',
                marginBottom: '10px',
              }}
              onClick={() => setSelectedDate(cloneDay)}
            >
              <Typography variant="body1">{format(day, "d")}</Typography>
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
    <Box sx={{ maxWidth: "70%", margin: "auto", textAlign: "center"}}>
      <Typography variant="h5">{format(currentMonth, "MMMM yyyy" , { locale: (Language === "fr")?fr:enUS })}</Typography>
      <Button onClick={handlePrevMonth}>⬅️ Prev</Button>
      <Button onClick={handleNextMonth}>Next ➡️</Button>

      <Grid container spacing={1}>{renderDays()}</Grid>
      {renderCells()}
    </Box>
  );
};

export default Calendar;

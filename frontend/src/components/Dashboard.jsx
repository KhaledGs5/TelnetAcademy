import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button} from "@mui/material";
import { useLanguage } from "../languagecontext";
import * as echarts from 'echarts';
import axios from "axios";


const Navbar = () => {

    const { t } = useLanguage();  

    const [view, setView] = useState("home");

    // Get Trainings Data .................
    const skillTypeChart = useRef(null);
    const hoursChart = useRef(null);

    const [numberOfSoftSkillsTrainigs, setNumberOfSoftSkillsTrainings] = useState(0);
    const [numberOfInternTechnicalSkillsTrainigs, setNumberOfInternTechnicalSkillsTrainings] = useState(0);
    const [numberOfExternTechnicalSkillsTrainigs, setNumberOfExternTechnicalSkillsTrainings] = useState(0);
    const [numberOfTrainings, setNumberOfTrainings] = useState(0);
    const [numberOfSoftSkillsHours, setNumberOfSoftSkillsHours] = useState(0);
    const [numberOfTechnicalSkillsHours, setNumberOfTechnicalSkillsHours] = useState(0);

    const fetchData = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/trainings");
            const softSkills = response.data.filter(t => t.skillType === "soft_skill");
            const internTechnicalSkills = response.data.filter(t => t.skillType === "technical_skill" && t.type === "internal");
            const externTechnicalSkills = response.data.filter(t => t.skillType === "technical_skill" && t.type === "external");
            const technicalSkills = response.data.filter(t => t.skillType === "technical_skill");
            
            setNumberOfSoftSkillsTrainings(softSkills.length);
            setNumberOfInternTechnicalSkillsTrainings(internTechnicalSkills.length);
            setNumberOfExternTechnicalSkillsTrainings(externTechnicalSkills.length);
            setNumberOfTrainings(response.data.length);
            setNumberOfTechnicalSkillsHours(technicalSkills.reduce((acc, t) => acc + t.nbOfHours, 0));
            setNumberOfSoftSkillsHours(softSkills.reduce((acc, t) => acc + t.nbOfHours, 0));

            
        } catch (error) {
            console.error("Error fetching trainings data:", error);
        }
    }

    useEffect(() => {
      fetchData();
    }, []);
    
    useEffect(() => {
      if (skillTypeChart.current) {
        const chartInstance = echarts.init(skillTypeChart.current);
        const option = {
          title: {
            text: t("total_number_of_trainings") + " : " + numberOfTrainings,
          },
          tooltip: {
            trigger: "item",
          },
          legend: {
            data: [
              t("soft skills"),
              t("internal tech"),
              t("external tech"),
            ],
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
              stack: 'stacked',
            },
            {
              name: t("internal tech"),
              data: [0, numberOfInternTechnicalSkillsTrainigs, 0],
              type: "bar",
              itemStyle: { color: "#FAC858" },
              barWidth: 60,
              stack: 'stacked',
            },
            {
              name: t("external tech"),
              data: [0, 0, numberOfExternTechnicalSkillsTrainigs],
              type: "bar",
              itemStyle: { color: "#EE6666" },
              barWidth: 60,
              stack: 'stacked',
            },
          ],
        };
        chartInstance.setOption(option);
    
        return () => {
          chartInstance.dispose();
        };
      }else if(hoursChart.current){
          const chartInstance = echarts.init(skillTypeChart.current);
          const option = {
            title: {
              text: t("total_number_of_trainings") + " : " + numberOfTrainings,
            },
            tooltip: {
              trigger: "item",
            },
            legend: {
              data: [
                t("soft skills"),
                t("internal tech"),
                t("external tech"),
              ],
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
                stack: 'stacked',
              },
              {
                name: t("internal tech"),
                data: [0, numberOfInternTechnicalSkillsTrainigs, 0],
                type: "bar",
                itemStyle: { color: "#FAC858" },
                barWidth: 60,
                stack: 'stacked',
              },
              {
                name: t("external tech"),
                data: [0, 0, numberOfExternTechnicalSkillsTrainigs],
                type: "bar",
                itemStyle: { color: "#EE6666" },
                barWidth: 60,
                stack: 'stacked',
              },
            ],
          };
          chartInstance.setOption(option);
      
          return () => {
            chartInstance.dispose();
          };
      }
    }, [
      numberOfTrainings,
      numberOfSoftSkillsTrainigs,
      numberOfInternTechnicalSkillsTrainigs,
      numberOfExternTechnicalSkillsTrainigs,
      t,
    ]);
    

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
                marginTop:"20px",
                padding:"10px",
                gap: "15px",
              }}
            >
              <Button
                sx={buttonStyle("home")}
                onClick={() => setView("home")}
              >
                {t("home")}
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
              flexDirection: "row",
              gap: "20px",
              justifyContent:"start",
              alignItems:"start",
              padding:"20px",
            }}
          >
            <Box
              sx={{
                width: "33%",
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

            </Box>
            <Box
              sx={{
                width: "33%",
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
              <Box
                  sx={{
                    width: "100%",
                    height: "300px", 
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "start",
                    alignItems: "center",
                  }}
                  ref={skillTypeChart}
                />
              <Box
                  sx={{
                    width: "100%",
                    height: "300px", 
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "start",
                    alignItems: "center",
                  }}
                  ref={skillTypeChart}
                />
            </Box>
            <Box
              sx={{
                width: "33%",
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

            </Box>
          </Box>
        </Box>
      );
};

export default Navbar;
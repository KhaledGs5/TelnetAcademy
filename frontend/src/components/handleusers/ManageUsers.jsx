import React, {useState, useEffect} from "react";
import { Box, TextField , Typography, Button,Input,IconButton, InputAdornment, Tooltip, OutlinedInput, FormControl, InputLabel, Pagination,Radio, Alert, Snackbar ,Select } from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckIcon from '@mui/icons-material/Check';
import { useLanguage } from "../../languagecontext";
import axios from "axios";
import api from "../../api";
import * as XLSX from 'xlsx';

const ManageUsers = () => {

    const { t } = useLanguage();

    const UserRoles = ["trainer", "trainee","manager","trainee_trainer"];
    const UserTypes = ["internal", "external"];
    const [selectedUserId, setSelectedUserId] = useState(null);

    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserRole, setNewUserRole] = useState("");
    const [newUserGender, setNewUserGender] = useState("");
    const [newUserActivity, setNewUserActivity] = useState("");
    const [newUserJobtitle, setNewUserJobtitle] = useState("");
    const [newUserGrade, setNewUserGrade] = useState("");
    const [newUserChef, setNewUserChef] = useState("");
    const [newUserType, setNewUserType] = useState("");

    // Fetch All Users ....................

    const [users, setUsers] = useState([]);

    const fetchUsers = () => {
        axios.get("http://localhost:5000/api/users")
            .then((response) => {
                const usersWithModified = response.data
                .filter((user) => 
                    user.role !== "admin"
                )
                .map(user => ({
                    ...user,
                    modified: false,
                    showPassword: false,
                }));
    
                setUsers(usersWithModified);
            })
            .catch((error) => {
                console.error("Error fetching users:", error);
            });
    };
    
    useEffect(() => {
        fetchUsers();
    }, []);

    // Verify Update Or Create User...........

    const [showsVerificationAlert, setShowsVerifificationAlert] = useState(false);
    const [verifyAlertMessage, setVerifyAlertMessage] = useState("");
    const [verifyAlert, setVerifyAlert] = useState("error");
    const handleVerificationAlertClose = () => {
        setShowsVerifificationAlert(false);
    };

    // Adding new User
    const [newUser, setNewUser] = useState(false);
    const UserActivities = ["enablers", "mechanical", "formation_systems", "databox", "telecom", "quality", "e-paysys", "media&energy", "electronics", "space"];
    const [otherActivity, setOtherActivity]= useState(false);
    const UserGrades = ["F1", "F2", "F3", "F4", "M1", "M2", "M3", "M4", "M5", "M6", "L1", "L2", "L3", "L4"]
    const UserJobTitles = ["associate_engineer","engineer","team_leader","technical_leader","senior_team_leader","senior_technical_leader","project_manager",
        "consulting_manager","senior_project_manager","expert","program_manager","senior_expert","senior_program_manager","architect","program_director",
        "senior_architect"
    ];
    const [otherJobTitle, setOtherJobTitle] = useState(false);
    
    const showNewUserForm = () => {
        setNewUser(true);
    };

    const hideNewUserForm = () => {
        setNewUser(false);
    };

    function generateRandomPassword() {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const digits = '0123456789';
        const specials = '@$!%*?&';
        
        const required = [
          upper[Math.floor(Math.random() * upper.length)],
          lower[Math.floor(Math.random() * lower.length)],
          digits[Math.floor(Math.random() * digits.length)],
          specials[Math.floor(Math.random() * specials.length)]
        ];

        const allChars = upper + lower + digits + specials;
        while (required.length < 8) {
          required.push(allChars[Math.floor(Math.random() * allChars.length)]);
        }

        for (let i = required.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [required[i], required[j]] = [required[j], required[i]];
        }
      
        return required.join('');
    }
      
    const handleAddUser = () => {
        const newUser = {
            name: newUserName,
            email: newUserEmail,
            password: generateRandomPassword(),
            role: newUserRole,
            gender: newUserGender,
            activity: newUserActivity,
            jobtitle: newUserJobtitle,
            grade: newUserGrade,
            chef: newUserChef,
            type: newUserType,
        };
        api.post("/api/users", newUser)
        .then(() => {
            fetchUsers();
            hideNewUserForm();
            setVerifyAlert("success");
            api.post("/new-user", {
                toEmail: newUserEmail,
                url: "http://localhost:3000/signin",
                password: newUser.password,
              });    
            setVerifyAlertMessage(t("user_added_successfully"));
            setVerifyAlert("success");
            setShowsVerifificationAlert(true);          
        })
        .catch((error) => {
            setVerifyAlertMessage(error.response.data.error);
            setVerifyAlert("error");
            setShowsVerifificationAlert(true);
        });
    };

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
          const workbook = XLSX.read(data, { type: "array" });
      
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
      
          let jsonData = XLSX.utils.sheet_to_json(sheet);
      
          jsonData = jsonData.map((user) => {
            const password = generateRandomPassword();
            return {
              ...user,
              password,
              sendMail: {
                toEmail: user.email,
                url: "http://localhost:3000/signin",
                password,
              },
            };
          });
      
          try {
            const response = await axios.post("http://localhost:5000/api/uploadUsers", { data: jsonData });
      
            if (response.status === 200) {
              fetchUsers();
              setVerifyAlert("success");
      
              for (const user of jsonData) {
                await api.post("/new-user", user.sendMail);
              }
            }
          } catch (error) {
            setVerifyAlertMessage(error.response?.data?.error || "Upload failed");
            setVerifyAlert("error");
            setShowsVerifificationAlert(true);
          }
        };
      
        reader.readAsArrayBuffer(file);
      };
      
      
    // Updating user by Id............
    const [verifyUpdate, setVerifyUpdate] = useState(false);

    const showVerifyUpdateDialog = (userId) => {
        setSelectedUserId(userId);
        setVerifyUpdate(true);
    };

    const hideVerifyUpdateDialog = () => {
        setVerifyUpdate(false);
    };

    const handleUpdateUser = (userId) => {
        const updatedUser = Object.values(users).find(user => user._id === userId);
        axios.put(`http://localhost:5000/api/users/${userId}`, updatedUser)
            .then((response) => { 
                hideVerifyUpdateDialog();
                setVerifyAlert("success");
                setVerifyAlertMessage(t("user_updated_successfully"));
                setShowsVerifificationAlert(true); 
            })
            .catch((error) => {
                setVerifyAlertMessage(error.response.data.error);
                setVerifyAlert("error");
                setShowsVerifificationAlert(true);
            });

        setUsers((prevUsers) => ({
            ...prevUsers,
            [Object.keys(prevUsers).find(key => prevUsers[key]._id === userId)]: {
                ...prevUsers[Object.keys(prevUsers).find(key => prevUsers[key]._id === userId)],
                modified: false
            }
        }));
    };

    // Update all users .................
    const [verifyUpdateAll, setVerifyUpdateAll] = useState(false);

    const showVerifyUpdateAllDialog = () => {
        setVerifyUpdateAll(true);
    };

    const hideVerifyUpdateAllDialog = () => {
        setVerifyUpdateAll(false);
    };
    const handleUpdateAllUsers = () => {
        const listofchangedusers = Object.values(users)
            .filter((user) => user.modified)
            .map((user) => user._id);
    
        listofchangedusers.forEach((userId) => handleUpdateUser(userId));
        hideVerifyUpdateAllDialog();
    }; 

    // Deleting user by Id..............
    const [verifyDelete, setVerifyDelete] = useState(false);

    const showVerifyDeleteDialog = (userId) => {
        setSelectedUserId(userId);
        setVerifyDelete(true);
    };

    const hideVerifyDeleteDialog = () => {
        setVerifyDelete(false);
    };

    const handleDeleteUser = (userId) => {
        axios.delete(`http://localhost:5000/api/users/${userId}`)
            .then((response) => {
                console.log(response.data.message);
                hideVerifyDeleteDialog();
            })
            .catch((error) => {
                console.error("Error deleting user:", error);
            });
        
        setUsers((prevUsers) => {
            const updatedUsers = Object.fromEntries(
                Object.entries(prevUsers).filter(([_, user]) => user._id !== userId) 
            );
            return updatedUsers;
        });
    };

    // Delete all users ....................
    const [verifyDeleteAll, setVerifyDeleteAll] = useState(false);

    const showVerifyDeleteAllDialog = (userId) => {
        setSelectedUserId(userId);
        setVerifyDeleteAll(true);
    };

    const hideVerifyDeleteAllDialog = () => {
        setVerifyDeleteAll(false);
    };

    const handleDeleteAllUsers = () => {
        const listofallusers = Object.values(users)
            .map((user) => user._id);
        
        listofallusers.forEach((userId) => handleDeleteUser(userId));
        hideVerifyDeleteAllDialog();
    };

    //Show User Details.......................
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [selectedUser, setSelectedUser] = useState({});
    
    const handleShowUserDetails = (userId) => {
        setShowUserDetails(true);
        handleSelectedUser(userId);
    };

    const handleHideUserDetails = () => {
        setShowUserDetails(false);
    };

    const handleSelectedUser = async (userId) =>{
        const user = await axios.get(`http://localhost:5000/api/users/${userId}`);
        setSelectedUser(user.data);
    } ;

    // Order ........................
    const [orderState, setOrderState] = useState('Down');
    const [selectedOrder, setSelectedOrder] = useState("createdAt");

    const handleChangeOrder = (sel) => {
        setOrderState(orderState === 'Up' ? 'Down' : 'Up');
        setSelectedOrder(sel);
    };

    // Filters ...............
    const FilterRoles = ["all","trainer","trainee","manager","trainee_trainer"];
    const [searchedName, setSearchedName] = useState('');
    const [selectedRole, setSelectedRole] = useState("all");

    const handleSearchChange = (e) => {
        setSearchedName(e.target.value);
    };

    const handleClearSearch = () =>{
        setSearchedName(''); 
    };

    const handleFilterRoleChange = (e) => {
        setSelectedRole(e.target.value);
    };

    const filteredUsers = Object.entries(users)
        .filter(([_, user]) => user !== undefined)
        .map(([key, user]) => ({ id: key, ...user }))
        .filter(user =>
        user &&
        user.name &&
        user.name.toLowerCase().includes(searchedName.toLowerCase()) &&
        (selectedRole === user.role || selectedRole === "all")
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

    // Pagination ...............
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
  
    const handlePageChange = (event, value) => {
      setPage(value);
    };
    const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);
    const displayedUsers = filteredUsers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    // Handle Changings in users ................................

    const toggleShowPassword = (id) => {
        setUsers((prevUsers) => {
            const userKey = Object.keys(prevUsers).find(key => prevUsers[key]._id === id);
            if (!userKey) return prevUsers; 
    
            return {
                ...prevUsers,
                [userKey]: {
                    ...prevUsers[userKey],
                    showPassword: !prevUsers[userKey].showPassword,
                },
            };
        });
    };

    const handleNameChange = (e, id) => {
        setUsers((prevUsers) => {
            const userKey = Object.keys(prevUsers).find(key => prevUsers[key]._id === id);
            if (!userKey) return prevUsers;     
            return {
                ...prevUsers,
                [userKey]: {
                    ...prevUsers[userKey],
                    name: e.target.value,
                    modified: true,
                },
            };
        });
    };

    const handleEmailChange = (e, id) => {
        setUsers((prevUsers) => {
            const userKey = Object.keys(prevUsers).find(key => prevUsers[key]._id === id);
            if (!userKey) return prevUsers;
            return {
                ...prevUsers,
                [userKey]: {
                    ...prevUsers[userKey],
                    email: e.target.value,
                    modified: true,
                },
            };
        });
    };

    const handlePasswordChange = (e, id) => {
        setUsers((prevUsers) => {
            const userKey = Object.keys(prevUsers).find(key => prevUsers[key]._id === id);
            if (!userKey) return prevUsers;
            return {
                ...prevUsers,
                [userKey]: {
                    ...prevUsers[userKey],
                    password: e.target.value,
                    modified: true,
                },
            };
        });
    };

    const handleRoleChange = (e, id) => {
        setUsers((prevUsers) => {
            const userKey = Object.keys(prevUsers).find(key => prevUsers[key]._id === id);
            if (!userKey) return prevUsers;
            return {
                ...prevUsers,
                [userKey]: {
                    ...prevUsers[userKey],
                    role: e.target.value.toLowerCase(),
                    modified: true,
                },
            };
        });
    };
    

    // Styles .......................

    const orderStyle = {
        color: "text.primary",
        textTransform: "none",
    };


    return (
        <Box
            sx={{
                width: '90%',
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
                left: '5%',
                top: '15%',
                padding: '20px',
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
                    paddingBottom: "20px",
                }}
            >
                {t("manage_users")}
            </Typography>
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
                        sx={{...orderStyle, width: '20%'}}
                        onClick={() => handleChangeOrder("createdAt")}
                    >
                        <Typography>
                            {t("sort_by_date_added")}
                        </Typography>
                        {selectedOrder === "createdAt" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
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
                    <TextField
                        select
                        label={t("role")}
                        value={selectedRole}
                        onChange={handleFilterRoleChange}
                        sx={{
                            width: '20%'
                        }}
                        SelectProps={{
                            MenuProps: {
                              disableScrollLock: true, 
                            }
                        }}
                        >
                        {FilterRoles.map((role) => (
                            <MenuItem key={role} value={role}>
                                {t(role)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <FormControl sx={{ marginLeft: 2, minWidth: 200 }} size="small">
                        <InputLabel id="number-select-label">{t("users_per_page")}</InputLabel>
                        <Select
                        labelId="number-select-label"
                        value={itemsPerPage} 
                        label={t("users_per_page")}
                        onChange={(e) => setItemsPerPage(e.target.value)} 
                        >
                        {Array.from({ length: 16 }, (_, i) => i + 5).map((num) => (
                            <MenuItem key={num} value={num}>{num}</MenuItem>
                        ))}
                        </Select>
                    </FormControl>
                    <Tooltip title={t("add_user")} arrow> 
                        <IconButton color="primary" aria-label="add" size="small" onClick={showNewUserForm} 
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
                    <Dialog
                        open={newUser}
                        onClose={hideNewUserForm}
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
                        <DialogTitle>{t("add_new_user")}</DialogTitle>
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
                                <InputLabel required>{t("name")}</InputLabel>
                                <OutlinedInput
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                    label="Name......."
                                />
                            </FormControl>
                            <FormControl variant="outlined" sx={{ 
                                width: '50%',
                            }}
                            >
                            <InputLabel required>{t("email")}</InputLabel>
                            <OutlinedInput
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                label="Email......"
                            />
                            </FormControl>
                        </Box>
                        {verifyAlertMessage === "wrong_password_format"? 
                        <Typography
                            sx={{
                                color: "red",
                                fontSize: 12,
                                textAlign: "center",
                                width:'90%',
                            }}
                        >
                               {t("Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)")}
                        </Typography>: null}
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
                                select={!otherActivity  && (UserActivities.includes(newUserActivity) || newUserActivity === "")}
                                required
                                label={t("activity")}
                                value={newUserActivity}
                                onChange={(e) => setNewUserActivity(e.target.value)}
                                sx={{
                                    width: '50%',
                                }}
                            >
                                {UserActivities.map((activity) => (
                                    <MenuItem key={activity} value={activity}>
                                        {t(activity)}
                                    </MenuItem>
                                ))}
                                <Button 
                                    sx={{
                                        width: "100%",
                                        textTransform: "none",
                                        color: "black",
                                    }}
                                    onClick={() => setOtherActivity(true)}
                                >
                                    {t("other")}...
                                </Button>
                            </TextField>
                            <Dialog
                                open={otherActivity}
                                onClose={() => setOtherActivity(false)}
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
                                    <InputLabel required>{t("activity")}</InputLabel>
                                    <OutlinedInput
                                        value={newUserActivity}
                                        onChange={(e) => setNewUserActivity(e.target.value)}
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
                                        setOtherActivity(false);
                                    }}
                                >
                                    {t("save")}
                                </Button>
                            </Dialog>
                            <TextField
                                select={!otherJobTitle  && (UserJobTitles.includes(newUserJobtitle) || newUserJobtitle === "")}
                                required
                                label={t("jobtitle")}
                                value={newUserJobtitle}
                                onChange={(e) => setNewUserJobtitle(e.target.value)}
                                sx={{
                                    width: '50%',
                                }}
                            >
                                {UserJobTitles.map((jobtitle) => (
                                    <MenuItem key={jobtitle} value={jobtitle}>
                                        {t(jobtitle)}
                                    </MenuItem>
                                ))}
                                <Button 
                                    sx={{
                                        width: "100%",
                                        textTransform: "none",
                                        color: "black",
                                    }}
                                    onClick={() => setOtherJobTitle(true)}
                                >
                                    {t("other")}...
                                </Button>
                            </TextField>
                            <Dialog
                                open={otherJobTitle}
                                onClose={() => setOtherJobTitle(false)}
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
                                    <InputLabel required>{t("jobtitle")}</InputLabel>
                                    <OutlinedInput
                                        value={newUserJobtitle}
                                        onChange={(e) => setNewUserJobtitle(e.target.value)}
                                        label="jobtitle  ................"
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
                                        setOtherJobTitle(false);
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
                                label={t("grade")}
                                value={newUserGrade}
                                onChange={(e) => setNewUserGrade(e.target.value)}
                                sx={{
                                    width: '50%',
                                }}
                                >
                                {UserGrades.map((grade) => (
                                    <MenuItem key={grade} value={grade}>
                                        {t(grade)}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label={t("role")}
                                value={newUserRole}
                                onChange={(e) => setNewUserRole(e.target.value)}
                                sx={{
                                    width: '50%',
                                }}
                                >
                                {UserRoles.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        {t(role)}
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
                            <FormControl variant="outlined" sx={{ 
                                width: '50%',
                                }}
                            >
                                <InputLabel required>N+1</InputLabel>
                                <OutlinedInput
                                    value={newUserChef}
                                    onChange={(e) => setNewUserChef(e.target.value)}
                                    label="N+1......."
                                />
                            </FormControl>
                            <TextField
                                select
                                label={t("type")}
                                value={newUserType}
                                onChange={(e) => setNewUserType(e.target.value)}
                                sx={{
                                    width: '50%',
                                }}
                                >
                                {UserTypes.map((type) => (
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
                            <Typography   
                                sx={{
                                    fontSize: 15,
                                    textAlign: "center",
                                    color: "text.primary",
                                }}>
                                {t("gender")} :
                            </Typography>
                            <Box
                                sx={{
                                     width: '20%',
                                     display: "flex",
                                     justifyContent: "center",
                                     alignItems: "center",
                                }}
                            >
                                <Radio
                                    checked={newUserGender === "male"}
                                    onChange={() => setNewUserGender("male")}
                                    value="male"
                                />
                                <Typography   
                                    sx={{
                                        fontSize: 15,
                                        textAlign: "center",
                                        color: "text.primary",
                                    }}>
                                    {t("male")}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                     width: '20%',
                                     display: "flex",
                                     justifyContent: "center",
                                     alignItems: "center",
                                }}
                            >
                                <Radio
                                    checked={newUserGender === 'female'}
                                    onChange={() => setNewUserGender("female")}
                                    value="female"
                                />
                                <Typography   
                                    sx={{
                                        fontSize: 15,
                                        textAlign: "center",
                                        color: "text.primary",
                                    }}>
                                    {t("female")}
                                </Typography>
                            </Box>
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
                        onClick={hideNewUserForm}>
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
                        onClick={handleAddUser}>
                            {t("add")}
                        </Button>
                        </Box>
                    </Dialog>
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
                            onClick={() => handleChangeOrder("Name")}
                        >
                            <Typography>
                                {t("name")}
                            </Typography>
                            {selectedOrder === "Name" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                        <Button
                            sx={{...orderStyle, width: '30%'}}
                            onClick={() => handleChangeOrder("Email")}
                        >
                            <Typography>
                                {t("email")}
                            </Typography>
                            {selectedOrder === "Email" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                        <Button
                            sx={{...orderStyle, width: '20%'}}
                            onClick={() => handleChangeOrder("Password")}
                        >
                            <Typography>
                                {t("password")}
                            </Typography>
                            {selectedOrder === "Password" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                        </Button>
                        <Button
                            sx={{...orderStyle, width: '15%'}}
                            onClick={() => handleChangeOrder("Role")}
                        >
                            <Typography>
                                {t("role")}
                            </Typography>
                            {selectedOrder === "Role" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
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
                                    onClick={() => handleUpdateAllUsers()}> 
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
                                onClick={() => handleDeleteAllUsers()}>
                                    {t("yes")}
                                </Button>
                            </Box>
                        </Dialog>
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
                    boxSizing: 'border-box',
                    gap: '10px',
                }}
            >
                {displayedUsers
                .map(user => (
                    <Box
                        key={user._id}
                        sx={{
                            width: '90%',
                            height: '60px',
                            display: 'flex',
                            justifyContent: "start",
                            alignItems: 'center',
                            gap: '5px',
                        }}
                    >
                        <TextField variant="outlined" required placeholder={t("name")} value={user.name} sx={{width:"20%"}} onChange={(e) => handleNameChange(e,user._id)}/>
                        <TextField variant="outlined" required placeholder={t("email")} value={user.email} sx={{width:"30%"}} onChange={(e) => handleEmailChange(e,user._id)}/>
                        <FormControl variant="outlined" sx={{width:"20%"}}>
                            <OutlinedInput
                                type={user.showPassword ? 'text' : 'password'}
                                value={user.password}
                                onChange={(e) => handlePasswordChange(e,user._id)}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => toggleShowPassword(user._id)} size="small">
                                            {user.showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                        <TextField select variant="outlined" required placeholder={t("role")} value={user.role} sx={{width:"15%"}} 
                        onChange={(e) => handleRoleChange(e,user._id)}
                        SelectProps={{
                            MenuProps: {
                              disableScrollLock: true, 
                            }
                          }}> 
                        {UserRoles.map((role) => (
                            <MenuItem key={role} value={role}>
                                {t(role)}
                            </MenuItem>
                        ))}
                        </TextField>
                        <Box sx={{width:'15%', display:"flex", flexDirection:"row", justifyContent:"end"}}>
                            <Tooltip title={t("view_details")} arrow> 
                                <IconButton sx={{color:"#76C5E1"}} onClick={() => handleShowUserDetails(user._id)}>
                                    <RemoveRedEyeIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("save")} arrow>
                                <IconButton sx={{color:"#76C5E1"}} disabled={!user.modified} onClick={() => showVerifyUpdateDialog(user._id)}>
                                    <SaveIcon/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t("delete")} arrow> 
                                <IconButton sx={{color:"#EA9696"}} onClick={() => showVerifyDeleteDialog(user._id)}>
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
                <DialogTitle>{t("confirm_update_user")}?</DialogTitle>
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
                    onClick={() => handleUpdateUser(selectedUserId)}>
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
                <DialogTitle>{t("confirm_delete_user")}?</DialogTitle>
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
                    onClick={() => handleDeleteUser(selectedUserId)}>
                        {t("yes")}
                    </Button>
                </Box>
            </Dialog>
            <Dialog
                open={showUserDetails}
                disableScrollLock={true}
                onClose={handleHideUserDetails}
                PaperProps={{
                    sx: {
                        width: "400px",  
                        height: "auto", 
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "start",
                        alignItems: "center",
                        borderRadius: "10px",
                        gap: "10px",
                        padding: "20px",
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        fontSize: 25,
                        fontWeight: "bold",
                        textAlign: "center",
                        letterSpacing: 0.2,
                        lineHeight: 1,
                        userSelect: "none",
                        color: "#2CA8D5",
                    }}
                >{t("user_details")}</DialogTitle>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("name")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedUser.name}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("email")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("gender")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{t(selectedUser.gender)}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("activity")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedUser.activity}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("jobtitle")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedUser.jobtitle}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("grade")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedUser.grade}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("role")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{t(selectedUser.role)}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">N+1 :</Typography>
                    <Typography variant="body2" color="text.secondary">{t(selectedUser.chef)}</Typography>
                </Box>
                <Box
                    sx={{
                        height: '20px',
                        width: '100%',
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center", 
                        gap: "10px",
                    }}
                >
                    <Typography variant="body1">{t("type")} :</Typography>
                    <Typography variant="body2" color="text.secondary">{t(selectedUser.type)}</Typography>
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


export default ManageUsers;
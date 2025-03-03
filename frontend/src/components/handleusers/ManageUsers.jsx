import React, {useState, useEffect} from "react";
import { Box, TextField , Typography, Button,Input,IconButton, InputAdornment, Tooltip, Fab, OutlinedInput, FormControl, InputLabel, Pagination } from "@mui/material";
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
import { useLanguage } from "../../languagecontext";
import axios from "axios";

const ManageUsers = () => {

    const { t } = useLanguage();

    const UserRoles = ["trainer", "trainee","manager","trainee_trainer"];
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Fetch All Users ....................

    const [users, setUsers] = useState([]);

    const fetchUsers = () => {
        axios.get("http://localhost:5000/api/users")
            .then((response) => {
                const usersWithModified = response.data.map(user => ({
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

    // Adding new User
    const [newUser, setNewUser] = useState(false);

    const showNewUserForm = () => {
        setNewUser(true);
    };

    const hideNewUserForm = () => {
        setNewUser(false);
    };

    const handleAddUser = () => {
        const newUser = {
            name: newUserName,
            email: newUserEmail,
            password: newUserPassword,
            role: newUserRole,
        };

        console.log(newUser);
        axios.post("http://localhost:5000/api/users", newUser)
            .then(() => {
                fetchUsers();
                hideNewUserForm();
            })
            .catch((error) => {
                if (error.response && error.response.status === 400) {
                    alert("Email already exists");
                } else {
                    console.error("Error adding user:", error);
                }
            }); 
    };

    // Updating user by Id............
    const [verifyUpdate, setVerifyUpdate] = useState(false);

    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserRole, setNewUserRole] = useState("");

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
                console.log(response.data.message); 
                hideVerifyUpdateDialog();
            })
            .catch((error) => {
                console.error("Error updating user:", error);
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
    const itemsPerPage = 20; 
  
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
                    zIndex: 100,
                    height: '140px',
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
                        >
                        {FilterRoles.map((role) => (
                            <MenuItem key={role} value={role}>
                                {t(role)}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Tooltip title={t("add_user")} arrow> 
                        <Fab color="primary" aria-label="add" size="small" onClick={showNewUserForm}>
                            <AddIcon />
                        </Fab>
                    </Tooltip>
                    <Dialog
                        open={newUser}
                        onClose={hideNewUserForm}
                        PaperProps={{
                            sx: {
                                width: "400px",  
                                height: "500px", 
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "start",
                                alignItems: "center",
                                borderRadius: "5px",
                            }
                        }}
                    >
                        <DialogTitle>{t("add_new_user")}</DialogTitle>
                        <FormControl variant="outlined" sx={{ 
                            position: "absolute",
                            top: '15%',
                            width: '80%',
                        }}
                        >
                            <InputLabel required>{t("name")}</InputLabel>
                            <OutlinedInput
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                label="Name"
                            />
                        </FormControl>
                        <FormControl variant="outlined" sx={{ 
                            position: "absolute",
                            top: '30%',
                            width: '80%',
                        }}
                        >
                            <InputLabel required>{t("email")}</InputLabel>
                            <OutlinedInput
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                label="Email"
                            />
                        </FormControl>
                        <FormControl variant="outlined" sx={{ 
                            position: "absolute",
                            top: '45%',
                            width: '80%',
                        }}
                        >
                            <InputLabel required>{t("password")}</InputLabel>
                            <OutlinedInput
                                value={newUserPassword}
                                onChange={(e) => setNewUserPassword(e.target.value)}
                                label="Password"
                            />
                        </FormControl>
                        <TextField
                            select
                            label={t("role")}
                            value={newUserRole}
                            onChange={(e) => setNewUserRole(e.target.value)}
                            sx={{
                                width: '40%',
                                position : 'absolute',
                                top: '60%',
                            }}
                            >
                            {UserRoles.map((role) => (
                                <MenuItem key={role} value={role}>
                                    {t(role)}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Box 
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'absolute',
                                top: '80%',
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
                                onClose={hideVerifyUpdateAllDialog}
                                PaperProps={{
                                    sx: {
                                        width: "400px",  
                                        height: "200px", 
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "start",
                                        alignItems: "center",
                                        borderRadius: "5px",
                                    }
                                }}
                            >
                                <DialogTitle>{t("sure_to_update_all_users")}?</DialogTitle>
                                <Box 
                                    sx={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        position: 'absolute',
                                        top: '50%',
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
                            onClose={hideVerifyDeleteAllDialog}
                            PaperProps={{
                                sx: {
                                    width: "400px",  
                                    height: "200px", 
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "start",
                                    alignItems: "center",
                                    borderRadius: "5px",
                                }
                            }}
                        >
                            <DialogTitle>{t("sure_to_delete_all_users")}?</DialogTitle>
                            <Box 
                                sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'absolute',
                                    top: '50%',
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
                        <TextField select variant="outlined" required placeholder={t("role")} value={user.role} sx={{width:"15%"}} onChange={(e) => handleRoleChange(e,user._id)}> 
                        {UserRoles.map((role) => (
                            <MenuItem key={role} value={role}>
                                {t(role)}
                            </MenuItem>
                        ))}
                        </TextField>
                        <Box sx={{width:'15%', display:"flex", flexDirection:"row", justifyContent:"end"}}>
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
                        <Dialog
                            open={verifyUpdate}
                            onClose={hideVerifyUpdateDialog}
                            PaperProps={{
                                sx: {
                                    width: "400px",  
                                    height: "200px", 
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "start",
                                    alignItems: "center",
                                    borderRadius: "5px",
                                }
                            }}
                        >
                            <DialogTitle>{t("sure_to_update_user")}?</DialogTitle>
                            <Box 
                                sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'absolute',
                                    top: '50%',
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
                            onClose={hideVerifyDeleteDialog}
                            PaperProps={{
                                sx: {
                                    width: "400px",  
                                    height: "200px", 
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "start",
                                    alignItems: "center",
                                    borderRadius: "5px",
                                }
                            }}
                        >
                            <DialogTitle>{t("sure_to_delete_user")}?</DialogTitle>
                            <Box 
                                sx={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'absolute',
                                    top: '50%',
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
                                    padding: '5px 10px',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    width: '100px',
                                    height: '40px',
                                    marginTop: '10px',
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
                    </Box>
                ))}
            </Box>
            <Pagination
                count={pageCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
            />
        </Box>
    );
};


export default ManageUsers;
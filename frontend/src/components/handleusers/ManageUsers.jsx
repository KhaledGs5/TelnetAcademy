import React, {useState} from "react";
import { Box, TextField , Typography, Button, Link,Input,IconButton, InputAdornment, Tooltip} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

const ManageUsers = () => {

    const [searchedName, setSearchedName] = useState('');
    const [selectedRole, setSelectedRole] = useState('All');
    const [orderState, setOrderState] = useState('Down');
    const [selectedOrder, setSelectedOrder] = useState('Name');

    const [users, setUsers] = useState({
        user1: { id: "1", name: "Sara Oualha", role: "Trainer", email: "Sara.Oualha@groupe-telnet.net", password: "password" , modified: false},
        user2: { id: "2", name: "Mohamed Dhouib", role: "Trainer", email: "Mohamed.Dhouib@groupe-telnet.net", password: "password", modified: false},
        user3: { id: "3", name: "Mohamed Dhouib", role: "Trainer", email: "Mohamed.Dhouib@groupe-telnet.net", password: "password", modified: false},
        user4: { id: "4", name: "Mohamed Dhouib", role: "Trainer", email: "Mohamed.Dhouib@groupe-telnet.net", password: "password", modified: false },
        user5: { id: "5", name: "Mohamed Dhouib", role: "Trainer", email: "Mohamed.Dhouib@groupe-telnet.net", password: "password", modified: false},
        user6: { id: "6", name: "Mohamed Dhouib", role: "Trainer", email: "Mohamed.Dhouib@groupe-telnet.net", password: "password", modified: false},
        user7: { id: "7", name: "Mohamed Dhouib", role: "Trainer", email: "Mohamed.Dhouib@groupe-telnet.net", password: "password", modified: false },
    });

    const handleSearchChange = (e) => {
        setSearchedName(e.target.value);
    }

    const handleClearSearch = () =>{
        setSearchedName(''); 
    }

    const handleFilterRoleChange = (e) => {
        setSelectedRole(e.target.value);
    };

    const handleChangeOrder = (sel) => {
        setOrderState(orderState === 'Up' ? 'Down' : 'Up');
        setSelectedOrder(sel);
    };

    const handleNameChange = (e, id) => {
        setUsers((prevUsers) => ({
            ...prevUsers,
            [Object.keys(prevUsers).find(key => prevUsers[key].id === id)]: {
                ...prevUsers[Object.keys(prevUsers).find(key => prevUsers[key].id === id)],
                name: e.target.value,
                modified: true
            }
        }));
    };

    const handleEmailChange = (e, id) => {
        setUsers((prevUsers) => ({
            ...prevUsers,
            [Object.keys(prevUsers).find(key => prevUsers[key].id === id)]: {
                ...prevUsers[Object.keys(prevUsers).find(key => prevUsers[key].id === id)],
                email: e.target.value,
                modified: true
            }
        }));
    };

    const handlePasswordChange = (e, id) => {
        setUsers((prevUsers) => ({
            ...prevUsers,
            [Object.keys(prevUsers).find(key => prevUsers[key].id === id)]: {
                ...prevUsers[Object.keys(prevUsers).find(key => prevUsers[key].id === id)],
                password: e.target.value,
                modified: true
            }
        }));
    };

    const handleRoleChange = (e, id) => {
        setUsers((prevUsers) => ({
            ...prevUsers,
            [Object.keys(prevUsers).find(key => prevUsers[key].id === id)]: {
                ...prevUsers[Object.keys(prevUsers).find(key => prevUsers[key].id === id)],
                role: e.target.value,
                modified: true
            }
        }));
    };

    const handleDeleteUser = (id) => {
        setUsers((prevUsers) => {
            const updatedUsers = Object.fromEntries(
                Object.entries(prevUsers).filter(([_, user]) => user.id !== id) 
            );
            return updatedUsers;
        });
    };
    
    const handleSaveCahnges = (id) => {
        setUsers((prevUsers) => ({
            ...prevUsers,
            [Object.keys(prevUsers).find(key => prevUsers[key].id === id)]: {
                ...prevUsers[Object.keys(prevUsers).find(key => prevUsers[key].id === id)],
                modified: false
            }
        }));
    };

    const handleSaveAllChanges = () => {
        setUsers((prevUsers) =>
            Object.fromEntries(
                Object.entries(prevUsers).map(([key, user]) => [
                    key,
                    { ...user, modified: false }
                ])
            )
        );
    };

    const handleDeleteAllUsers = () => {
        setUsers({});
    };

    const FilterRoles = ["All","Trainer", "Trainee"];
    const UserRoles = ["Trainer", "Trainee"];

    const orderStyle = {
        color: "text.primary",
    }

    return (
        <Box
            sx={{
                width: '90%',
                height: '80vh',
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
                    position: "absolute",
                    top: '5%',
                }}
            >
                Manage Users
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    width: '40%',
                    position: "absolute",
                    top: '20%',
                    gap: '20px',
                }}
            >
                <Input
                    placeholder="Search by Name"
                    value={searchedName}
                    onChange={handleSearchChange}
                    sx={{
                        width: '50%'
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
                    label="Role"
                    defaultValue="All"
                    value={selectedRole}
                    onChange={handleFilterRoleChange}
                    sx={{
                        width: '50%'
                    }}
                    >
                    {FilterRoles.map((role) => (
                        <MenuItem key={role} value={role}>
                            {role}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>
            <Box 
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'absolute',
                    top: '35%',
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
                            Name
                        </Typography>
                        {selectedOrder === "Name" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Button
                        sx={{...orderStyle, width: '30%'}}
                        onClick={() => handleChangeOrder("Email")}
                    >
                        <Typography>
                            Email
                        </Typography>
                        {selectedOrder === "Email" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Button
                        sx={{...orderStyle, width: '20%'}}
                        onClick={() => handleChangeOrder("Password")}
                    >
                        <Typography>
                            Password
                        </Typography>
                        {selectedOrder === "Password" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Button
                        sx={{...orderStyle, width: '15%'}}
                        onClick={() => handleChangeOrder("Role")}
                    >
                        <Typography>
                            Role
                        </Typography>
                        {selectedOrder === "Role" ? (orderState === "Up" ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />) : null}
                    </Button>
                    <Box sx={{width:'15%', display:"flex", flexDirection:"row", justifyContent:"end"}}>
                        <Tooltip title="Save All" arrow> 
                            <IconButton onClick={handleSaveAllChanges} sx={{ color: "#76C5E1" }}>
                                <SaveIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete All" arrow> 
                            <IconButton onClick={handleDeleteAllUsers} sx={{color:"#EA9696"}}>
                                <DeleteIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>
            <Box
                sx={{
                    width: '100%',
                    height: "50%",
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'absolute',
                    top: '45%',
                    overflowY: 'scroll',
                    boxSizing: 'border-box',
                    gap: '10px',
                    scrollbarWidth: 'none', 
                    '&::-webkit-scrollbar': {
                        display: 'none', 
                    },
                }}
            >
                {Object.entries(users)
                .filter(([_,user]) => user !== undefined)
                .map(([key, user]) => ({ id: key, ...user }))
                .filter(user =>
                    user.name.toLowerCase().includes(searchedName.toLowerCase()) &&
                    (selectedRole === user.role || selectedRole === "All")
                )
                .sort((fuser, suser) => {
                    if (selectedOrder && fuser[selectedOrder.toLowerCase()] !== undefined && suser[selectedOrder.toLowerCase()] !== undefined) {
                            return orderState === "Down"
                                ? fuser[selectedOrder.toLowerCase()].toLowerCase().localeCompare(suser[selectedOrder.toLowerCase()].toLowerCase())
                                : suser[selectedOrder.toLowerCase()].toLowerCase().localeCompare(fuser[selectedOrder.toLowerCase()].toLowerCase());
                    }
                    return 0;
                })
                .map(user => (
                    <Box
                        key={user.id}
                        sx={{
                            width: '90%',
                            height: '60px',
                            display: 'flex',
                            justifyContent: "start",
                            alignItems: 'center',
                            gap: '5px',
                        }}
                    >
                    <TextField variant="outlined" required placeholder="Name" value={user.name} sx={{width:"20%"}} onChange={(e) => handleNameChange(e,user.id)}/>
                    <TextField variant="outlined" required placeholder="Email" value={user.email} sx={{width:"30%"}} onChange={(e) => handleEmailChange(e,user.id)}/>
                    <TextField variant="outlined" required placeholder="Password" value={user.password} sx={{width:"20%"}} onChange={(e) => handlePasswordChange(e,user.id)}/>
                    <TextField select variant="outlined" required placeholder="Role" value={user.role} sx={{width:"15%"}} onChange={(e) => handleRoleChange(e,user.id)}> 
                    {UserRoles.map((role) => (
                        <MenuItem key={role} value={role}>
                            {role}
                        </MenuItem>
                    ))}
                    </TextField>
                    <Box sx={{width:'15%', display:"flex", flexDirection:"row", justifyContent:"end"}}>
                        <Tooltip title="Save" arrow> 
                            <IconButton sx={{color:"#76C5E1"}} disabled={!user.modified} onClick={() => handleSaveCahnges(user.id)}>
                                <SaveIcon/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow> 
                            <IconButton sx={{color:"#EA9696"}} onClick={() => handleDeleteUser(user.id)}>
                                <DeleteIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};


export default ManageUsers;
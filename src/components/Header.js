import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { useHistory} from "react-router-dom";
import { useState } from "react";

const Header = ({ loggedInUsername,children, hasHiddenAuthButtons }) => {
  

let loggedIn = false; 
if(loggedInUsername!==null){
    loggedIn = true;
  }
  

  
  let buttonBoolean = hasHiddenAuthButtons;
  if(hasHiddenAuthButtons===undefined)buttonBoolean=false;

  const handleLogout= ()=>{
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      localStorage.removeItem('balance');
    history.push('/');
    window.location.reload();

  }
  

  

  const history = useHistory();
if(!hasHiddenAuthButtons){
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        
          {children}
        
        
      
        {
          (loggedIn)&& <>
          <Stack direction="row" spacing={1} alignItems="center">
          {/* <img src="/public/avatar.png" alt="User avatar"></img> */}
          
          <Avatar src="avatar.png" alt={loggedInUsername}/>
          <p>{loggedInUsername}</p>
          <Button
          variant="text"
          onClick={()=>{
            handleLogout()}}
        >LOGOUT</Button>
        </Stack>
          </>
        }
        {
          (!loggedIn)&& <>
          <Stack direction="row" spacing={1} alignItems="center">
          <Button
          variant="text"
          onClick={()=>{
            history.push('/login');}}
        >LOGIN</Button>
          <Button
          variant="contained"
          onClick={()=>{
            history.push('/register');}}
        >REGISTER</Button>
        </Stack>
          </>
        }
        
      </Box>
    );}
    else{
      return( <Box className="header">
      <Box className="header-title">
          <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {children}
      {(buttonBoolean)&&<Button
        className="explore-button"
        startIcon={<ArrowBackIcon />}
        variant="text"
        onClick={()=>{
          history.push("/")}}
      >
        Back to explore
      </Button>}
      
      
    </Box>)

    }
};

export default Header;

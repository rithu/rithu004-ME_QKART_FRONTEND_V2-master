import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState, useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
// import "./Login.css";

const Login = () => {
  let [loginData,setLoginData] = useState({});
  let [errorMessage, setErrorMessage] = useState("");
  let [isLoading,setIsLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar(); 
  const history = useHistory();


  // TODO: CRIO_TASK_MODULE_LOGIN - Fetch the API response
  /**
   * Perform the Login API call
   * @param {{ username: string, password: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   * Example for successful response from backend:
   * HTTP 201
   * {
   *      "success": true,
   *      "token": "testtoken",
   *      "username": "criodo",
   *      "balance": 5000
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Password is incorrect"
   * }  
   *
   */
  const login = async (formData) => {
    setIsLoading(true);
    try {
      const loginPost = await axios({
        method: 'post',
        url: config.endpoint + '/auth/login',
        data: {
          username: formData.username,
          password: formData.password
        }
      });
      setIsLoading(false);
      enqueueSnackbar("Logged in successfully", { variant: 'success' });
      history.push("/", { from: "Login" }); //used to redirect to product page
      persistLogin(loginPost.data["token"],loginPost.data["username"],loginPost.data["balance"]);
      // localStorage.setItem('username', loginPost.data["username"]); //used to store data in local storage(persist data)
      // localStorage.setItem('token', loginPost.data["token"]);
      // localStorage.setItem('balance', loginPost.data["balance"]);
      // console.log("login post:::",loginPost);
    }
    catch (err){
      setIsLoading(false);
      if(err.response.status>=400&&err.response.status<500)
      enqueueSnackbar(err.response.data.message, { variant: 'error' });
      else
      enqueueSnackbar("Something went wrong. Check that the backend is running, reachable and returns valid JSON.", { variant: 'error' });
      // console.log(err);
    }
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Validate the input
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false and show warning message if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that password field is not an empty value - "Password is a required field"
   */
  const validateInput = (data) => {
    // console.log(data);
  if(data.username===undefined){
    return false;
  }
  else if(data.password===undefined){
    return false;
  }
  else return true;
  };
  
  const handleErrorSnackbar = (data)=>{
   
    if(data.username===undefined){
      setErrorMessage("Username is a required field"); 
    }
    else if(data.password===undefined){
      setErrorMessage("Password is a required field");
    }
    else setErrorMessage("");

  };

 const handleChange = (name, value)=>{
  setLoginData({...loginData,[name]:value});
 }

  // TODO: CRIO_TASK_MODULE_LOGIN - Persist user's login information
  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} username
   *    Username of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   * Make use of localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * -    `token` field in localStorage can be used to store the Oauth token
   * -    `username` field in localStorage can be used to store the username that the user is logged in as
   * -    `balance` field in localStorage can be used to store the balance amount in the user's wallet
   */
  const persistLogin = (token, username, balance) => {
    localStorage.setItem('balance', balance);
    localStorage.setItem('username', username);
    localStorage.setItem('token', token);
    window.location.reload();
  };
  useEffect(() => {
    if(errorMessage!=="")
    enqueueSnackbar(errorMessage, { variant: 'warning' });
}, [errorMessage]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
        <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            onChange={(e)=>{handleChange(e.target.name,e.target.value)}}
            // placeholder="Enter Usern ame"
            
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            fullWidth
            onChange={(e)=>{handleChange(e.target.name,e.target.value)}}
            // placeholder="Enter a password with minimum 6 characters"
           
          />
          {isLoading?<CircularProgress/>:<Button className="button" variant="contained" onClick={()=>{validateInput(loginData)?login(loginData):handleErrorSnackbar(loginData)}}>
          LOGIN TO QKART
           </Button>}
           <p className="secondary-action">
           Don’t have an account? {" "}
             
             <Link to="/register" className="link">Register now</Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;

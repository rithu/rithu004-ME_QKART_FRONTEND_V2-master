import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState ,useEffect} from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";

const Register = () => {
  let [formData, setFormData] = useState({});
  let [errorMessage, setErrorMessage] = useState("");
  let [isLoading,setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();


  // TODO: CRIO_TASK_MODULE_REGISTER - Implement the register function
  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const register = async (formData) => {
    setIsLoading(true);
    try {
      const registerPost = await axios({
        method: 'post',
        url: config.endpoint + '/auth/register',
        data: {
          username: formData.username,
          password: formData.password
        }
      });
      setIsLoading(false);
      enqueueSnackbar("Registered Successfully", { variant: 'success' });
      history.push("/login", { from: "Register" });
     
    }
    catch (err){
      setIsLoading(false);
      enqueueSnackbar(err.response.data.message, { variant: 'error' });
      
    }
  };

  // TODO: CRIO_TASK_MODULE_REGISTER - Implement user input validation logic
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
  
  if(data.username===undefined){
    return false;
  }
  else if(data.username.length<6){
    return false;
  }
  else if(data.password===undefined){
    return false;
  }
  else if(data.password.length<6){
    return false;
  }
  else if(data.password!==data.confirmPassword){
    return false;
  }else
  return true;
  };

  const handleFormChange = (name, value) => {
    
    setFormData({ ...formData, [name]: value });
    
   
  };
  const handleErrorSnackbar = (data)=>{
   
    if(data.username===undefined){
      setErrorMessage("Username is a required field"); 
    }
    else if(data.username.length<6){
      setErrorMessage("Username must be at least 6 characters");
    }
    else if(data.password===undefined){
      setErrorMessage("Password is a required field");
    }
    else if(data.password.length<6){
      setErrorMessage("Password must be at least 6 characters");
    }
    else if(data.password!==data.confirmPassword){
      setErrorMessage("Passwords do not match");
    }else setErrorMessage("");

  };
  useEffect(() => {
    if(errorMessage!=="")
    enqueueSnackbar(errorMessage, { variant: 'warning' });
}, [errorMessage,enqueueSnackbar]);

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
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            onChange ={(e)=>handleFormChange(e.target.name,e.target.value)}
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            onChange ={(e)=>handleFormChange(e.target.name,e.target.value)}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            onChange ={(e)=>handleFormChange(e.target.name,e.target.value)}
          />
           {isLoading?<CircularProgress/>:<Button className="button" variant="contained" onClick={ ()=>{ validateInput(formData)?  register(formData):handleErrorSnackbar(formData)}}>
            Register Now
           </Button>}
          <p className="secondary-action">
            Already have an account?{" "}
             {/* <a className="link" href="#">
              Login here
             </a> */}
             <Link to="/login" className="link" >
              Login here
             </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;

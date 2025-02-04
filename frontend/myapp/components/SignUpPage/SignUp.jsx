import React, { useRef, useState } from 'react'
import './SignUp.scss'
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {

  const apiUrl = import.meta.env.VITE_API_URL;
  const fullNameRef = useRef(null);
  const usernameRef = useRef(null);
  const telephoneRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPassRef = useRef(null);
  const navigate = useNavigate();

  const [formData,setFormData] = useState({
    FullName: "",
    Username: "",
    Telephone: "",
    Email: "",
    Password: "",
    ConfirmPass: "",
  });

  const handleChange=(e)=>{
      const {name , value} = e.target;

      setFormData((prevData)=>({
        ...prevData,
        [name]: value,
      }));
  }

  const setError=(element,message)=>{
   const inputControl = element.parentElement;
   const errorDisplay = inputControl.querySelector('.error');
   errorDisplay.innerText = message;
   errorDisplay.style.fontSize = '15px';
   inputControl.classList.add('error');
   inputControl.classList.remove('success');
  }

  const setSuccess=(element)=>{
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error'); 
    if(errorDisplay){
      errorDisplay.innerText='';
    }
    inputControl.classList.remove('error');
    inputControl.classList.add('success');
   }


  const isValidString = (test)=>{
    const re = /^(([a-zA-Z ]+)())$/
    return re.test(String(test));
  }

  const validUsername =(data)=>{
   const regularExpression  = /^(([a-zA-Z0-9]+)(_)*([a-zA-Z0-9]+))$/
   return regularExpression.test(String(data));
  }

  const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
  
  const isValidTelephone = (telephone) => {
    const re = /^(0[5|6|7][0-9]{8})$/
    return re.test(String(telephone));
  }

  const validPassword = (test)=>{

    if(test.length<6)
      return -1;
  }

function checkUsername(username){

  return new Promise((resolve,reject)=>{

 try {
  axios.get(`${apiUrl}/isUsernameTelephoneExist`,{
    params: {
      checkedUsername: username
    }
  })
  .then((response)=>{

    if(response.data.answer===1){       
      reject();
    }
    else {
      resolve();
    }

  })
  .catch(err=>{
    console.log(err);
    return -1;
  })
 }
 catch {
    return -1;
 }    
  })
  .then(()=>{
    setSuccess(usernameRef.current);
    return 0;
  })
  .catch(()=>{
    return 1;
  })

 }

function checkPhoneNumber(Telephone){
    // check in the database 

    return new Promise((resolve,reject)=>{

      axios.get(`${apiUrl}/isUsernameTelephoneExist`,{
        params: {
          checkedTelephone: Telephone
        }
      })
      .then((response)=>{
  
        if(response.data.answer===1){
          reject();
        }
        else {
          resolve();
        }
      })
      .catch((err)=>{
        console.log(err);
        return -1;
      })
    }) 
    .then(()=>{
      setSuccess(telephoneRef.current);
      return 0;
    })
    .catch(()=>{
      return 1;
    }) 
 }

 function checkEmail(email){
  // check in the database 

  return new Promise((resolve,reject)=>{

    axios.post(`${apiUrl}/checkEmail`,{email:email})
    .then((response)=>{
      
      if(response.data.answer==='yes'){
        reject();
      }
      else {
        resolve();
      }
    })
    .catch((err)=>{
      console.log(err);
      return -1;
    })
  }) 
  .then(()=>{
    setSuccess(emailRef.current);
    return 0;
  })
  .catch(()=>{
    return 1;
  }) 
}


 function sendCustomerData(data) {

  axios.post(`${apiUrl}/createCustomerAccount`,data)
  .then((response)=>{
    console.log(response.data.answer);
  })
  .catch((err)=>{
    console.log(err);
  })
 }


// Example usage
//
//console.log(`Your OTP code is: ${otp}`);

  

  async function handleSubmit(e){
      e.preventDefault();
      // Checking Full Name validity
      
      if(isValidString(formData.FullName)){       
             setSuccess(fullNameRef.current);
       }
    else{
    setError(fullNameRef.current,"Full must be only with letters and white spaces");
    return;
      }

      // Checking Username validity
          if(validUsername(formData.Username)){
             const usernameAvailability = await checkUsername(formData.Username);
         //    console.log("username availability = "+usernameAvailability);
              if(usernameAvailability!=1){


                if(isValidTelephone(formData.Telephone)){
                  const phoneAvailability = await checkPhoneNumber(formData.Telephone);
           //       console.log("phone availability = "+phoneAvailability);
                  if(phoneAvailability!=1){

                    if(isValidEmail(formData.Email)){                 
                      setSuccess(emailRef.current);

                      const emailAvailability = await checkEmail(formData.Email);
             //         console.log("email availability = "+emailAvailability);

                      if(emailAvailability!=1){
                        if( validPassword(formData.Password)!=-1){
                          setSuccess(passwordRef.current);
                       }
                       else {
                        setError(passwordRef.current,"password must be at least 6 characters");
                        return;
                       }
                      
                      
                       if(formData.ConfirmPass===formData.Password){
                        setSuccess(confirmPassRef.current);
          
                        if(usernameAvailability===0 && phoneAvailability===0){
          
                          Swal.fire({
                            title: "Are you sure?",
                            text: "Do you want to complete you registration",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "green",
                            cancelButtonColor: "red",
                            confirmButtonText: "complete",
                            cancelButtonText: "cancel"
                          }).then((result) => {
                            if (result.isConfirmed) {
                              Swal.fire({
                                title: "Confirmation!",
                                html: `Verification code was sent to your email <span style="color: #2d87f0; font-weight: bold;">${emailRef.current.value}</span> to confirm your account`,
                                icon: "success",
                                timer:3500,
                                customClass: {
                                  popup: 'accountVerified-swal-popup', // Custom class to center the popup
                                },
                              });
                              sendCustomerData(formData);
                              navigate(`/otp-verification/${emailRef.current.value}`);
                            }
                          });
          
                        }
                      }
                      else {
                        setError(confirmPassRef.current,"please re-enter your password");
                        return;
                      }
                      }
                      else if(emailAvailability==1) {
                        setError(emailRef.current,"This email is already in use");
                      }
                      else {
                        setError(emailRef.current,"Error checking email availability");
                      }                               
               }
               else {
                setError(emailRef.current,"put a valid email");
                return;
               }

                  }
                  else if(phoneAvailability===1){
                    setError(telephoneRef.current,"Phone number already in use");
                  }
                  else{
                    setError(telephoneRef.current,"Error checking phone number availability");
                  }
                }
                else {
                  setError(telephoneRef.current,"must starts with 05|06|07 and contains only 10 numbers");
                  return;
                }
        
              }
              else if(usernameAvailability===1){
                setError(usernameRef.current,"username already exist");
              }
              else {
                setError(usernameRef.current,"Error checking username availability");
              }
                               
            }
        else {
          setError(usernameRef.current,"invalid username");
          return;
        }

        // Checking Telephone validity

      
  }

  return (
    <div className='Father'>
      <form action="">
        <div className="input-group">
          <label htmlFor="customerName">Full Name</label>
        <input type="text" placeholder='Full Name' name='FullName' ref={fullNameRef} value={formData.FullName} onChange={handleChange}/>
        <div className="error"></div>
        </div>

        <div className="input-group">
          <label htmlFor="username">Username</label>
        <input type="text" placeholder='username' name='Username'  ref={usernameRef} value={formData.Username} onChange={handleChange}/>
        <div className="error"></div>
        </div>


        <div className="input-group">
          <label htmlFor="telephone">Telephone Number</label>
        <input type="text" placeholder='telephone' name='Telephone' ref={telephoneRef} value={formData.Telephone} onChange={handleChange}/>
        <div className="error"></div>
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
        <input type="text" placeholder='email' name='Email' ref={emailRef} value={formData.Email} onChange={handleChange}/>
        <div className="error"></div>
        </div>

        <div className="input-group">
          <label htmlFor="password">Pasword</label>
        <input type="text" placeholder='password' name='Password' ref={passwordRef} value={formData.Password} onChange={handleChange}/>
        <div className="error"></div>
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
        <input type="text" placeholder='re-enter password' name='ConfirmPass' ref={confirmPassRef} value={formData.ConfirmPass} onChange={handleChange}/>
        <div className="error"></div>
        </div>
       
     <div className="input-group">
      <button className='confirmButton' onClick={handleSubmit}>Confirm</button>
     </div>
       
      </form>
    </div>
  )
}

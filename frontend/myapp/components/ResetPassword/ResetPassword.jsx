import React, {useRef, useState} from 'react'
import { useNavigate,useParams } from 'react-router-dom'
import { encryptWithFixedIV } from '../../../../backend/encryptionMethods/encryptionDecryptionMethods';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ResetPassword.scss';

function ResetPassword() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const passwordRef = useRef(null);
  const confirmPassRef = useRef(null);
  const {email,token} = useParams();
  const [password,setPassword] = useState('');
  const [confirmPass,setConfirmPass] = useState('');
  const navigate = useNavigate('');

    const [showPassword, setShowPassword] = useState(false);
  
    const togglePasswordVisibility = () => {
      setShowPassword((prevState) => !prevState);
    };

    const [showConfrimPassword, setConfirmShowPassword] = useState(false);
  
    const toggleConfirmPasswordVisibility = () => {
      setConfirmShowPassword((prevState) => !prevState);
    };
  
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

    const isValidPassword = (test) => {
      // Check if the password length is at least 8 characters
      if (test.length < 8) {
        return false; // Password is too short
      }
    
      // Check if password contains at least one uppercase letter, one lowercase letter, and one number
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    
      if (!regex.test(test)) {
        return false; // Password doesn't meet the required conditions
      }
    
      return true; // Password is valid
    }
    

    const handleSubmit = async (e) =>{
     e.preventDefault();
     if(isValidPassword(password)){
      console.log('email = '+email);
      console.log('token = '+token);
         setSuccess(passwordRef.current);
           if(password===confirmPass){
              setSuccess(confirmPassRef.current);

                                      Swal.fire({
                                          title: "Are you sure?",
                                          text: "Do you want to confirm your new password",
                                          icon: "warning",
                                          showCancelButton: true,
                                          confirmButtonColor: "green",
                                          cancelButtonColor: "red",
                                          confirmButtonText: "complete",
                                          cancelButtonText: "cancel"
                                        }).then(async (result) => {
                                          if (result.isConfirmed) {
                                            await axios.post(`${apiUrl}/reset-password/`,{email:email,token:token,password:password})
                                            .then((response)=>{
                                             console.log("response = "+response.data.answer);
                                             if(response.data.answer=='Your reset password link has expired'){
                                           Swal.fire({
                                             position: "top",
                                             icon: "warning",
                                             title: "Warning",
                                             text: "Your reset password link has expired",
                                             showConfirmButton: false,
                                             timer: 4500,
                                             width: '400px',
                                             customClass: {
                                               popup: 'custom-swal-popup-warning',
                                               title: 'custom-swal-title-warning',
                                             },
                                             background: 'white',
                                           });
                                             }
                                             else {
                                                                       Swal.fire({
                                                                         position: "top",
                                                                         icon: "success",
                                                                         title: "Success",
                                                                         text: "Your password has been updated successfully",
                                                                         showConfirmButton: false,
                                                                         timer: 4500,
                                                                         width: '400px',
                                                                         customClass: {
                                                                           popup: 'custom-swal-popup-success',
                                                                           title: 'custom-swal-title-success',
                                                                         },
                                                                         background: 'white', // Light green background for success
                                                                       })
                                                                       .then(()=>{
                                                                         navigate('/login');
                                                                       })
                                             }
                                 
                                 
                                            })
                                            .catch((err)=>{
                                             console.log(err);
                                             Swal.fire({
                                               position: "top",
                                               icon: "error",
                                               title: "Error",
                                               text: "Error occurred during sending email. Please try again.",
                                               showConfirmButton: false,
                                               timer: 4500,
                                               width: '400px',
                                               customClass: {
                                                 popup: 'custom-swal-popup-error',
                                                 title: 'custom-swal-title-error',
                                               },
                                               background: '#ffe6e6', // Light red background for error
                                             });
                                            })
                                          }
                                        });


    
           }
           else {
                 setError(confirmPassRef.current,("confirm password must be the same as password"))
           }
     }
     else {
      setError(passwordRef.current,("Password must be at least 8 characters long ,include uppercase,lowercase, and a number"));
     }
    }

  return (
    <div className='FatherLogin'>
           <form onSubmit={handleSubmit}>
        <div className="input-groupLogin" >
          <label htmlFor="" style={{color:'#2196f3'}}>Set New Password</label>
        <input
        style={{borderColor:'#2196f3'}} 
        type={showPassword ? "text" : "password"} placeholder='New password'
        ref={passwordRef}
        value={password} 
        onChange={(e)=>{setPassword(e.target.value);
         // console.log(email);
        }}/>
                  <span
            onClick={togglePasswordVisibility}
            style={{
              position: "absolute",
              right: "10%",
              top: "45%",
              transform: "translateY(-40%)",
              cursor: "pointer",
              color: showPassword ? "#007BFF" : "#888",
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        <div className="error"></div>
        </div>

        <div className="input-groupLogin">
  <label htmlFor="confirmPassword" style={{color:'#2196f3'}}>Confirm Password</label>
  <input
    style={{borderColor:'#2196f3'}}
    type={showConfrimPassword ? "text" : "password"} 
    placeholder="Confirm password"
    value={confirmPass}
    onChange={(e) => setConfirmPass(e.target.value)} // Corrected to update `confirmPass`
    ref={confirmPassRef}
  />
  <span
    onClick={toggleConfirmPasswordVisibility}
    style={{
      position: "absolute",
      right: "10%",
      top: "45%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: showConfrimPassword ? "#007BFF" : "#888",
    }}
  >
    {showConfrimPassword ? "🙈" : "👁️"}
  </span>
  <div className="error"></div>
</div>


        <div className="input-groupLogin">
      <button className='forgetPasswordBtn' onClick={handleSubmit}>Confrim</button>
     </div>

        </form>
    </div>
  )
}

export default ResetPassword



import React, { useState } from 'react'
import './OtpVerificationDegits.scss'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { toast,Toaster } from 'sonner';
function OtpVerificationDegits() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const {email} = useParams();
  const navigate = useNavigate('');
  const [otp,setOtp] = useState(new Array(6).fill(""))
  const [errorMessage, setErrorMessage] = useState("");


  function handleChange(e,index){

     if(isNaN(e.target.value)) return false;
 
     setOtp([...otp.map((data,indx)=>(indx === index ? e.target.value:data))])

     if(e.target.value && e.target.nextSibling){
      e.target.nextSibling.focus()
     }
  }

  function getOtpCodeFromTable (otpTable) {
    let code = '';

    for(let i=0;i<otpTable.length;i++){
      code+=otpTable[i];
    }
    return code;
  }

  const ResendOtpCode = async(email,username)=>{
    console.log('Email = '+email);
    console.log('username = '+username);
  await  axios.post(`${apiUrl}/sendOtpCode`,{email:email,username:username})
    .then((response)=>{
      console.log(response.data.answer);
      if(response.data.answer=='Success'){
        console.log('Email = '+response.data.email);
                            Swal.fire({
                              title: "Confirmation!",
                              html: `Verification code was sent to your email <span style="color: #2d87f0; font-weight: bold;">${response.data.email}</span> to confirm your account`,
                              icon: "success",
                              timer:3500,
                              customClass: {
                                popup: 'accountVerified-swal-popup', // Custom class to center the popup
                              },
                            });
                            navigate(`/otp-verification/${email}`);
      }
      else if(response.data.answer=='Error'){
                   Swal.fire({
                     title: 'Error',
                     text: 'There was an error appeared during sending a confirmation code in your email !',
                     icon: 'error',
                     confirmButtonText:true,
                     customClass: {
                       popup: 'custom-swal-popup',
                       title: 'custom-swal-title',
                       cancelButton: 'custom-swal-cancel-button',
                       confirmButton: 'custom-swal-confirm-button',
                     },
                   })
      }
    })
    .catch((err)=>{
      console.log(err);
      Swal.fire({
        title: 'Error',
        text: 'There was an error with the server appeared before sending you a confirmation code!',
        icon: 'error',
        confirmButtonText:false,
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          cancelButton: 'custom-swal-cancel-button',
          confirmButton: 'custom-swal-confirm-button',
        },
      })
    })
  }



  const handleSubmit = async()=>{
    const otpText = getOtpCodeFromTable(otp); 
    console.log('otp text = '+otpText);
    if(otp.length===6 && otpText!=''){
       
   await axios.post(`${apiUrl}/accountVerification`,{email:email,otp:otpText})
   .then((response)=>{
    console.log(response.data.answer);
       if(response.data.answer===1){
            setErrorMessage("");
            Swal.fire({
              icon: 'success',
              title: 'Account Verified!',
              text: 'Your account has been successfully verified.',
              showConfirmButton: false,
              timer: 5000,
              customClass: {
                popup: 'accountVerified-swal-popup', // Custom class to center the popup
              },
            })
            .then(()=>{
              navigate('/login');
            })

       }
       else if(response.data.answer===0){
               setErrorMessage("The OTP code you entered is incorrect.");
       }
       else if(response.data.answer===-1){
        Swal.fire({
          title: 'OTP Code Expired',
          text: 'Your OTP code has expired. Would you like to request a new code?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Resend',
          cancelButtonText: 'Cancel',
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            cancelButton: 'custom-swal-cancel-button',
            confirmButton: 'custom-swal-confirm-button',
          },
          buttonsStyling: false, // To enable the custom class styling
        }).then((result) => {
          if (result.isConfirmed) {
            setErrorMessage('');
            setOtp(new Array(6).fill(""));
            ResendOtpCode(email,'');
          }
        });
       }
   })      
   .catch((err)=>{
    console.log(err);
    return err;
   })

    }
  }


  return (
    <div className='otp-container'>
      <p>Account confirmation</p>

      <div className="otp-area">
        {
          otp.map((data,i)=>{
            return <input type="text"
            key={i}
             value={data}
             maxLength={1}
             onChange={(e)=>handleChange(e,i)}
             />
          })

        }
      </div>
      
      {errorMessage && <p className="errorMessageOtp">{errorMessage}</p>}

      <button className='confirmOtpBtn' onClick={handleSubmit}>Confirm</button>
    </div>
  )
}

export default OtpVerificationDegits

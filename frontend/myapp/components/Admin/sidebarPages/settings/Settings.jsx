import React, { useEffect } from 'react'
import './Settings.scss'
import { useNavigate } from 'react-router-dom';
function Settings() {
  const navigate = useNavigate('');

  useEffect(()=>{

    const admin = sessionStorage.getItem('admin');

    if(admin==='yesAdmin'){

      sessionStorage.setItem('activeMenu','Settings');

    }
   else {
    navigate('/login')
   }
   
  },[]);

  return (

    <div>
      Settings
    </div>
  )
}

export default Settings

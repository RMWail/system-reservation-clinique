import React, { useEffect, useState,PureComponent } from 'react';
import './DoctorsStatistics.scss';
//import { Bar } from 'react-chartjs-2';
//import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { FaGlobe, FaUserMd } from 'react-icons/fa';
// Register chart.js components
//ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Statistics() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [generalStats,setGeneralStats] = useState([]);
  const [activeDoctorsStats,setMostActiveDoctors] = useState([]);
  const [totalAppointments,setTotalAppointements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Sample statistics data



 useEffect(()=>{

  const getDoctorsStatistics = async ()=>{

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${apiUrl}/doctorsStats`);
      setGeneralStats(res.data.generalStats);
      setMostActiveDoctors(res.data.doctorsStats);

    } catch(err){
           setError(err.message);
    } finally {
          setLoading(false);
    }
  }


  getDoctorsStatistics();

 },[]);

 useEffect(() => {
  if (Object.keys(generalStats).length > 0) {
    setTotalAppointements(
      generalStats.completed_count + generalStats.pending_count + generalStats.cancelled_count
    );
  }
}, [generalStats]);


  if (loading) {
    return (
      <div className="statistics">
        <h1>Chargement de données ...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics">
<p style={{ color: "red" }}>Aucune donnée disponible en raison d'une erreur de connection</p>
        </div>
    )

  }



  return (
        
          generalStats.total_medecins  ? (
            <div className="statistics">
            <h1>Doctors Statistics</h1>
      
            <div className="stats-grid">
           {/*
                         <div className="stat-card total-appointments">
                <h3>Total Appointments</h3>
                <p className="stat-number">{generalStats.completed_count+generalStats.pending_count+generalStats.cancelled_count}</p>
              </div>
           */}
              <div className="stat-card total-doctors">
                <h3>Total Doctors</h3>
                <p className="stat-number">{generalStats.total_medecins}</p>
              </div>
      
              <div className="stat-card confirmed">
                <h3>Confirmed reservations</h3>
                <p className="stat-number">{generalStats.completed_count}</p>
              </div>
      
              <div className="stat-card pending">
                <h3>Pending reservations</h3>
                <p className="stat-number">{generalStats.pending_count}</p>
              </div>
      
              <div className="stat-card cancelled">
                <h3>Cancelled reservations</h3>
                <p className="stat-number">{generalStats.cancelled_count}</p>
              </div>
            </div>
      



             

            <div className="progress-bar">
  <div className="progress-bar-list">
    <h2>Most Active doctors</h2>
    {activeDoctorsStats?.map((doctor, index) => {
      return (
        <div className="progress-bar-item" key={doctor.medecin_Id}>
          <div className="bar-item-info">
            <>
              <FaUserMd size={50} color='#8e44ad'/>           
              <p>
                <span style={{ color: '#f39c12' }}>Speciality: {doctor.medecin_Specialite}</span> 
              </p>
            </>
            <p className="bar-item-info-name" style={{ color: '#e74c3c' }}>
              {doctor.nomPrenom}
            </p>
            <p className="bar-item-info-name" style={{ color: '#3498db' }}>
              Experience: {doctor.medecin_Experience} years
            </p>
            <p className="bar-item-info-value" style={{ color: '#2ecc71' }}>
              {doctor.reservation_count}
            </p>
          </div>
          <div className="bar-item-full">
            <div
              className="bar-item-filled"
              style={{
                width: `${doctor.reservation_count}%`,
              }}
            ></div>
          </div>
        </div>
      );
    })}
  </div>
</div>



          </div>
    
          ) :
          (
            <>
            
            <div className="statistics">
        <h1>You have no doctors yet</h1>
      </div>
    
            </>

          )
        
  );
}

export default Statistics;


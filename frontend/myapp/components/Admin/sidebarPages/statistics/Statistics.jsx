import React, { useEffect, useState,PureComponent } from 'react';
import './Statistics.scss';
//import { Bar } from 'react-chartjs-2';
//import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
// Register chart.js components
//ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Statistics() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [generalStats,setGeneralStats] = useState([]);
  const [monthlyStats,setMonthlyStats] = useState([]);
  const [totalAppointments,setTotalAppointements] = useState(0);
  // Sample statistics data


  const [stats, setStats] = useState({
    monthlyAverage: 0,
    dailyAverage: 0
  });

  const getStatistics = async ()=>{
    await axios.get(`${apiUrl}/reservationsStats`)
    .then((res)=>{
      setGeneralStats(res.data.genralStats);
      setMonthlyStats(res.data.monthsDetailsStats);
     
      })
    .catch((err)=>{
      console.log(err);
    })
  }


  useEffect(()=>{
    getStatistics();
    if(monthlyStats.length > 0){
      if (monthlyStats.length > 0) {
        const totalAppointmentsInYear = monthlyStats.reduce((total, month) => 
          total + month.completed_reservation + month.pending_reservation + month.cancelled_reservation, 0
        );
      setTotalAppointements(totalAppointmentsInYear);
        const daysInYear = new Date().getFullYear() % 4 === 0 ? 366 : 365;
    
        setStats({
          monthlyAverage: (totalAppointmentsInYear / 12).toFixed(2),
          dailyAverage: (totalAppointmentsInYear / daysInYear).toFixed(2)
        });
      }
    }
  },[monthlyStats]);


  const data =  monthlyStats.map(month=>({
   
        name:month.monthName,
        completed:month.completed_reservation,
        pending:month.pending_reservation,
        cancelled:month.cancelled_reservation,
      
    }
  ))


  return (
        
          monthlyStats.length >0 ? (
            <div className="statistics">
            <h1>Clinic Statistics</h1>
      
            <div className="stats-grid">
              <div className="stat-card total-appointments">
                <h3>Total Appointments</h3>
                <p className="stat-number">{totalAppointments}</p>
              </div>
      
              <div className="stat-card confirmed">
                <h3>Confirmed</h3>
                <p className="stat-number">{generalStats.completed_count}</p>
              </div>
      
              <div className="stat-card pending">
                <h3>Pending</h3>
                <p className="stat-number">{generalStats.pending_count}</p>
              </div>
      
              <div className="stat-card cancelled">
                <h3>Cancelled</h3>
                <p className="stat-number">{generalStats.cancelled_count}</p>
              </div>
            </div>
      
            <div className="stats-row">
              <div className="stat-card doctors">
                <h3>Total Doctors</h3>
                <p className="stat-number">{generalStats.total_medecins}</p>
              </div>
      
              <div className="stat-card patients">
                <h3>Monthly Average</h3>
                <p className="stat-number">{stats.monthlyAverage}</p>
              </div>
      
              <div className="stat-card daily-average">
                <h3>Daily Average</h3>
                <p className="stat-number">{stats.dailyAverage}</p>
              </div>
            </div>
 
            <div className="chart-section">
             {/* <h2>Monthly Reservations</h2>
              <div className="bar-chart">
                <Bar data={chartData} options={chartOptions} />
              </div> */}
       
       <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" stackId="a" fill="#2ecc71" />
          <Bar dataKey="pending" stackId="a" fill="#f1c40f" />
          <Bar dataKey="cancelled" fill="#e74c3c" />
        </BarChart>
      </ResponsiveContainer>


            </div>  

          </div>
    
          ) :
          (
            <></>

          )
        
  );
}

export default Statistics;

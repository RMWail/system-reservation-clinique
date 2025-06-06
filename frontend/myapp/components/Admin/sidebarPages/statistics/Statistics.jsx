import React, { useEffect, useState } from 'react';
import './Statistics.scss';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import LoadingData from '../../../loadingData/LoadingData';
import LoadingError from '../../../loadingError/LoadingError';

function Statistics() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [generalStats, setGeneralStats] = useState([]);
  const [todayStats,setTodayStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ monthlyAverage: 0, dailyAverage: 0 });

  
  useEffect(() => {
    const getStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${apiUrl}/reservationsStats`);
                                                     
        setGeneralStats(res.data.genralStats || {});
        setTodayStats(res.data.todayStats || {});
        setMonthlyStats(res.data.monthsDetailsStats || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getStatistics();
  }, []); 

  // Calculate total appointments & averages when monthlyStats updates
  useEffect(() => {
    if (monthlyStats.length > 0) {
      const totalAppointmentsInYear = monthlyStats.reduce((total, month) =>
        total + month.completed_reservation + month.pending_reservation + month.cancelled_reservation, 0
      );

      setTotalAppointments(totalAppointmentsInYear);

      const daysInYear = new Date().getFullYear() % 4 === 0 ? 366 : 365;

      setStats({
        monthlyAverage: (totalAppointmentsInYear / 12).toFixed(2),
        dailyAverage: (totalAppointmentsInYear / daysInYear).toFixed(2)
      });
    }
  }, [monthlyStats]); 

  const data = monthlyStats.map(month => ({
    name: month.monthName,
    Complété: month.completed_reservation,
    En_attente: month.pending_reservation,
    Annulés: month.cancelled_reservation,
  }));

  if (loading) {
    return (
      <div className="statistics">
        <h1>Chargement de données ...</h1>
      </div>
    );
  }

  if (error) {
    return <p style={{ color: "red" }}>Aucune donnée disponible en raison d'une erreur de serveur</p>;
  }


  return (
    generalStats ? (
      <div className="statistics" dir='ltr'>
        <h1>Statistiques Générales</h1>
  
        <div className="stats-grid">
          <div className="stat-card total-appointments">
            <h3>Total des Rendez-vous</h3>
            <p className="stat-number">{totalAppointments}</p>
          </div>
  
          <div className="stat-card confirmed">
            <h3>Rendez-vous Confirmés</h3>
            <p className="stat-number">{generalStats.completed_count}</p>
          </div>
  
          <div className="stat-card pending">
            <h3>En Attente</h3>
            <p className="stat-number">{generalStats.pending_count}</p>
          </div>
  
          <div className="stat-card cancelled">
            <h3>Annulés</h3>
            <p className="stat-number">{generalStats.cancelled_count}</p>
          </div>
        </div>

        <h1>Statistiques d'Aujourd'hui</h1>
        <div className="stats-row">
          <div className="stat-card doctors">
            <h3>Total Aujourd'hui</h3>
            <p className="stat-number">
              {todayStats.today_completed_reservations + 
               todayStats.today_pending_reservations + 
               todayStats.today_cancelled_reservations}
            </p>
          </div>
          
          <div className="stat-card patients">
            <h3>Confirmés Aujourd'hui</h3>
            <p className="stat-number">{todayStats.today_completed_reservations}</p>
          </div>
  
          <div className="stat-card daily-average">
            <h3>En Attente Aujourd'hui</h3>
            <p className="stat-number">{todayStats.today_pending_reservations}</p>
          </div>
  
          <div className="stat-card cancelled">
            <h3>Annulés Aujourd'hui</h3>
            <p className="stat-number">{todayStats.today_cancelled_reservations}</p>
          </div>
        </div>
        <div className="chart-section">
          <h2>Rendez-vous mensuels en 2025</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Complété" stackId="a" fill="#2ecc71" />
              <Bar dataKey="En_attente" stackId="a" fill="#f1c40f" />
              <Bar dataKey="Annulés" fill="#e74c3c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    ) : (
      <div className="statistics">
        <h1>Aucune donnée disponible</h1>
      </div>
    )
  );
  








/*
  return (
    generalStats ? (
      <div className="statistics">
        <h1>Clinique statistiques</h1>

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
          <h2>Monthly Reservations</h2>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
    ) : (
      <div className="statistics">
        <h1>Pas de donnée disponible</h1>
      </div>
    )
  );
*/



}

export default Statistics;

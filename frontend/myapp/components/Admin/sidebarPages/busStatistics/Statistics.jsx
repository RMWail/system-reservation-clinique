import React, { useState, useEffect } from 'react';
import { 
  MdDirectionsBus, 
  MdCheckCircle, 
  MdFreeCancellation,
  MdRoute,
  MdLocationOn,
  MdWarning,
  MdChecklist
} from 'react-icons/md';
import axios from 'axios';
import './Statistics.scss';
import { useLanguage } from '../../../../context/LanguageContext';
import { translations } from '../../../../translations/translations';
import LoadingData from '../loadingData/LoadingData.jsx';
import LoadingError from '../loadingError/LoadingError.jsx';

const Statistics = () => {
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    inactiveBuses: 0,
    totalRoutes: 0,
    totalStations: 0,
    coveredStations: 0,
    uncoveredStations: 0
  });

  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage];
  const apiUrl = import.meta.env.VITE_API_URL;
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState(null);
  

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${apiUrl}/getStatisticsData`);
        const data = response.data.statistics;
        setStats({
          totalBuses: data[0][0].totalNbrBuses || 0,
          activeBuses: data[1][0].nbrActiveBuses || 0,
          inactiveBuses: data[0][0].totalNbrBuses - data[1][0].nbrActiveBuses || 0,
          totalRoutes: data[2][0].totalNbrRoutes || 0,
          totalStations: data[3][0].totalNbrStations || 0,
          coveredStations: data[4][0].stationsWithBuses || 0,
          uncoveredStations: data[3][0].totalNbrStations - data[4][0].stationsWithBuses || 0
        });
      } catch (error) {
        setError(error.message);
        console.error('Error fetching statistics:', error);
      }
      finally {
         setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  const cards = [
    {
      title: t.admin.statistics.totalBuses,
      value: stats.totalBuses,
      icon: <MdDirectionsBus />,
      color: '#4CAF50'
    },
    {
      title: t.admin.statistics.activeBuses,
      value: stats.activeBuses,
      icon: <MdCheckCircle />,
      color: '#2196F3'
    },
    {
      title: t.admin.statistics.inactiveBuses,
      value: stats.inactiveBuses,
      icon: <MdFreeCancellation />,
      color: 'orange'
    },
    {
      title: t.admin.statistics.totalRoutes,
      value: stats.totalRoutes,
      icon: <MdRoute />,
      color: '#FF9800'
    },
    {
      title: t.admin.statistics.totalStations,
      value: stats.totalStations,
      icon: <MdLocationOn />,
      color: '#9C27B0'
    },
    {
      title: t.admin.statistics.coveredStations,
      value: stats.coveredStations,
      icon: <MdChecklist />,
      color: '#4CAF50'
    },
    {
      title: t.admin.statistics.uncoveredStations,
      value: stats.uncoveredStations,
      icon: <MdWarning />,
      color: '#FF5722'
    }
  ];

  if(loading) {
    return (
      <LoadingData/>
    );
  }

  if(error) {
    return <LoadingError/>;
  }


  return (
    <div className="statistics-container">
      <h1 className="statistics-title">{t.admin.statistics.title}</h1>
      <div className="statistics-grid">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className="stat-card"
            style={{ '--card-color': card.color }}
          >
            <div className="card-icon">
              {card.icon}
            </div>
            <div className="card-content">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistics;

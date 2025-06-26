import React, { useEffect, useRef, useState } from 'react';
import './AdminHistory.scss';
import { getStatusClass,getGenderClass,getDoctorInfo } from '../../../../utils/appointmentsHIstoryUtils';
//import { format } from 'date-fns';
import { useAppointementHistory } from '../../../../hooks/admin-hooks/useAppointementsHistory';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import LoadingData from '../../../loadingData/LoadingData';
import LoadingError from '../../../loadingError/LoadingError';

function AdminHistory() {
  const queryClient = useQueryClient();
  const socketRef = useRef('');
  const apiUrl = import.meta.env.VITE_API_URL;
  const {loading,error,reservations} = useAppointementHistory();
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const tableHeads = ['Reservation N°','Nom du patient','Téléphone','Date de rendez-vous','Date de gestion','Statut','Actions'];

/*
useEffect(()=>{
  socketRef.current = io(`${apiUrl}`,{
    auth:{secret:'this is from AdminHistory component'},
    query: {data:'AdminHistory.jsx'}
  })

  socketRef.current.on('newReservationAdded',newAppointment=>{

    console.log('new Appointement has reached AppointmentsHistory ');
    console.log('reservation order in history = '+newAppointment.reserv_Order);

    
          queryClient.setQueryData(['allAppointments'],(oldAppointments)=>{
      if(!Array.isArray(oldAppointments)) return [newAppointment];
      return [newAppointment, ...oldAppointments];
     })
     

     queryClient.invalidateQueries({queryKey:['allAppointments']});
        
  })

  return () => {
    if(socketRef.current){
      socketRef.current.disconnect();
    }
  }

},[]);
*/

  useEffect(() => {
    applyFilters();
  }, [statusFilter, dateFilter, searchQuery, reservations]);



  const applyFilters = () => {
    let filtered = [...reservations];

    // Status filter
    if (statusFilter !== 'all') {
        console.log(statusFilter);
        if(statusFilter ==='confirmed') 
      filtered = filtered.filter(res => res.reservation_Etat === 1);
    else if(statusFilter ==='cancelled')
        filtered = filtered.filter(res => res.reservation_Etat === -1);
    else if(statusFilter ==='pending')
    filtered = filtered.filter(res => res.reservation_Etat === 0);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(res => {
        const reservationDate = new Date(res.reservation_Date).toLocaleDateString();
        return reservationDate === new Date(dateFilter).toLocaleDateString();
      });
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(res =>
        res.reserv_Order.toString().includes(query) ||
        res.NomPrenom.toLowerCase().includes(query) ||
        res.Telephone.includes(query)
      );
    }

    setFilteredReservations(filtered);
  };

  const handleViewDetails = (reservation) => {
    setSelectedReservation(reservation);
  };

  const closeDetails = () => {
    setSelectedReservation(null);
  };




  if(loading) {
    return (
      <LoadingData />
    );
  }

  if(error) {
    return (
      <LoadingError />
    );
  }



  return (
    <div className="admin-history" dir='ltr'>
      <div className="history-header">
        <h2>Historique des redez-vous</h2>
        <div className="filters-container">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">Tous les statuts</option>
            <option value="confirmed">Confirmé</option>
            <option value="pending">En attente</option>
            <option value="cancelled">Annulé</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-filter"
          />

          <input
            type="text"
            placeholder="Rechercher par identifiant, téléphone ou nom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>

 {tableHeads.map((head,index)=>(
  <th key={index}>{head}</th>
 ))}
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((reservation,index) => (
              <tr key={reservation.reserv_Order}>
                <td>#{reservation.reserv_Order}</td>
                <td>{reservation.NomPrenom}</td>
                <td>{reservation.Telephone}</td>
                <td>{reservation.reservation_Date}</td>
                <td>
                  {reservation.reservation_FinDate ? 
                    reservation.reservation_FinDate : 
                    '-'
                  }
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(reservation.reservation_Etat)}`}>
                    {reservation.reservation_Etat === 1 ? 'confirmé' : reservation.reservation_Etat === 0 ? 'en attente' : 'annulé'}
                  </span>
                </td>
                <td>
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewDetails(reservation)}
                  >
                    Voire Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReservation && (
        <div className="details-modal">
          <div className="details-content">
            <button className="close-btn" onClick={closeDetails}>&times;</button>
            <h3>Détails de Rendez-vous</h3>
            <div className="details-grid">
         {/* 
                        {
                             <div className="detail-item">
                <span className="label">Reservation number:</span>
                <span className="value">#{selectedReservation.reserv_Order}</span>
              </div>
               }
         */}
               <div className="detail-item">
                <span className="label">Médecin:</span>
                <span className="value">{getDoctorInfo(selectedReservation.medecinInfo)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Nom et Prénom du patient:</span>
                <span className="value">{selectedReservation.NomPrenom}</span>
              </div>
              <div className="detail-item">
                <span className="label">L'age de patient:</span>
                <span className="value">{selectedReservation.Age}</span>
              </div>
              <div className="detail-item">
                <span className="label">Genre:</span>
                <span className={`status-badge ${getGenderClass(selectedReservation.Genre)}`}>
  {selectedReservation.Genre === 0 ? 'Mâle' : 'Femelle'}
</span>

              </div>
              <div className="detail-item">
                <span className="label">Téléphone:</span>
                <span className="value">{selectedReservation.Telephone}</span>
              </div>
              <div className="detail-item">
                <span className="label">Date de rendez-vous:</span>
                <span className="value">
                  {(selectedReservation.reservation_Date)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Date de gestion:</span>
                <span className="value">
                  {selectedReservation.reservation_FinDate ? 
                  selectedReservation.reservation_FinDate: 
                    '-'
                  }
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Statut:</span>
                <span className={`${getStatusClass(selectedReservation.reservation_Etat)}`}>
                  {selectedReservation.reservation_Etat === 1 ? 'Confirmé' : selectedReservation.reservation_Etat=== 0 ? 'En attente' : 'Annulé'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHistory;
import React, { useEffect, useRef, useState } from 'react';
import './AdminHistory.scss';
import { getStatusClass,getGenderClass,getDoctorInfo } from '../../../../utils/appointmentsHIstoryUtils';
//import { format } from 'date-fns';
import { useAppointementHistory } from '../../../../hooks/admin-hooks/useAppointementsHistory';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

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


useEffect(()=>{
  socketRef.current = io(`${apiUrl}`,{
    auth:{secret:'this is from AdminHistory component'},
    query: {data:'AdminHistory.jsx'}
  })

  socketRef.current.on('newReservationAdded',newAppointment=>{

    console.log('new Appointement has reached AppointmentsHistory ');
    console.log('reservation order in history = '+newAppointment.reserv_Order);

    /**
     *     queryClient.setQueryData(['allAppointments'],(oldAppointments)=>{
      if(!Array.isArray(oldAppointments)) return [newAppointment];
      return [newAppointment, ...oldAppointments];
     })
     */

     queryClient.invalidateQueries({queryKey:['allAppointments']});
        
  })

  return () => {
    if(socketRef.current){
      socketRef.current.disconnect();
    }
  }

},[]);

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





  if (loading) {
    return (
      <div className="admin-history">
      <div className="history-header">
        <h1>Chargement de données ...</h1>
      </div>
      </div>
    );
  }

  if (error) {
       return (
        <div className="admin-history">
        <div className="history-header">
       <p style={{ color: "red" }}>Aucune donnée disponible en raison d'une erreur de serveur</p>
      </div>
      </div>
       )
  }



  return (
    <div className="admin-history">
      <div className="history-header">
        <h2>Reservation History</h2>
        <div className="filters-container">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-filter"
          />

          <input
            type="text"
            placeholder="Search by ID, Name, or Phone..."
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
              <th>Reservation N°</th>
              <th>Patient Name</th>
              <th>Phone</th>
              <th>Reservation Date</th>
              <th>Management Date</th>
              <th>Status</th>
              <th>Actions</th>
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
                    {reservation.reservation_Etat === 1 ? 'Confirmed' : reservation.reservation_Etat === 0 ? 'Pending' : 'Cancelled'}
                  </span>
                </td>
                <td>
                  <button 
                    className="view-details-btn"
                    onClick={() => handleViewDetails(reservation)}
                  >
                    View Details
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
            <h3>Reservation Details</h3>
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
                <span className="label">Doctor:</span>
                <span className="value">{getDoctorInfo(selectedReservation.medecinInfo)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Patient Name:</span>
                <span className="value">{selectedReservation.NomPrenom}</span>
              </div>
              <div className="detail-item">
                <span className="label">Patient Age:</span>
                <span className="value">{selectedReservation.Age}</span>
              </div>
              <div className="detail-item">
                <span className="label">Gender:</span>
                <span className={`status-badge ${getGenderClass(selectedReservation.Genre)}`}>
  {selectedReservation.Genre === 0 ? 'Male' : 'Female'}
</span>

              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">{selectedReservation.Telephone}</span>
              </div>
              <div className="detail-item">
                <span className="label">Reservation Date:</span>
                <span className="value">
                  {(selectedReservation.reservation_Date)}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Management Date:</span>
                <span className="value">
                  {selectedReservation.reservation_FinDate ? 
                  selectedReservation.reservation_FinDate: 
                    '-'
                  }
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Status:</span>
                <span className={`${getStatusClass(selectedReservation.reservation_Etat)}`}>
                  {selectedReservation.reservation_Etat === 1 ? 'Confirmed' : selectedReservation.reservation_Etat=== 0 ? 'Pending' : 'Cancelled'}
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
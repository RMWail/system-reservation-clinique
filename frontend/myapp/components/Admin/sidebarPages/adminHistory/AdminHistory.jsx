import React, { useEffect, useState } from 'react';
import './AdminHistory.scss';
import axios from 'axios';
import swal from 'sweetalert2';
//import { format } from 'date-fns';

function AdminHistory() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReservation, setSelectedReservation] = useState(null);

  useEffect(() => {
    getReservations();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, dateFilter, searchQuery, reservations]);

  const getReservations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/getAppointmentsHistory`);
    //  console.log(response.data);
      setReservations(response.data);
      setFilteredReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
      setFilteredReservations([]);
    }
  };

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
        res.reservation_Id.toString().includes(query) ||
        res.patient_NomPrenom.toLowerCase().includes(query) ||
        res.patient_Telephone.includes(query)
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

  const getStatusClass = (status) => {
    switch (status) {
      case 1: return 'status-confirmed';
      case 0: return 'status-pending';
      case -1: return 'status-cancelled';
      default: return '';
    }
  };

  const getGenderClass = (gender) => {
    switch (gender) {
        case 0 : return 'status-male';
        case 1 : return 'status-female';
       default : return '';
    }
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
              <th>Reservation ID</th>
              <th>Patient Name</th>
              <th>Phone</th>
              <th>Reservation Date</th>
              <th>Management Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((reservation) => (
              <tr key={reservation.reservation_Id}>
                <td>#{reservation.reservation_Id}</td>
                <td>{reservation.patient_NomPrenom}</td>
                <td>{reservation.patient_Telephone}</td>
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
                             <div className="detail-item">
                <span className="label">Reservation ID:</span>
                <span className="value">#{selectedReservation.reservation_Id}</span>
              </div>
               */}
               <div className="detail-item">
                <span className="label">Doctor:</span>
                <span className="value">{selectedReservation.nomPrenom}</span>
              </div>
              <div className="detail-item">
                <span className="label">Patient Name:</span>
                <span className="value">{selectedReservation.patient_NomPrenom}</span>
              </div>
              <div className="detail-item">
                <span className="label">Patient Age:</span>
                <span className="value">{selectedReservation.patient_Age}</span>
              </div>
              <div className="detail-item">
                <span className="label">Gender:</span>
                <span className={`status-badge ${getGenderClass(selectedReservation.patient_Genre)}`}>
  {selectedReservation.patient_Genre === 0 ? 'Male' : 'Female'}
</span>

              </div>
              <div className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">{selectedReservation.patient_Telephone}</span>
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
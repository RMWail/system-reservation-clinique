import React, { useEffect, useState,useRef } from 'react';
import './Appointments.scss';
import axios from 'axios';
import swal from 'sweetalert2';
import { io } from 'socket.io-client';
import { toast } from 'sonner';

function Appointments() {
  const socketRef = useRef('');
  const apiUrl = import.meta.env.VITE_API_URL;
  const [selectFilter,setSelectFiler] = useState('');
  const [filterByDate,setFilterByDate] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const getAppointments = async ()=>{
    
    await axios.get(`${apiUrl}/getAppointments`)
    .then((res)=>{
  
   setAppointments(res.data);

    })
    .catch((err)=>{
      console.log(err);
      setAppointments([]); // Set empty array on error
    })
  }



  useEffect(()=>{
    getAppointments(); 
    
    socketRef.current = io(`${apiUrl}`,{
      auth:{secret:'this is from Appointments component'},
      query: {data:'Appointments.jsx'}
    })

    socketRef.current.on('newReservationAdded',newAppointment=>{
      console.log('new Appointement event has reached');
   
      toast.info(`New reservation was made by ${newAppointment.patient_NomPrenom}`,{
        position:'bottom-left',
        duration:5000,
        className: "toastClass",
      })

      setAppointments((prevAppointments)=>[...prevAppointments,newAppointment]);
      
    })

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  },[])




  const getStatusColor = (status) => {
  //  console.log('status = '+status);
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

 const getGenderColor = (gender) => {
 // console.log('gender = '+gender);
   switch (gender) {
    case 0: return 'status-male';
    case 1 : return 'status-female';
    default: return '';
   }
 }

  const handleViewActions = (appointment) => {
    setSelectedAppointment(appointment);
  };

  
  const handleStatusChange = (appointmentId, newStatus) => {
   console.log('id = '+appointmentId + '  status = '+newStatus);
   // const updatedStatus = newStatus === 1 ? 'confirmed' : 'cancelled';
    setAppointments(appointments.map(appointment => 
      appointment.reservation_Id === appointmentId 
        ? { ...appointment, reservation_Etat: newStatus }
        : appointment
    ));
    setSelectedAppointment(null);
  };

  const handleAppointementAction = (appointmentId, status) => {
    swal.fire({
      title: 'Confirmation',
      text: 'Are you sure to confirm the appointment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      confirmButtonColor: '#2196f3',
      customClass: { title: 'alertOrderTitle' },
    }).then((res) => {
      if (res.isConfirmed) {
        axios.post(`${apiUrl}/appointementAction`, { appointmentId, status })
          .then((res) => {
            console.log(res.data.result);
            const newStatus = res.data.newStatus; // Get the new status from the backend
            const swalMsg = newStatus === 1 ? 'confirmed' : 'cancelled';
            const iconColor = newStatus === 1 ? '#2196f3' : '#f44336';
  
            // Pass newStatus instead of old status
            handleStatusChange(appointmentId, newStatus);
  
            swal.fire({
              title: 'Updated!',
              html: `This appointment was set as  <span style="color:${iconColor}">${swalMsg}</span> `,
              icon: 'success',
              showConfirmButton: false,
              timer: 3000,
              customClass: { confirmButton: 'alertOrderConfirmButton2' },
            });
          })
          .catch((err) => {
            swal.fire({
              title: 'Error!',
              text: 'Something went wrong',
              icon: 'error',
            });
            console.log(err);
          });
      }
    });
  };
  
  const handleCloseDetails = ()=>{
  //  e.preventDefault();
    console.log('closing is fired');
    setSelectedAppointment(null)
  }

  return (
    <div className="admin-appointments">
      <div className="appointments-header">
        <h1>Appointments Management</h1>
        <div className="filters">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search by ID, Phone, or Name..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
     {/*
               <input 
            type="date" 
            className="date-filter"
            onChange={(e) => {setFilterByDate(e.target.value)}}
          />
     */}
          <select 
            className="status-filter"
            onChange={(e) => setSelectFiler(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="1">confirmed</option>
            <option value="0">pending</option>
            <option value="-1">cancelled</option>
          </select>
        </div>
      </div>

      <div className="appointments-container">
        <div className="appointments-table">
          {selectedAppointment && <div className="table-overlay" />}
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Telephone</th>
                <th>Patient Name</th>
                <th>gender</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            {appointments && appointments.length > 0 ? (
              <tbody>
                {Array.isArray(appointments) && appointments
                  .filter((appointment) => 
                    (selectFilter === '' || appointment.reservation_Etat === Number(selectFilter)) &&
                    (filterByDate === '' || appointment.reservation_Date === filterByDate) &&
                    (searchQuery === '' || 
                      appointment.reservation_Id.toString().includes(searchQuery) ||
                      appointment.patient_Telephone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      appointment.patient_NomPrenom.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  )
                  .map((appointment) => (
                    <tr key={appointment.reservation_Id}>
                      <td>{appointment.reservation_Id}</td>
                      <td>{appointment.patient_Telephone}</td>
                      <td>{appointment.patient_NomPrenom}</td>
                      <td>
                        <span className={`status-badge ${getGenderColor(appointment.patient_Genre)}`}>
                          {appointment.patient_Genre === 0 ? "male" : "female"}
                        </span>
                      </td>
                      <td>{appointment.nomPrenom}</td>
                      <td>{appointment.reservation_Date}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(appointment.reservation_Etat === 0 ? 'pending' : appointment.reservation_Etat === 1 ? 'confirmed' : 'cancelled')}`}>
                          {appointment.reservation_Etat === 0 ? 'pending' : appointment.reservation_Etat === 1 ? 'confirmed' : 'cancelled'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="view-actions-btn"
                          onClick={() => handleViewActions(appointment)}
                        >
                          View Actions
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan="8" className="no-appointments">
                    No reservations yet
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {selectedAppointment && (
          <div className="appointment-actions-card">
            <div className="card-header">
              <h2>Appointment Actions</h2>
              <button className="closeBtn" onClick={() =>setSelectedAppointment(null)}>×</button>
            </div>
            <div className="card-content">
              <div className="patient-info">
                <div className="info-section">
                  <h3>Patient Details</h3>
                  <div className="info-group">
                    <span className="label">Name</span>
                    <span className="value">{selectedAppointment.patient_NomPrenom}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Age</span>
                    <span className="value">{selectedAppointment.patient_Age} years</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Phone</span>
                    <span className="value">{selectedAppointment.patient_Telephone}</span>
                  </div>
                </div>
                
                <div className="info-section">
                  <h3>Appointment Details</h3>
                  <div className="info-group">
                    <span className="label">Doctor</span>
                    <span className="value">{selectedAppointment.nomPrenom}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Date</span>
                    <span className="value">{selectedAppointment.reservation_Date}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Current Status</span>
                    <span className={`status-badge ${getStatusColor(selectedAppointment.reservation_Etat===0 ? 'pending' : selectedAppointment.reservation_Etat===1 ? 'confirmed' : 'cancelled')}`}>
                      {selectedAppointment.reservation_Etat===0 ? 'pending' : selectedAppointment.reservation_Etat===1 ? 'confirmed' : 'cancelled'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="action-buttons">
                <button 
                  className="action-btn confirm"
                  onClick={() => handleAppointementAction(selectedAppointment.reservation_Id, 'confirmed')}
                  disabled={selectedAppointment.reservation_Etat === 1}
                >
                  Confirm Appointment
                </button>
                <button 
                  className="action-btn cancel"
                  onClick={() => handleAppointementAction(selectedAppointment.reservation_Id, 'cancelled')}
                  disabled={selectedAppointment.reservation_Etat === -1}
                >
                  Cancel Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Appointments;

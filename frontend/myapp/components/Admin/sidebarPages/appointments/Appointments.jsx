import React, { useEffect, useState,useRef,createContext } from 'react';
import './Appointments.scss';
import swal from 'sweetalert2';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAppointments } from '../../../../hooks/admin-hooks/useAppointements';
import { getStatusColor,getGenderColor,getDoctorInfo } from '../../../../utils/appointmentsUtils';
import LoadingData from '../../../loadingData/LoadingData';
import LoadingError from '../../../loadingError/LoadingError';

const LanguageContext = createContext();

function Appointments() {
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const queryClient = useQueryClient();
  const socketRef = useRef('');
  const apiUrl = import.meta.env.VITE_API_URL;
  const [selectFilter,setSelectFiler] = useState('');
  const [filterByDate,setFilterByDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const {appointments,loading,error,updateAppointementStatus} = useAppointments();
  


  useEffect(()=>{
    
    socketRef.current = io(`${apiUrl}`,{
      auth:{secret:'this is from Appointments component'},
      query: {data:'Appointments.jsx'}
    })

    socketRef.current.on('newReservationAdded',newAppointment=>{
     
   
      toast.info(`Nouvelle réservation par ${newAppointment.patient_NomPrenom}`,{
        position:'bottom-left',
        duration:5000,
        className: "toastClass",
      })
      
       const now = new Date();
       const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
       if(newAppointment.reservation_Date==today) {
        console.log('new Appointement has reached Appointments');

        queryClient.setQueryData(['appointments'],(oldAppointments)=>{
          if(!Array.isArray(oldAppointments)) return [newAppointment];
          return [...oldAppointments,newAppointment];
         })
       }
      
    })

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  },[])

  const handleViewActions = (appointment) => {
    setSelectedAppointment(appointment);
  };


  const handleAppointementAction = (appointmentId, status) => {
    swal.fire({
      title: 'Confirmation',
      text: 'Êtes-vous sûr de confirmer le rendez-vous ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
      confirmButtonColor: '#2196f3',
      customClass: { title: 'alertOrderTitle' },
    }).then(async(res) => {
      if (res.isConfirmed) {
        const updateAppointementResponse = await updateAppointementStatus({appointmentId:appointmentId,status:status});

        if(updateAppointementResponse.status ==200) {

        //  console.log(updateAppointementResponse.data.result);
          const newStatus = updateAppointementResponse.data.newStatus; // Get the new status from the backend
          const swalMsg = newStatus === 1 ? 'confirmé' : 'annulé';
          const iconColor = newStatus === 1 ? '#23b846' : '#f44336';

          setSelectedAppointment(null);
          swal.fire({
            title: 'Mis à jour!',
            html: `Cette rendez-vous a été fixée comme  <span style="color:${iconColor}">${swalMsg}</span> `,
            icon: 'success',
            iconColor:iconColor,
            showConfirmButton: false,
            timer: 3500,
            customClass: { confirmButton: 'alertOrderConfirmButton2' },
          });

        }
        else {
          swal.fire({
            icon:'error',
            title:'Oops',
            html:'<span style="color:red">Network error,operation has failed Please try again Later! </span>',
            showConfirmButton:false,
            timer:4000,
          })
        }


      }
    });
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
    <div className="admin-appointments" dir='ltr'>
      <div className="appointments-header">
        <h1>Gestion des rendez-vous</h1>
        <div className="filters">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Rechercher par identifiant, téléphone ou nom..."
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
            <option value="">Tous les statuts</option>
            <option value="1">confirmé</option>
            <option value="0">en attente</option>
            <option value="-1">annulé</option>
          </select>
        </div>
      </div>

      <div className="appointments-container">
        <div className="appointments-table">
          {selectedAppointment && <div className="table-overlay" />}
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Téléphone</th>
                <th>Nom du patient</th>
                <th>Genre</th>
                <th>Médecin</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            {appointments.length > 0 ? (
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
                  .map((appointment,index) => (
                    <tr key={appointment.reservation_Id}>
                      <td>{index+1}</td>
                      <td>{appointment.patient_Telephone}</td>
                      <td>{appointment.patient_NomPrenom}</td>
                      <td>
                        <span className={`status-badge ${getGenderColor(appointment.patient_Genre)}`}>
                          {appointment.patient_Genre === 0 ? "male" : "female"}
                        </span>
                      </td>
                      <td>{getDoctorInfo(appointment.medecin_Nom_Speciality,0)}</td>
                      <td>{appointment.reservation_Date}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(appointment.reservation_Etat === 0 ? 'pending' : appointment.reservation_Etat === 1 ? 'confirmed' : 'cancelled')}`}>
                          {appointment.reservation_Etat === 0 ? 'en attente' : appointment.reservation_Etat === 1 ? 'confirmé' : 'annulé'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="view-actions-btn"
                          onClick={() => handleViewActions(appointment)}
                        >
                          afficher les actions
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan="8" className="no-appointments" style={{color:'#2196F3'}}>
                   <h2>Pas encore de rendez-vous</h2>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>

        {selectedAppointment && (
          <div className="appointment-actions-card">
            <div className="card-header">
              <h2>Action de rendez-vous</h2>
              <button className="closeBtn" onClick={() =>setSelectedAppointment(null)}>×</button>
            </div>
            <div className="card-content">
              <div className="patient-info">
                <div className="info-section">
                  <h3>Détails du patient</h3>
                  <div className="info-group">
                    <span className="label">Nom et prénom</span>
                    <span className="value">{selectedAppointment.patient_NomPrenom}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Age</span>
                    <span className="value">{selectedAppointment.patient_Age} ans</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Téléphone</span>
                    <span className="value">{selectedAppointment.patient_Telephone}</span>
                  </div>
                </div>
                
                <div className="info-section">
                  <h3>Rendez-vous Détails</h3>
                  <div className="info-group">
                    <span className="label">Médecin</span>
                    <span className="value">{getDoctorInfo(selectedAppointment.medecin_Nom_Speciality,1)}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Date</span>
                    <span className="value">{selectedAppointment.reservation_Date}</span>
                  </div>
                  <div className="info-group">
                    <span className="label">Statut actuel</span>
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
                  Confirmer le rendez-vous
                </button>
                <button 
                  className="action-btn cancel"
                  onClick={() => handleAppointementAction(selectedAppointment.reservation_Id, 'cancelled')}
                  disabled={selectedAppointment.reservation_Etat === -1}
                >
                  Annulé le rendez-vous
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

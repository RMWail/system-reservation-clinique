import React, { useEffect, useState,useRef,createContext,useMemo } from 'react';
import './Appointments.scss';
import swal from 'sweetalert2';
import {FixedSizeList as List} from 'react-window';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAppointments } from '../../../../hooks/admin-hooks/useAppointements';
import LoadingData from '../../../loadingData/LoadingData';
import LoadingError from '../../../loadingError/LoadingError';
import {AppointmentsTable} from './AppointmentsTable';
import Filters from './Filters';
import SelectedAppointmentCard from './SelectedAppointmentCard';

const LanguageContext = createContext();

function Appointments() {

  const queryClient = useQueryClient();
  const socketRef = useRef('');
  const apiUrl = import.meta.env.VITE_API_URL;
  const [selectFilter,setSelectFiler] = useState('');
  const [filterByDate,setFilterByDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const {appointments,loading,error,updateAppointementStatus} = useAppointments();
  
  const tableHeads = [
    "N°",
    "Nom du patient",
    "Téléphone",
    "Genre",
    "Médecin",
    "Date",
    "Statut",
    "Actions",
  ];


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
       <Filters searchQuery={searchQuery} setSearchQuery={setSearchQuery} setSelectFiler={setSelectFiler}/>
      </div>

      <div className="appointments-container">

      <AppointmentsTable appointments={appointments} tableHeads={tableHeads} selectFilter={selectFilter} filterByDate={filterByDate} searchQuery={searchQuery} handleViewActions={handleViewActions} selectedAppointment={selectedAppointment}/>

    
        {selectedAppointment && (
      <SelectedAppointmentCard selectedAppointment={selectedAppointment} setSelectedAppointment={setSelectedAppointment} handleAppointementAction={handleAppointementAction}/>
        )}
      </div>
    </div>
  );
}

export default Appointments;


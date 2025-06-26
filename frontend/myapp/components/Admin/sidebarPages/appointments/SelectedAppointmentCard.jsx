import React from 'react'
import { getStatusColor,getDoctorInfo } from '../../../../utils/appointmentsUtils';


function SelectedAppointmentCard(props) {

    const {selectedAppointment,setSelectedAppointment,handleAppointementAction} = props;

  return (
    <div>
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
    </div>
  )
}

export default SelectedAppointmentCard

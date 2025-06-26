import {getGenderColor,getStatusColor,getDoctorInfo} from '../../../../utils/appointmentsUtils';


export const AppointmentRow = (props) => {

    const {appointment,index,handleViewActions,style}= props;

    return (
        <div className="table-row" style={style}>
          <div className="table-cell">{index + 1}</div>
          <div className="table-cell">{appointment.patient_NomPrenom}</div>
          <div className="table-cell">{appointment.patient_Telephone}</div>
          <div className="table-cell">
            <span className={`status-badge ${getGenderColor(appointment.patient_Genre)}`}>
              {appointment.patient_Genre === 0 ? "male" : "female"}
            </span>
          </div>
          <div className="table-cell">{getDoctorInfo(appointment.medecin_Nom_Speciality, 0)}</div>
          <div className="table-cell">{appointment.reservation_Date}</div>
          <div className="table-cell">
            <span className={`status-badge ${
              getStatusColor(
                appointment.reservation_Etat === 0
                  ? 'pending'
                  : appointment.reservation_Etat === 1
                  ? 'confirmed'
                  : 'cancelled'
              )
            }`}>
              {appointment.reservation_Etat === 0
                ? 'en attente'
                : appointment.reservation_Etat === 1
                ? 'confirmé'
                : 'annulé'}
            </span>
          </div>
          <div className="table-cell">
            <button className="view-actions-btn" onClick={() => handleViewActions(appointment)}>
              afficher les actions
            </button>
          </div>
        </div>
      );
}

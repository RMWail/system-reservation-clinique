import { FixedSizeList as List } from "react-window";
import { AppointmentRow } from "./AppointmentsRow";

export const AppointmentsTable = ({
  appointments,
  selectFilter,
  filterByDate,
  searchQuery,
  handleViewActions,
  selectedAppointment,
  tableHeads,
}) => {


  const filteredAppointments = appointments.filter(
    (appointment) =>
      (selectFilter === "" ||
        appointment.reservation_Etat === Number(selectFilter)) &&
      (filterByDate === "" ||
        appointment.reservation_Date === filterByDate) &&
      (searchQuery === "" ||
        appointment.reservation_Id.toString().includes(searchQuery) ||
        appointment.patient_Telephone
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        appointment.patient_NomPrenom
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="appointments-table">
      {selectedAppointment && <div className="table-overlay" />}

      <div className="virtual-table">
        {/* Table header */}
        <div className="table-row table-head">
          {tableHeads.map((head, index) => (
            <div className="table-cell" key={index}>
              {head}
            </div>
          ))}
        </div>

        {/* Virtualized list */}
        {filteredAppointments.length > 0 ? (
          <List
            height={752}
            itemCount={filteredAppointments.length}
            itemSize={50}
            width="100%"
          >
            {({ index, style }) => (
              <AppointmentRow
                appointment={filteredAppointments[index]}
                index={index}
                style={style}
                handleViewActions={handleViewActions}
              />
            )}
          </List>
        ) : (
          <div className="no-appointments">
            <h2 style={{ color: "#2196F3" }}>Pas encore de rendez-vous</h2>
          </div>
        )}
      </div>
    </div>
  );
};

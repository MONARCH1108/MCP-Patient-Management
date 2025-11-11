function PatientCard({ patient }) {
  return (
    <div className="patient-card">
      <div className="patient-header">
        <h3>{patient.firstName} {patient.lastName}</h3>
        <span className="patient-id">{patient.id}</span>
      </div>
      
      <div className="patient-info">
        <div className="info-row">
          <span className="info-label">📅 DOB:</span>
          <span>{patient.dateOfBirth}</span>
        </div>
        <div className="info-row">
          <span className="info-label">⚧️ Gender:</span>
          <span>{patient.gender}</span>
        </div>
        <div className="info-row">
          <span className="info-label">🩸 Blood Type:</span>
          <span className="blood-type">{patient.bloodType}</span>
        </div>
        <div className="info-row">
          <span className="info-label">📧 Email:</span>
          <span>{patient.email}</span>
        </div>
        <div className="info-row">
          <span className="info-label">📞 Phone:</span>
          <span>{patient.phone}</span>
        </div>
        <div className="info-row">
          <span className="info-label">📍 Address:</span>
          <span>{patient.address.street}, {patient.address.city}, {patient.address.state} {patient.address.zipCode}</span>
        </div>
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="info-row">
            <span className="info-label">⚠️ Allergies:</span>
            <span className="allergies">
              {patient.allergies.join(', ')}
            </span>
          </div>
        )}
        {patient.medicalHistory && patient.medicalHistory.length > 0 && (
          <div className="info-row">
            <span className="info-label">🏥 Medical History:</span>
            <span>{patient.medicalHistory.join(', ')}</span>
          </div>
        )}
        {patient.lastVisit && (
          <div className="info-row">
            <span className="info-label">🕐 Last Visit:</span>
            <span>{patient.lastVisit}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientCard;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { getMyAppointments, createVideoRoom } from '../services/appointmentService';
import './MyAppointments.css';

const MyAppointments = () => {
  const navigate = useNavigate();
  const { state } = useChat();
  const token = state.user?.token; // Get token from context
 const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingRoom, setCreatingRoom] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await getMyAppointments('upcoming', token);
      setAppointments(response);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setLoading(false);
    }
 };

  const handleStartVideoCall = async (appointmentId) => {
    setCreatingRoom(appointmentId);

    try {
      console.log('Creating video room for appointment:', appointmentId);
      
      // Create video room
      const response = await createVideoRoom(appointmentId, token);
      const { room_id } = response.data;
      
      console.log('Video room created:', room_id);
      
      // Navigate to video room
      navigate(`/room/${room_id}`);
      
    } catch (error) {
      console.error('Failed to start video call:', error);
      alert('Failed to start video call. Please try again.');
      setCreatingRoom(null);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="appointments-loading">
        <div className="spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="appointments-empty">
        <h3>No Upcoming Appointments</h3>
        <p>You don't have any scheduled appointments.</p>
        <button onClick={() => navigate('/book-appointment')}>
          Book New Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="my-appointments-page">
      <h2>My Appointments</h2>
      
      <div className="appointments-list">
        {appointments.map(appointment => (
          <div key={appointment.appointment_id} className="appointment-card">
            <div className="appointment-header">
              <h3>{appointment.professional_name}</h3>
              <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                {appointment.status}
              </span>
            </div>

            <div className="appointment-details">
              <p className="specialty">{appointment.specialty}</p>
              <p className="time">
                <span className="icon">🕒</span>
                {formatDateTime(appointment.appointment_time)}
              </p>
              <p className="type">
                <span className="icon">📹</span>
                {appointment.appointment_type}
              </p>
            </div>

            {appointment.status === 'Scheduled' && (
              <button
                className="video-call-btn"
                onClick={() => handleStartVideoCall(appointment.appointment_id)}
                disabled={creatingRoom === appointment.appointment_id}
              >
                {creatingRoom === appointment.appointment_id ? (
                  <>
                    <span className="spinner-small"></span>
                    Starting...
                  </>
                ) : (
                  <>
                    <span className="icon">📹</span>
                    Start Video Call
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      <button 
        className="book-new-btn"
        onClick={() => navigate('/book-appointment')}
      >
        + Book New Appointment
      </button>
    </div>
  );
};

export default MyAppointments;
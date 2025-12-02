import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Books an appointment using a slot ID
 * CRITICAL: Must include slotId in request body
 */
export const bookAppointment = async (slotId, patientNotes = '', durationMinutes = 30, token) => {
  // If token is not provided, try to get it from localStorage
  const authToken = token || localStorage.getItem('authToken');
  
  if (!authToken) {
    throw new Error('Authentication token is required to book an appointment');
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/api/appointments`,
      {
        slotId: slotId, // REQUIRED!
        patientNotes: patientNotes,
        durationMinutes: durationMinutes
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to book appointment:', error);
    throw error;
 }
};

/**
 * Gets user's appointments
 */
export const getMyAppointments = async (status = 'upcoming', token) => {
  // If token is not provided, try to get it from localStorage
  const authToken = token || localStorage.getItem('authToken');
  
  if (!authToken) {
    throw new Error('Authentication token is required to fetch appointments');
  }
  
  try {
    const response = await axios.get(
      `${API_URL}/api/appointments/me`,
      {
        params: { status },
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    throw error;
 }
};

/**
 * Creates a video room for an appointment
 */
export const createVideoRoom = async (appointmentId, token) => {
  // If token is not provided, try to get it from localStorage
  const authToken = token || localStorage.getItem('authToken');
  
  if (!authToken) {
    throw new Error('Authentication token is required to create a video room');
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/api/signaling/room`,
      {
        appointment_id: appointmentId
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to create video room:', error);
    throw error;
 }
};

/**
 * Gets the latest appointment for a doctor to join
 */
export const getLatestAppointmentForDoctor = async (doctorId, token) => {
  // If token is not provided, try to get it from localStorage
  const authToken = token || localStorage.getItem('authToken');
  
  if (!authToken) {
    throw new Error('Authentication token is required to fetch appointments');
  }
  
  try {
    // Get upcoming appointments for the doctor
    const response = await axios.get(
      `${API_URL}/api/appointments/me`,
      {
        params: { status: 'upcoming' },
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    if (response.data && Array.isArray(response.data)) {
      // Filter appointments where the doctor is the professional
      const doctorAppointments = response.data.filter(appointment => 
        appointment.professional_id === doctorId
      );
      
      // Sort by appointment time (most recent first)
      doctorAppointments.sort((a, b) => 
        new Date(b.appointment_time) - new Date(a.appointment_time)
      );
      
      // Return the most recent appointment
      return doctorAppointments[0] || null;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch latest appointment for doctor:', error);
    throw error;
 }
};

/**
 * Initiates a video consultation by creating an appointment and video room for patients
 */
export const initiateVideoConsultationForPatient = async (patientId, doctorId, token) => {
  try {
    // First, we need to find available slots for the doctor
    // In a real implementation, we might want to select a specific slot
    // For this implementation, we'll create an appointment with a default slot or immediate booking
    
    // For now, let's try to book an immediate appointment
    // We need to find an available slot for the doctor
    const doctorProfileResponse = await axios.get(
      `${API_URL}/api/professionals/${doctorId}/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    // Find the first available slot
    let availableSlot = doctorProfileResponse.data.data.doctor.availability.find(
      slot => !slot.is_booked
    );
    
    // If no available slots found, find the nearest available slot automatically
    if (!availableSlot) {
      // Get all available slots and sort by start time to find the nearest
      const allAvailableSlots = doctorProfileResponse.data.data.doctor.availability.filter(
        slot => !slot.is_booked
      );
      
      if (allAvailableSlots.length > 0) {
        // Sort by start time to get the nearest slot
        availableSlot = allAvailableSlots.sort((a, b) =>
          new Date(a.start_time) - new Date(b.start_time)
        )[0];
      } else {
        throw new Error('No slots are currently available for booking. Please try again later or contact support.');
      }
    }
    
    // Book the appointment using the available slot
    const appointmentResponse = await axios.post(
      `${API_URL}/api/appointments`,
      {
        slotId: availableSlot.slot_id,
        patientNotes: 'Automatically booked video consultation',
        durationMinutes: 30
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const appointmentId = appointmentResponse.data.appointmentId;
    
    // Create a video room for the appointment
    const roomResponse = await axios.post(
      `${API_URL}/api/signaling/room`,
      {
        appointment_id: appointmentId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      appointmentId: appointmentId,
      roomId: roomResponse.data.data.room_id
    };
  } catch (error) {
    console.error('Failed to initiate video consultation for patient:', error);
    // Re-throw the error with a more user-friendly message if needed
    if (error.message && error.message.includes('No available slots')) {
      // This should not happen now since we handle it automatically,
      // but if it does, provide a clear message
      throw new Error('No available slots for this doctor. The system will automatically find the nearest available time slot.');
    } else {
      throw error;
    }
 }
};

/**
 * Initiates a video consultation by joining an existing appointment for doctors
 */
export const initiateVideoConsultationForDoctor = async (doctorId, token) => {
  try {
    // Get the latest appointment for the doctor
    const appointment = await getLatestAppointmentForDoctor(doctorId, token);
    
    if (!appointment) {
      throw new Error('No upcoming appointments found for this doctor. Please check your appointment schedule.');
    }
    
    // Create a video room for the existing appointment
    const roomResponse = await createVideoRoom(appointment.appointment_id, token);
    
    // Handle different response structures depending on the API response
    let roomId;
    if (roomResponse.data && roomResponse.data.data && roomResponse.data.data.room_id) {
      // If response follows the expected structure: { data: { room_id: ... } }
      roomId = roomResponse.data.data.room_id;
    } else if (roomResponse.data && roomResponse.data.data && roomResponse.data.data.roomId) {
      // If response follows: { data: { roomId: ... } }
      roomId = roomResponse.data.data.roomId;
    } else if (roomResponse.data && roomResponse.data.room_id) {
      // If response follows: { data: { room_id: ... } }
      roomId = roomResponse.data.room_id;
    } else if (roomResponse.data && roomResponse.data.roomId) {
      // If response follows: { roomId: ... }
      roomId = roomResponse.data.roomId;
    } else {
      // If none of the expected structures match, try to find the room ID in the response
      console.warn('Unexpected response structure from createVideoRoom:', roomResponse);
      // Look for room_id or roomId in the response object
      if (roomResponse.data && typeof roomResponse.data === 'object') {
        const keys = Object.keys(roomResponse.data);
        for (const key of keys) {
          if (typeof roomResponse.data[key] === 'object' && roomResponse.data[key].room_id) {
            roomId = roomResponse.data[key].room_id;
            break;
          } else if (typeof roomResponse.data[key] === 'object' && roomResponse.data[key].roomId) {
            roomId = roomResponse.data[key].roomId;
            break;
          }
        }
      }
    }
    
    if (!roomId) {
      throw new Error('Could not extract room ID from server response');
    }
    
    return {
      appointmentId: appointment.appointment_id,
      roomId: roomId
    };
  } catch (error) {
    console.error('Failed to initiate video consultation for doctor:', error);
    throw error;
 }
};

export default {
  bookAppointment,
  getMyAppointments,
  createVideoRoom,
  initiateVideoConsultationForPatient,
  initiateVideoConsultationForDoctor
};
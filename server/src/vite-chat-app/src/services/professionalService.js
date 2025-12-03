import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches doctor profile with available time slots
 */
export const getDoctorProfile = async (doctorId, token) => {
  // If token is not provided, try to get it from localStorage
  const authToken = token || localStorage.getItem('authToken');
  
  if (!authToken) {
    throw new Error('Authentication token is required to fetch doctor profile');
  }
  
  try {
    const response = await axios.get(
      `${API_URL}/api/professionals/${doctorId}/profile`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch doctor profile:', error);
    throw error;
 }
};

export default {
  getDoctorProfile
};
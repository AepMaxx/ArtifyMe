import { jwtDecode } from "jwt-decode";

export const storeToken = (value: string) => {
  try {
    localStorage.setItem('token', value);
    console.log('Token saved successfully');
  } catch (e) {
    alert("Failed to Store Login Credentials");
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem('token');
    console.log('Token removed successfully');
  } catch (e) {
    console.error('Error removing token:', e);
  }
};

export const getToken = (): string | null => {
  try {
    const value = localStorage.getItem('token');
    if (value !== null) {
      console.log("Token Found in Storage");
      return value;
    } else {
      console.log("No Token Found in Storage");
      return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
};

// Check if the token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token) as any;


    if (!decoded.exp) return false; 

    //decoded time comes in seconds , make sure both are in seconds format
    let current_time = Math.floor(Date.now() / 1000); // Current time in seconds
    if (current_time >= decoded.exp) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

// Get the subject from the token
export const getTokenSubject = (token: string): string => {
  try {
    const decoded = jwtDecode(token) as any;
    return decoded.unique_name || ''; // Return the subject or empty string if not found
  } catch (e) {
    console.error("Error decoding token:", e);
    return '';
  }
};

export const authenticate = async (): Promise<boolean> => {
  //Get Token from localStorage
  const token = getToken();

  if (!token) {
    //If there is no token user is not logged in
    return false;
  } else {
    //If there is a token, ensure it is not expired or else user is not authenticated
    if (isTokenExpired(token)) {
      return false;
    } else {
      //If token is not expired, make a request to a protected api route to get user details
      const decoded = jwtDecode(token) as any;
      
      if (decoded) {
        return true;
      } else {
        return false;
      }
    }
  }
};

export const calculateTimeAgo = (timestamp: string): string => {
  const eventDate = new Date(timestamp); // Parse the timestamp directly
  const currentDate = new Date(); // Get the current date/time

  const timeDifference = currentDate.getTime() - eventDate.getTime();
  const minutes = Math.floor(timeDifference / 60000); // 1 minute = 60,000 milliseconds
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export const getImageData = async (filename: string): Promise<string | null> => {
  const apiUrl = process.env.REACT_APP_DOTNET_API_URL || 'http://localhost:5000';

  const token = getToken();

  if (!token || isTokenExpired(token)) {
    alert("Login Credentials invalid/expired, login again to accept images");
    return null;
  }

  const getImageUrl = `${apiUrl}/api/s3/get?key=${encodeURIComponent(filename)}`;

  try {
    const imgresponse = await fetch(getImageUrl, {
      headers: {
        // Authorization: `Bearer ${token}`
      }
    });

    if (!imgresponse.ok) {
      throw new Error('Failed to retrieve image from server');
    }

    const data = await imgresponse.json();
    const { base64ImageData, contentType } = data; 
    console.log("Got image uri");
    const uri = `data:${contentType};base64,${base64ImageData}`;
    return uri;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

export const getEmail = async (): Promise<string | null> => {
  const token = getToken();
  if (!token || isTokenExpired(token)) {
    return null;
  }
  return getTokenSubject(token);
};

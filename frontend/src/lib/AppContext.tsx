import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { authenticate } from './utils';

// Define the types for the context
type AppContextProps = {
  // Theme management
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;

  // Drawing paths state
  paths: { path: string[], color: string, size: number }[];
  setPaths: React.Dispatch<React.SetStateAction<{ path: string[], color: string, size: number }[]>>;

  // Authentication state
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  authenticated: boolean;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  authLoading: boolean;

  // Screen state management
  screen: boolean;
  setScreen: React.Dispatch<React.SetStateAction<boolean>>;

  // Artwork management
  newArtwork: boolean;
  setNewArtwork: React.Dispatch<React.SetStateAction<boolean>>;
  deleted: boolean;
  setDeleted: React.Dispatch<React.SetStateAction<boolean>>;
  updateArtwork: boolean;
  setUpdateArtwork: React.Dispatch<React.SetStateAction<boolean>>;

  // Path changes tracking
  pathsChanged: boolean;
  setPathsChanged: React.Dispatch<React.SetStateAction<boolean>>;
};

// Create the AppContext with an initial value of undefined
const AppContext = createContext<AppContextProps | undefined>(undefined);

// Create the AppProvider component that will wrap your application
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize the state using the useState hook

  // Theme management - detect system theme
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Save the state of the drawing
  const [paths, setPaths] = useState<{ path: string[], color: string, size: number }[]>([]);

  // JWT Token
  const [token, setToken] = useState<string | null>(null);

  // If User Is Authenticated
  const [authenticated, setAuthenticated] = useState(false);
  
  // Authentication loading state
  const [authLoading, setAuthLoading] = useState(true);

  // Marker if a screen changes
  const [screen, setScreen] = useState(false);

  // Marker for when a new artwork is made
  const [newArtwork, setNewArtwork] = useState(false);

  // Marker for when an artwork is deleted
  const [deleted, setDeleted] = useState(false);

  // Marker if init paths have been changed when editing, to decide whether to generate new image
  const [pathsChanged, setPathsChanged] = useState(false);

  // Marker for when an artwork is updated
  const [updateArtwork, setUpdateArtwork] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Provide the context value to the children components
  const contextValue: AppContextProps = {
    setTheme, theme,
    paths, setPaths,
    token, setToken,
    authenticated, setAuthenticated,
    screen, setScreen,
    newArtwork, setNewArtwork,
    deleted, setDeleted, 
    pathsChanged, setPathsChanged,
    updateArtwork, setUpdateArtwork,
    authLoading
  };

  useEffect(() => {
    console.log('AppContext: Starting authentication check');
    const startUpAuthenticate = async () => {
      try {
        const authResult = await authenticate();
        console.log('AppContext: Authentication result:', authResult);
        setAuthenticated(authResult);
      } finally {
        setAuthLoading(false);
      }
    }
    startUpAuthenticate();
  }, []); // Remove screen dependency to prevent infinite loop

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// Create a custom hook (useAppContext) to easily access the context
export const useAppContext = () => {
  // Use the useContext hook to access the AppContext
  const context = useContext(AppContext);

  // Throw an error if the hook is not used within an AppProvider
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  // Return the context value
  return context;
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthContextProvider } from './context/AuthContext.jsx';
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom';

// Create a wrapper component that provides navigate
const AuthProviderWithNavigate = ({ children }) => {
    const navigate = useNavigate();
    return (
        <AuthContextProvider navigate={navigate}>
            {children}
        </AuthContextProvider>
    );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProviderWithNavigate>
        <App />
      </AuthProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>,
)
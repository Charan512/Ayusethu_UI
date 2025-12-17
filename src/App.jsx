import React from 'react'
import { Routes, Route,Navigate } from "react-router-dom"; // REMOVED BrowserRouter from import

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Labtest from"./pages/Labtest.jsx";
import Collector from"./pages/Collector.jsx";
import Admin from "./pages/Admin.jsx"
import Manufacturer from "./pages/Manufacturer.jsx";
import Consumer from "./pages/Consumer.jsx"; 

function App() {
  return (
      // In App.jsx
<Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />  
  <Route path="/admin" element={<Admin/>} />  
  <Route path="/collector" element={<Collector/>} />
  <Route path="/labtest" element={<Labtest/>}/> 
  <Route path="/manufacturer" element={<Manufacturer/>}/>
  <Route path="/consumer/:productUnitId" element={<Consumer/>} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
  );
}

export default App;
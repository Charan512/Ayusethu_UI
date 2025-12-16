import React from 'react'
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Labtest from"./pages/Labtest.jsx";
import Collector from"./pages/Collector.jsx";
import Admin from "./pages/Admin.jsx"
import Manufacturer from "./pages/Manufacturer.jsx";
import Consumer from "./pages/Consumer.jsx"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/Login" element={<Login />} />
        
        <Route path="/consumer/:productUnitId" element={<Consumer/>} />
        
        {/* AUTHENTICATED ROUTES */}
        <Route path="/Labtest" element={<Labtest/>}/> 
        <Route path="/Manufacturer" element ={<Manufacturer/>}/>
        <Route path="/Collector" element={<Collector/>}/>
        <Route path="/Admin" element={<Admin/>}/>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
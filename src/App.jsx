import React from 'react'
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Labtest from"./pages/Labtest.jsx";
import Farmerdashboard from"./pages/Farmerdashboard.jsx";
import Collector from"./pages/Collector.jsx";
import Admin from "./pages/Admin.jsx"
import User from "./pages/User.jsx";
import Manufacturer from "./pages/Manufacturer.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Labtest" element={<Labtest/>}/> 
        <Route path="/Farmerdashboard" element={<Farmerdashboard/>}/>
        <Route path="/Manufacturer" element ={<Manufacturer/>}/>
        <Route path="/Collector" element={<Collector/>}/>
        <Route path="/Admin" element={<Admin/>}/>
        <Route path="/User" element={<User/>}/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

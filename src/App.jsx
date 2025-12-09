import React from 'react'
import { BrowserRouter, Routes, Route,Navigate } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Labtest from"./pages/Labtest.jsx";
import Collector from"./pages/Collector.jsx";
import Admin from "./pages/Admin.jsx"
import User from "./pages/User.jsx";
import Manufacturer from "./pages/Manufacturer.jsx";
// import Farmer from "./pages/Farmer.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Labtest" element={<Labtest/>}/> 
        <Route path="/Manufacturer" element ={<Manufacturer/>}/>
        <Route path="/Collector" element={<Collector/>}/>
        <Route path="/Admin" element={<Admin/>}/>
        <Route path="/User" element={<User/>}/>
        {/* <Route path="/Farmer" element={<Farmer/>}/> */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

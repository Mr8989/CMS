import React from "react";
import Navbar from "./components/Navbar";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home"
import Signup from "./Pages/Signup"
import Login from "./Pages/Login"
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="min-h-screen w-full text-white bg-gray-400">
      <div className="relative z-20 pt-10">
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/Signup" element={<Signup/>}/>
          <Route path="/Login" element={<Login/>}/>
        </Routes>
        <Toaster/>
      </div>
    
    </div>
  );
}

export default App;

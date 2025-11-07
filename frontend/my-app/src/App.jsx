import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Pages/Home"
import Signup from "./Pages/Signup"
import Login from "./Pages/Login"
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/authStore";
import Report from "../src/components/Report"
import Members from "./components/Members";
import AddMember from "./components/AddMember";
import ImportMembers from "./components/ImportMembers";

function App() {
  const {user,checkAuthStatus} = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus])



  return (
    <div className="min-h-screen w-full text-white  overflow-hidden">
      <div className="relative z-50 pt-20">
        <Navbar/>
        <Routes>
          <Route path="/" element={!user ? <Login/> : <Home/>}/>
          <Route path="/Signup" element={!user ? <Signup/> : <Navigate to={"/"}/>}/>
          <Route path="/Login" element={!user ? <Login/> : <Navigate to={"/"}/>}/>
          <Route path="/report" element={!user ? <Signup/> : <Report/>}/>
          <Route path="/members" element={!user ? <Login/> : <Members/>}/>
          <Route path="/members/add" element={!user ? <Login/> : <AddMember/>}/>
          <Route path="/members/import" element={!user ? <Login/> : <ImportMembers/>}/>
        </Routes>
        <Toaster/>
      </div>
    
    </div>
  );
}

export default App;

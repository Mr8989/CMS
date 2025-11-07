import React from 'react'
import { useAuthStore } from '../stores/authStore'
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Upload, Users } from 'lucide-react';

function Navbar() {
  const {user, logout} = useAuthStore();
    const navigate = useNavigate();

  const handleLogout = (e) => {
    logout();
    navigate("/")
  }
  return (
    <div>
      <header className="fixed top-0 left-0 w-full bg-gray-900 opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-gray-400">
        <div className="container mx-auto px-4 py-5"></div>
        <div className="flex flex-wrap justify-between items-center">
          <nav className="flex flex-wrap items-center gap-4">
            {user && (
              <Link
                className="bg-gray-400 hover:bg-white text-black px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out
          flex items-center"
                to={"/"}
              >
                <Upload className="inline-block mr-1" size={18} />
                <span className="hidden sm:inline text-black">
                  Upload Attendance
                </span>
              </Link>
            )}
            {user && (
              <Link
                to={"/report"}
                className="bg-gray-400 hover:bg-white text-black px-3 py-1 rounded-md font-medium transition duration-300
          ease-in-out flex items-center"
              >
                <span>View Report</span>
              </Link>
            )}
            {user && (
              <Link
              to={"/members"}
              className='bg-gray-400 hover:bg-white text-black px-3 py-1 rounded-md font-medium transition duration-300
              ease-in-out flex items-center'
              >
                <Users className='inline-block w-5 h-5'/>
              Members
              </Link>
            )}
          </nav>
          {user && 
          <button
          type='submit'
          onClick={handleLogout}
          className='flex border-2 rounded-md text-black bg-gray-400 text-center font-medium  py-1 px-2 mr-3 hover:bg-white'
          >
            <LogOut/>
          Logout
          </button>
          }
        </div>
      </header>
    </div>
  );
}

export default Navbar

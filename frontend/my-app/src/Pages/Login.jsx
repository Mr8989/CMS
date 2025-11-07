import React, { useState } from 'react'
import { motion, sync } from 'framer-motion'
import { Mail, Lock, Loader, UserPlus, Eye, EyeOff} from 'lucide-react'
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

function Login() {
const [email, setEmail] = useState();
const [password, setPassword] = useState()
const [showPassword, setShowPassword] = useState(false)

const {login, loading} = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(
      email,
      password
    )
    console.log(result, "Login successfully")
  }
  return (
    <div className="flex flex-col justify-center items-center mt-20 py-12 sm:px-6 lg:px-8 w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="text-4xl text-black flex text-center items-center justify-center mt-6">
          Login here
        </h1>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-gray-800 items-center justify-center py-10 px-4 shadow sm:rounded-lg h-full sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-14">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-400"
              >
                Email
              </label>
              <div className="relative mt-1 rounded-md shadow-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex flex-col space-x-2 w-full">
                  <Mail
                    className=" absolute w-5 h-5 left-8 text-gray-400 mt-2"
                    aria-hidden="true"
                  />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="block w-full px-5 pl-10 py-2 border border-gray-100 rounded-md shadow-sm
                   placeholder-gray-400 focus:outline-none text-sm "
                  />
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="flex mt-12 text-sm font-medium text-gray-400"
              >
                Password
              </label>
              <div className="relative mt-1 rounded-md shadow-md">
                <div className="absolute left-0 inset-y-0 pl-3 flex flex-col space-x-2 w-full">
                  <Lock className="w-5 h-5 absolute left-8 text-gray-400 mt-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="block w-full px-5 pl-10 py-2 border border-gray-100 rounded-md shadow-sm placeholder-gray-400
                  text-sm"
                  />
                  <button 
                  type="button" 
                  value={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-5 h-5 absolute right-2 mt-2 text-gray-400">
                    {showPassword ? <Eye /> : <EyeOff />}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="flex w-full border border-transparent rounded-md p-2 shadow-md bg-gray-400 justify-center
            font-medium hover:bg-gray-700 transition duration-150 ease-in-out disabled:opacity-50 text-center"
            >
              {loading ? (
                <>
                  <Loader
                    className="mr-5 w-5 h-5 animate-bounce"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <>
                  <UserPlus className="mr-5 w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>
          <div className="flex mt-5 justify-center">
            <p className="text-center gap-3">Don't have an account ?</p>
            <Link
              to={"/signup"}
              className="font-medium text-white hover:text-gray-400"
            >
              Signup here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login

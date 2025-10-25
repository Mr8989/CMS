import React, { useState } from 'react'
import {motion} from 'framer-motion'
import {Mail, User, Lock, Loader, UserPlus, EyeOff, Eye} from "lucide-react"
import { Link } from 'react-router-dom'
import {useAuthStore} from '../stores/authStore'

function Signup() {

  const [formData, setFormData] = useState({
    username:"",
    email:"",
    password: "",
    confirmPassword: ""
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {signup, loading} = useAuthStore()

  const handleSubmit =  async(e) => {
    if(formData.password !== formData.confirmPassword){
      console.log("Password do not match")
    }

    e.preventDefault();
    const result = await signup(
      formData.username,
      formData.email,
      formData.password,
      formData.confirmPassword
    )
    console.log(result, "signup successfully")
  }


  return (
    <div className='flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8  mt-20'>
    <motion.div
    className='sm:mx-auto sm:w-full sm:max-w-md'
    initial={{opacity:0, y: -20}}
    animate={{opacity:1, y:0}}
    transition={{duration:0.8, delay:0.2}}
    >
      <h1 className='flex text-4xl text-center mx-11 text-black'>Sign up here</h1>
    </motion.div>
        <motion.div
        className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
        initial={{opacity:0, y:-20}}
        animate={{opacity:1, y: 0}}
        transition={{duration:0.8, delay: 0.2}}
        >
      <div className='bg-gray-800 py-10 px-4 shadow sm:rounded-lg sm:px-10 h-full'>
        <form onSubmit={handleSubmit} className='space-y-14'>
          <div>
            <label
            htmlFor='name'
            className='text-sm font-medium block'
            >
              Enter name
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center w-full flex-col space-x-2'>
              <User 
              className='absolute h-5 w-5 left-8 text-gray-400 mt-2'
              aria-hidden="true"
              />
          <input 
           type="text" 
           id="name" 
           placeholder='Enter username' 
           value={formData.username}
           onChange={(e)=> setFormData({...formData, username: e.target.value})
           }
           className='block w-full px-3 pl-10 py-2 border border-gray-100 rounded-md shadow-sm
           placeholder-gray-400 focus-outline-none sm:text-sm'
           />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="email"
            className='block text-sm font-medium mt-12'
            >
              Enter email
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center w-full flex-col space-x-2'>
              <Mail
              className='absolute h-5 w-5 left-8 mt-2 text-gray-400'
              aria-hidden="true"
              />
              <input 
              type="text" 
              id="email"  
              placeholder='Enter email'
              value={formData.email}
              onChange={e => setFormData({...formData, email:e.target.value})}
              className='block w-full px-2 pl-12 py-2 border border-gray-100 rounded-md shaado-sm
              placeholder-gray-400 sm:text-sm'
              />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="name"
            className='block mt-12 font-medium text-sm'
            >
              Enter password
            </label>
            <div className='mt-1 relative rounded-md shadow-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center w-full flex-col space-x-2'>
                <Lock
                className='absolute h-5 w-5 left-8 text-gray-400 mt-2'
                aria-hidden="true"
                />
                <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute h-5 w-5 right-2 text-gray-400 mt-2'
                >
                  {showPassword ? <EyeOff/> : <Eye/>}
                </button>
                <input
                 type={showPassword ? "text" : "password"}
                 id="password" 
                 value={formData.password}
                 onChange={e => setFormData({...formData, password: e.target.value})}
                 placeholder='Enter password'
                 className='block w-full px-3 py-2 pl-10 border border-gray-100 rounded-md shadow-sm sm:text-sm'
                   />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="name" className='block mt-12 font-medium text-sm'>
              Confirm password
            </label>
            <div className='relative mt-1 rounded-md shadow-sm'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center w-full flex-col  space-x-2'>
              <Lock
              className='block h-5 w-5 left-8 mt-2 text-gray-400 absolute'
              />
              <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute h-5 w-5 right-2 mt-2 text-gray-400'>
                {showConfirmPassword ? <EyeOff/> : <Eye/>}
              </button>
              <input 
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword" 
              placeholder='Confirm password'
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword:e.target.value})}
              className='block w-full px-3 py-2 pl-10 border border-gray-100 rounded-md text-sm font-medium'
              />
            </div>
            </div>
          </div>
          <button
          type='submit'
          className='flex w-full mt-15 py-2 px-4 justify-center border border-transparent rounded-md shadow-sm text-white
          font-medium bg-gray-400 hover:bg-gray-700 transition duration-150 ease-in-out disabled:opacity-50 text-center'
          disabled={loading}
          >
            {loading ? (
              <>
              <Loader className='mr-5 h-5 w-5 animate-bounce' 
              aria-hidden='true'
              />
              Loading...
              </>
            ): (
              <>
              <UserPlus className='mr-5 h-5 w-5' aria-hidden='true'/>
              Sign Up
              </>
            )}
          </button>
        </form>
        <p className='mt-8 text-center gap-3'>
          Already have an account?
          <Link 
          to={"/login"}
          className='font-medium text-white hover:text-gray-400'
          >
          Login here
          </Link>
        </p>
      </div>
        </motion.div>
    </div>
  )
}

export default Signup

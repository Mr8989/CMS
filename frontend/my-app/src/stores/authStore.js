import {create} from 'zustand'
import {toast} from 'react-hot-toast'
import { axiosInstance } from '../lib/axios'

export const useAuthStore = create((set) => ({
    user:null,
    loading: false,
    token: null,
    checkingAuth: true,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refresToken') || null,

    signup: async (username, email, password, confirmPassword) => {
        set({loading: true})
        if(password !== confirmPassword){
            set({loading: false})
            return toast.error("Password do not match")
        }

        try {
            const res = await axiosInstance.post("api/auth/register/", {
                username,
                email,
                password,
                confirmPassword
            })

            //store tokens
            localStorage.setItem('accessToken',  res.data.tokens.access)
            localStorage.setItem('refreshToken', res.data.tokens.refresh)

            //update token
            if(res.data.user){
                set({
                    user: res.data.user,
                    accessToken: res.data.tokens.access,
                    refreshToken: res.data.tokens.refresh,
                    loading: false
                })
            } else{
                console.log("Backend did not return tokens", res.data)
            }
            toast.success('Account created successfully');
            return res.data
        } catch (error) {
            set({loading: false});
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed';
            console.log(errorMessage)
            toast.error(errorMessage)
            throw error;
        }
    }
}))
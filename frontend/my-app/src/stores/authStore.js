import {create} from 'zustand'
import {toast} from 'react-hot-toast'
import {jwtDecode} from "jwt-decode"
import { axiosInstance } from '../lib/axios'

export const useAuthStore = create((set, get) => ({
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
        },
    
    
        login: async (email, password) => {
            set({loading: true})
            try {
            console.log("Attemting login with : ", email)
                const res = await axiosInstance.post("api/auth/login/", {
                    email,
                    password
                });
    
                console.log("Login response: ", res.data)
                const {user, tokens} = res.data;
               
                // Store tokens - check if response has tokens or direct access/refresh
                localStorage.setItem('accessToken', res.data.tokens.access);
                localStorage.setItem('refreshToken', res.data.tokens.refresh)
    
                console.log('💾 Tokens saved to localStorage');
    
    
                set({
                    user,
                    accessToken: tokens.access,
                    refreshToken: tokens.refresh,
                    loading: false
                });
    
                console.log("My accesstoken is ",access)
                await get().getCurrentUser();
    
                toast.success('logged in successfully')
                return res.data;
            } catch (error) {
                set({loading: false})
                console.log("Error at login server", error.message)
                console.log("Sending login data", { email, password })
                toast.error(error.message || "Login failed")
            }
        },
    
        // Get current user
    
    // fetch current user (expects Authorization header provided by caller)
    getCurrentUser: async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) throw new Error("No access token for getCurrentUser");
            
            const res = await axiosInstance.get("api/auth/me/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            set({ user: res.data });
            return res.data;
        } catch (err) {
            console.error("getCurrentUser error:", err.response?.data || err.message);
            throw err;
        }
    },

    
        // check authentication status

    checkAuthStatus: async () => {
        set({ checkingAuth: true });
        try {
            const accessToken = localStorage.getItem("accessToken");
            const refreshToken = localStorage.getItem("refreshToken");

            if (!accessToken || !refreshToken) {
                console.log("checkAuthStatus: no tokens found");
                set({ user: null, checkingAuth: false, accessToken: null, refreshToken: null });
                return;
            }

            // try decode to check expiry locally (avoid unnecessary verify call)
            let isExpired = false;
            try {
                const decoded = jwtDecode(accessToken);
                isExpired = decoded.exp * 1000 < Date.now();
            } catch (e) {
                console.warn("checkAuthStatus: failed to decode access token, will verify/refresh", e.message);
                isExpired = true;
            }

            if (!isExpired) {
                // token appears valid — get user
                try {
                    await get().getCurrentUser();
                    set({ accessToken, refreshToken, checkingAuth: false });
                    console.log("checkAuthStatus: access token valid, user loaded");
                    return;
                } catch (err) {
                    console.warn("checkAuthStatus: getCurrentUser failed with valid token, will try refresh", err.message);
                    // fall through to refresh attempt
                }
            }

            // access token expired or getCurrentUser failed — try refresh
            try {
                console.log("checkAuthStatus: refreshing token...");
                const refreshRes = await axiosInstance.post("api/auth/token/refresh/", { refresh: refreshToken });
                const newAccess = refreshRes.data.access;
                if (!newAccess) throw new Error("No access token in refresh response");
                localStorage.setItem("accessToken", newAccess);
                set({ accessToken: newAccess });

                // now load user with refreshed token
                await get().getCurrentUser();
                set({ checkingAuth: false });
                console.log("checkAuthStatus: refresh succeeded and user loaded");
                return;
            } catch (refreshErr) {
                console.warn("checkAuthStatus: refresh failed:", refreshErr.response?.data || refreshErr.message);
                // cleanup tokens and user
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                set({ user: null, accessToken: null, refreshToken: null, checkingAuth: false });
                return;
            }
        } catch (err) {
            console.error("checkAuthStatus: unexpected error:", err);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            set({ user: null, accessToken: null, refreshToken: null, checkingAuth: false });
        }
    },

    // quick helpers used elsewhere
    setTokensAndUser: (tokens, user) => {
        if (tokens?.access) localStorage.setItem("accessToken", tokens.access);
        if (tokens?.refresh) localStorage.setItem("refreshToken", tokens.refresh);
        set({ accessToken: tokens?.access || null, refreshToken: tokens?.refresh || null, user: user || null });
    },

        // Refresh access token
        refreshAccessToken: async () => {
            const refreshToken = get().refreshToken;
    
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }
    
            try {
                const res = await axiosInstance.post("/auth/token/refresh/", {
                    refresh: refreshToken
                });
    
                localStorage.setItem('accessToken', res.data.access);
                set({ accessToken: res.data.access });
    
                return res.data.access;
            } catch (error) {
                // Refresh failed, logout
                get().logout();
                throw error;
            }
        } ,

         // Logout
    logout: async () => {
        try {
            const refreshToken = get().refreshToken;

            if (refreshToken) {
                await axiosInstance.post("/auth/logout/", {
                    refresh_token: refreshToken
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear tokens and user data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            set({
                user: null,
                accessToken: null,
                refreshToken: null
            });

            toast.success('Logged out successfully');
        }
    }

}))
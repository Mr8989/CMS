import { create } from "zustand";
import {toast} from "react-hot-toast"
import { axiosInstance } from "../lib/axios";

export const useMembersStore = create((set, get) => ({
    members: [],
    currentMember: null,
    loading: false,
    statistics: null,


    // Fetch all members
    fetchMembers: async (filters = {}) => {
        set({ loading: true });
        const token = localStorage.getItem('accessToken')
        try {
            const params = new URLSearchParams(filters).toString();
            const res = await axiosInstance.get(`api/members/?${params}`,{
                headers:{
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            set({ members: res.data.members, loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            toast.error('Failed to fetch members');
            throw error;
        }
    },

    // Get single member
    fetchMember: async (id) => {
        set({ loading: true });
        const token = localStorage.getItem('accessToken')
        try {
            const res = await axiosInstance.get(`api/members/${id}/`, {
                headers:{
                    'Authorization':`Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            set({ currentMember: res.data, loading: false });
            return res.data;
        } catch (error) {
            set({ loading: false });
            toast.error('Failed to load member details');
            throw error;
        }
    },

    // Create member
    createMember: async (memberData) => {
        set({ loading: true });
        const token = localStorage.getItem('accessToken')
        try {
            const res = await axiosInstance.post('api/members/create/', memberData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            toast.success('Member created successfully!');
            set({ loading: false });

            // Refresh members list
            await get().fetchMembers();
            return res.data;
        } catch (error) {
            set({ loading: false });
            const errorMessage = error.response?.data?.error || 'Failed to create member';
            toast.error(errorMessage);
            throw error;
        }
    },

    // Update member
    updateMember: async (id, memberData) => {
        set({ loading: true });
        try {
            const res = await axiosInstance.put(`api/members/${id}/update/`, memberData);
            toast.success('Member updated successfully!');
            set({ loading: false });

            // Refresh members list
            await get().fetchMembers();
            return res.data;
        } catch (error) {
            set({ loading: false });
            const errorMessage = error.response?.data?.error || 'Failed to update member';
            toast.error(errorMessage);
            throw error;
        }
    },

    // Delete member
    deleteMember: async (id) => {
        const token = localStorage.getItem('accessToken')
        try {
            await axiosInstance.delete(`api/members/${id}/delete/`, {
                headers:{
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Remove from local state
            set(state => ({
                members: state.members.filter(m => m.id !== id)
            }));

            toast.success('Member deleted successfully');
            return true;
        } catch (error) {
            toast.error('Failed to delete member');
            throw error;
        }
    },

    // Import members from Excel
    importMembers: async (file) => {
        set({ loading: true });
        const token = localStorage.getItem('accessToken')
        try {
            const formData = new FormData();
            formData.append('excel_file', file);

            const res = await axiosInstance.post('api/members/import/', formData, {
                headers:{
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success(`Imported ${res.data.created} members!`);
            set({ loading: false });

            // Refresh members list
            await get().fetchMembers();
            return res.data;
        } catch (error) {
            set({ loading: false });
            const errorMessage = error.response?.data?.error || 'Failed to import members';
            toast.error(errorMessage);
            console.log('error', errorMessage)
            throw error;
        }
    },

    // Fetch statistics
    fetchStatistics: async () => {
        const token = localStorage.getItem('accessToken')
        try {
            const res = await axiosInstance.get('api/members/statistics/',{
                headers:{
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            set({ statistics: res.data });
            return res.data;
        } catch (error) {
            console.error('Failed to load statistics:', error);
            throw error;
        }
    },

}))
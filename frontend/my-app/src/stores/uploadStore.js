import {create} from 'zustand'
import { axiosInstance } from '../lib/axios'
import {toast} from "react-hot-toast"

export const useUploadStore = create ((set) => ({
        loading: false,
        attendanceRecords: [],
        currentRecord: null,

    checkAttendance: async (serviceDate, serviceType, file) => {
        set({loading: true})
        const token = localStorage.getItem('accessToken')

        if(!token){
            set({loading: false})
            console.log("You must logged in to upload attendance")
            return null;
        }
        try {
            const formData = new FormData();
            formData.append("serviceDate", serviceDate);
            formData.append("serviceType", serviceType);
            formData.append("file", file);

            const res = await axiosInstance.post("api/attendance/upload/", {
                headers: {
                    "Content-Type":"multipart/form-data",
                    "Authorization": `Bearer ${token}`
                }
            }
        )
        console.log("Upload was a success", res.data)
        set({loading: false, currentRecord: res.data})
        toast.success('Attendance uploaded successfully')
        } catch (error) {
            set({error: error.message, loading: false})
            console.log("Error uploading file ", error.message)
            const errorMessage = error.response?.data?.error || error.response?.data?.message || "failed to upload attendance"
            toast.error(errorMessage)
            throw error;
        }
    }
}))
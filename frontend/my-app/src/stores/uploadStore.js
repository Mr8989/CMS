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
        if(!serviceDate || !serviceType || !file){
            set({loading: false})
            toast.error("Please fill all fields and select a file")
        }

        try {
            const formData = new FormData();
            formData.append("service_date", serviceDate);
            formData.append("service_type", serviceType);
            formData.append("excel_file", file);

            const res = await axiosInstance.post("api/attendance/upload/",formData,{
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type":"multipart/form-data"
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
    },

    //fetch attendance history
    fetchAttendanceHistory: async () => {
        set({loading : true});

        try {
            console.log("Fetching attending history...");
            const token = localStorage.getItem('accessToken')
            const res = await axiosInstance.get('api/attendance/',{
                headers:{
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
            console.log("Attendance history", res.data);

            const records = res.data.records || res.data

            set({
                attendanceRecords: Array.isArray(records) ? records : [],
                loading: false
            });
            return res.data
        } catch (error) {
            set({loading : false})
            console.log("Fetch history error", error)
            toast.error("failed to load attendance history");
            throw error
        }
    },

    //fetch single attendance report
    fetchAttendanceReport: async (recordId) => {
        set({loading: true});

        try {
            const token = localStorage.getItem('accessToken')
            console.log(`Fetching report for record ${recordId}...`);
            const res = await axiosInstance.get(`/attendance/report/${recordId}/`)
            console.log("Attendance report loaded", res.data)

            set({currentRecord: res.data, loading: false});
        } catch (error) {
            set({loading: false})
            console.error("Fetch report error", error)
            toast.error('Failed to load attendance report')
        }
    },
    //Delete attendance record
    deleteAttendanceRecord : async (recordId) => {
        const token = localStorage.getItem('accessToken')
        try {
            console.log(`Deleting record ${recordId}`)
            await axiosInstance.delete(`/api/attendance/delete/${recordId}/`,{
                headers:{
                    "Authorization":`Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            //remove from local state
            set(state => ({
                attendanceRecords: state.attendanceRecords.filter(r => r.id !== recordId)
            }))
            toast.success("Attendance record deleted")
            return true
        } catch (error) {
            console.error("Delete error", error)
            toast.error("Unable to delete")
        }
    },
    //export attendance to excel
   exportAttendance : async (recordId) => {
        const token = localStorage.getItem('accessToken')
    try {
        console.log(`Exporting record ${recordId}...`)
        const res = await axiosInstance.get(`/api/attendance/export/${recordId}/`,{
            headers:{
                "Authorization": `Bearer ${token}`,
            },
            responseType: 'blob'
        });
    
           // Create download link
           const url = window.URL.createObjectURL(new Blob([res.data]));
           const link = document.createElement('a');
           link.href = url;
           link.setAttribute('download', `attendance_${recordId}.xlsx`);
           document.body.appendChild(link);
           link.click();
           link.remove();
           window.URL.revokeObjectURL(url);
    
           toast.success('Attendance exported successfully!');
           return true;
    } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export attendance');
        throw error;
    }
   },
    // Get attendance statistics
    getAttendanceStats: () => {
        const records = get().attendanceRecords;

        if (records.length === 0) {
            return {
                totalRecords: 0,
                avgPresent: 0,
                avgAbsent: 0,
                avgRate: 0,
                bestAttendance: 0,
                worstAttendance: 0
            };
        }

        const totalPresent = records.reduce((sum, r) => sum + r.present_count, 0);
        const totalAbsent = records.reduce((sum, r) => sum + r.absent_count, 0);
        const avgPresent = Math.round(totalPresent / records.length);
        const avgAbsent = Math.round(totalAbsent / records.length);
        const avgRate = ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(1);

        const presentCounts = records.map(r => r.present_count);
        const bestAttendance = Math.max(...presentCounts);
        const worstAttendance = Math.min(...presentCounts);

        return {
            totalRecords: records.length,
            avgPresent,
            avgAbsent,
            avgRate,
            bestAttendance,
            worstAttendance
        };
    },

    // Clear current record
    clearCurrentRecord: () => {
        set({ currentRecord: null });
    }
}))
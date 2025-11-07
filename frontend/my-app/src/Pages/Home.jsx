import React, { useEffect, useState } from 'react'
import {Upload} from "lucide-react"
import { useUploadStore } from '../stores/uploadStore'
import toast from 'react-hot-toast'
import { useAuthStore } from '../stores/authStore'

function Home() {

  const [upload, setUpload] = useState({
    serviceDate : "",
    service : "Sunday Service",
    file : null
  })

  const {checkAttendance, loading} = useUploadStore()

    const handleFileChange = (e) => {
     const file = e.target.files[0];
      if(file){
        console.log("file selected", file.name)
        setUpload({...upload, file})
      }
    };

    const handleUpload = async (e) => {
      e.preventDefault();
      if(!upload.file){
        toast.error('Please select a file')
        return
      }
      const result = await checkAttendance(
        upload.serviceDate,
        upload.service,
        upload.file
      )
      console.log("result", result)
    }
  

  return (
    <div className="flex flex-col m-5 justify-center">
      <h1 className="flex text-black text-5xl justify-center">
        Upload Church Attendance
      </h1>
      <p className="flex text-2xl text-blue-600 mx-20 my-10">Instructions:</p>
      <div className="flex flex-col mx-20 gap-4 text-black text-2xl">
        <span>
          . Excel file should have a column named "name" with member names
        </span>
        <span>. Only members in the excel file will be marked as present</span>
        <span>. All other members will be automatically marked as absent</span>
        <span>. Support formats .xlsx xls</span>
      </div>
      <form action="" onSubmit={handleUpload}>
        <div className="flex m-5 justify-center w-full">
          <p className="text-black text-2xl">📅 Service Date:</p>
          <input
            type="Date"
            name=""
            value={upload.serviceDate}
            id=""
            onChange={(e) =>
              setUpload({ ...upload, serviceDate: e.target.value })
            }
            className="text-black my-10 bg-gray-300 justify-center w-1/2 border border-gray-400 shadow-md rounded-md p-2"
          />
        </div>
        <div className="flex m-5 justify-center w-full">
          <p className="text-black text-2xl">⛪ Service Type:</p>
          <input
            type="text"
            name=""
            value={upload.service}
            id=""
            placeholder="Enter service type"
            onChange={(e) => setUpload({ ...upload, service: e.target.value })}
            className="text-black border border-gray-400 shadow-md rounded-md p-2 w-1/2 justify-center my-10 bg-gray-300"
          />
        </div>
        <div className="flex flex-col items-center justify-center text-black gap-5">
          <label>Excel File</label>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              name=""
              onChange={handleFileChange}
              id=""
              className="w-full px-4 py-3  border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500
        focus:outline-none focus:border-blue-500 transition cursor-pointer"
              required
            />
          </div>
          {upload.file && (
            <p className="mt-2 text-sm text-green-600">
              ✅ Selected: {upload.file.name}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex gap-2 border bg-white border-transparent w-70 p-2 shadow rounded-md hover:bg-gray-500 transition ease-in-out"
          >
            <Upload className="w-5 h-5" />
            {loading ? "Uploading" : "Upload Attendance"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Home

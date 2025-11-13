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
    <div className="min-h-screen m-5 w-full">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="flex text-black text-3xl justify-center">
              Upload Church Attendance
            </h1>
          </div>
          {/**Instructor */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
            <p className="flex text-xl font-semibold text-blue-800 mx-20 my-10 justify-center">
              Instructions:
            </p>
            <div className="flex flex-col mx-20 gap-4 text-black font-medium text-center">
              <ol className="space-y-2 items-center inline">
                <li className="">
                  Excel file should have a column named "name" with member names
                </li>
                <li>
                  Only members in the excel file will be marked as present
                </li>
                <li>
                  All other members will be automatically marked as absent
                </li>
                <li> Support formats .xlsx xls</li>
              </ol>
            </div>
          </div>
          <form action="" onSubmit={handleUpload}>
            <div className="flex justify-center w-full flex-col">
              <label className="block text-black font-medium">
                📅 Service Date:
              </label>
              <div className="relative mt-1 rounded-md shadow-md">
                <div className="">
                  <input
                    type="Date"
                    name=""
                    value={upload.serviceDate}
                    id=""
                    onChange={(e) =>
                      setUpload({ ...upload, serviceDate: e.target.value })
                    }
                    className="text-black my-10 bg-gray-300 border border-gray-400 shadow-md rounded-md p-2 w-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center w-full flex-col">
              <p className="text-black font-medium">⛪ Service Type:</p>
              <input
                type="text"
                name=""
                value={upload.service}
                id=""
                placeholder="Enter service type"
                onChange={(e) =>
                  setUpload({ ...upload, service: e.target.value })
                }
                className="text-black border border-gray-400 shadow-md rounded-md p-2 w-full justify-center my-10 bg-gray-300"
              />
            </div>
            <div className="flex flex-col items-center justify-center text-black gap-2">
              <label>Excel File</label>
              <div className="relative">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  name=""
                  onChange={handleFileChange}
                  id=""
                  className="w-full px-4 py-3  border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500
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
                className="flex gap-2 border bg-gray-600 text-white border-transparent w-70 p-2 shadow rounded-md hover:bg-gray-500 transition ease-in-out"
              >
                <Upload className="w-5 h-5" />
                {loading ? "Uploading" : "Upload Attendance"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home

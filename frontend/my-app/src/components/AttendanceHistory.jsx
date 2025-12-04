import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, Download, Trash2, Upload } from "lucide-react";
import { useUploadStore } from "../stores/uploadStore";

function AttendanceHistory() {
  const {
    attendanceRecords,
    loading,
    fetchAttendanceHistory,
    deleteAttendanceRecord,
    exportAttendance,
  } = useUploadStore();

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  // Fixed: Pass the id parameter
  const handleExport = async (id) => {
    await exportAttendance(id); // Fixed: was record.id, should be id
  };

  const handleDelete = async (id, serviceType) => {
    if (window.confirm(`Are you sure you want to delete ${serviceType}?`)) {
      await deleteAttendanceRecord(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Attendance History
              </h1>
              <p className="text-gray-600 mt-1">
                Total Records: {attendanceRecords.length}
              </p>
            </div>
            <Link
              to="/attendance/upload"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload New
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {attendanceRecords.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
             <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Attendance Records Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Upload your first attendance record to get started!
            </p>
            <Link
              to="/"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              Upload Attendance
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Service Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Present
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Absent
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Rate
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceRecords.map((record) => {
                  const total = record.present_count + record.absent_count;
                  const rate =
                    total > 0
                      ? ((record.present_count / total) * 100).toFixed(1)
                      : 0;

                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {record.service_type}
                      </td>
                      <td className="px-6 py-4 text-green-600 font-semibold">
                        {record.present_count}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-semibold">
                        {record.absent_count}
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-semibold">
                        {rate}%
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/attendance/report/${record.id}`}
                            className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                            title="View Report"
                          >
                            {/**<Eye className="w-4 h-4" /> */}
                          </Link>
                          <button
                            onClick={() => handleExport(record.id)}
                            className="p-2 bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition"
                            title="Export Excel"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(record.id, record.service_type)
                            }
                            className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceHistory;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Upload, Download } from "lucide-react";
import { useMembersStore } from "../stores/memberStore";

function ImportMembers() {
  const navigate = useNavigate();
  const { importMembers, loading } = useMembersStore();
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      await importMembers(file);
      navigate("/members");
    } catch (error) {
      console.error("Import failed:", error);
    }
  };

  const downloadTemplate = () => {
    // Create template data
    const template = `first_name,middle_name,last_name,gender,phone_number,date_of_birth,married_status,home_address,occupation,place_of_work,church_membership_status,ministry
John,Kwame,Mensah,M,0244123456,1990-01-15,M,123 Main St,Teacher,ABC School,M,Y
Mary,,Adjei,F,0201234567,1985-05-20,S,456 Oak Ave,Nurse,City Hospital,M,W`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members_template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/members" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              📥 Import Members
            </h1>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
            <p className="text-xl font-semibold text-blue-800 mb-3">
              📌 Instructions:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                Download the Excel template below
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                Fill in member details (required: first_name, last_name,
                phone_number, date_of_birth)
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                Upload the completed file
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                Supported formats: .xlsx, .xls
              </li>
            </ul>
          </div>

          <button
            onClick={downloadTemplate}
            className="w-full mb-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Template
          </button>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                📄 Select Excel File:
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer"
                required
              />
              {file && (
                <p className="mt-2 text-sm text-green-600">
                  ✅ Selected: {file.name}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                {loading ? "Importing..." : "Import Members"}
              </button>
              <Link
                to="/members"
                className="px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ImportMembers;

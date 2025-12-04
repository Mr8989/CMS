import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Upload, Eye } from "lucide-react";
import { useMembersStore } from "../stores/memberStore";
import {useAuthStore} from "../stores/authStore"

function Members() {
  const { members, loading, fetchMembers, deleteMember} = useMembersStore();
  const [searchTerm, setSearchTerm] = useState("");
  const {user} = useAuthStore()
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    gender: "",
    ministry: "",
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    console.log("checking auth")
    console.log('Token:', token ? 'Exists' : 'Missing')
    if(!token){
      console.log("Not authenticated redirecting you to login....")
      navigate("/login")
      return
    }
    fetchMembers()
  },[user, navigate])

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMembers({ search: searchTerm, ...filters });
  };


  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteMember(id);
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                👥 Church Members
              </h1>
              <p className="text-gray-600 mt-1">
                Total: {members.length} members
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/members/import"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Import Excel
              </Link>
              <Link
                to="/members/add"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Member
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filters.gender}
              onChange={(e) =>
                setFilters({ ...filters, gender: e.target.value })
              }
              className="px-4 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Filter</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            <button
              type="submit"
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </form>
        </div>

        {/* Members Table */}
        {members.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Members Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Add your first member to get started!
            </p>
            <Link
              to="/members/add"
              className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-400"
            >
              Add Member
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Gender
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Ministry
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member, index) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {member.full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {member.phone_number}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {member.gender_display}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {member.ministry_display}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {member.church_membership_status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/members/${member.id}`}
                          className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/members/${member.id}/edit`}
                          className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(member.id, member.full_name)
                          }
                          className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


export default Members;

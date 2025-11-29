import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Mail, User, Clock, Shield } from "lucide-react";

const AdminDashboard = () => {
  const { backendUrl, isAdminLoggedIn, getAdminData } = useContext(AppContent);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdminLoggedIn) {
      navigate("/admin-login");
      return;
    }

    getAdminData();
    fetchPendingRequests();
  }, [isAdminLoggedIn]);

  const fetchPendingRequests = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/get-requests", {
        withCredentials: true,
      });

      if (data.success) {
        setRequests(data.pendingRequests);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (id) => {
    setProcessingId(id);
    try {
      const { data } = await axios.patch(
        backendUrl + `/api/admin/accept-request/${id}`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Request accepted!");
        setRequests((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error accepting request");
    } finally {
      setProcessingId(null);
    }
  };

  const rejectRequest = async (id) => {
    setProcessingId(id);
    try {
      const { data } = await axios.patch(
        backendUrl + `/api/admin/reject-request/${id}`,
        {},
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Request rejected!");
        setRequests((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error rejecting request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Header Section */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-400 ml-11">
            Review and manage teacher verification requests
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Card */}
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6 mb-8 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Pending Requests</p>
              <p className="text-4xl font-bold text-indigo-400">
                {loading ? "..." : requests.length}
              </p>
            </div>
            <Clock className="w-12 h-12 text-indigo-400/50" />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-400 text-lg">Loading requests...</p>
          </div>
        )}

        {/* No Requests */}
        {!loading && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-slate-800/50 rounded-full p-6 mb-4">
              <CheckCircle className="w-16 h-16 text-green-400" />
            </div>
            <p className="text-xl font-semibold text-slate-300 mb-2">All caught up!</p>
            <p className="text-slate-500">No pending teacher verification requests at the moment.</p>
          </div>
        )}

        {/* Request List */}
        <div className="space-y-4">
          {requests.map((teacher, index) => (
            <div
              key={teacher._id}
              className="group bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10"
              style={{
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-2">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors">
                        {teacher.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4 text-slate-500" />
                        <p className="text-slate-400 text-sm">{teacher.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => acceptRequest(teacher._id)}
                    disabled={processingId === teacher._id}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {processingId === teacher._id ? "Processing..." : "Accept"}
                  </button>

                  <button
                    onClick={() => rejectRequest(teacher._id)}
                    disabled={processingId === teacher._id}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <XCircle className="w-4 h-4" />
                    {processingId === teacher._id ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
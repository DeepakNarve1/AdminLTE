"use client";
import { useState, useEffect } from "react";
import { ContentHeader } from "@components";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@app/utils/api";
import { toast } from "react-toastify";

interface IUser {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role?: string | { name?: string; role?: string; displayName?: string };
  userType?: string;
  block?: string;
  createdAt?: string;
}

const ViewUser = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/auth/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.data) {
          setUser(res.data.data);
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to load user");
        setTimeout(() => router.push("/users"), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <ContentHeader title="View User" />
        <section className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading user details...</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <ContentHeader title="View User" />
        <section className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center justify-center gap-2">
                <i className="fas fa-exclamation-circle text-xl"></i>
                <span className="font-medium">User not found</span>
              </div>
              <button
                onClick={() => router.push("/users")}
                className="mt-6 text-gray-500 hover:text-gray-800 underline text-sm"
              >
                Return to Users List
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string | any) => {
    const roleName = (typeof role === "object" ? role?.name : role) || "";
    switch (roleName.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200";
      case "manager":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "hr":
        return "bg-cyan-100 text-cyan-700 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ContentHeader title="View User" />
      <section className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Card Header */}
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <h5 className="text-white font-semibold text-lg flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <i className="fas fa-user text-sm"></i>
                </div>
                User Information
              </h5>
              <div className="text-blue-100 text-sm">
                ID: {user._id.slice(-6)}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-6">
              {/* Profile Header Section */}
              <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl border-2 border-white shadow-sm ring-1 ring-gray-100">
                  <i className="fas fa-user"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {user.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                    <i className="far fa-clock"></i>
                    Member since{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 block">
                    Mobile Number
                  </label>
                  <p className="text-gray-800 font-medium text-base">
                    {user.mobile || (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 block">
                    Role
                  </label>
                  <div className="flex">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}
                    >
                      {(typeof user.role === "object"
                        ? // @ts-ignore
                          user.role.displayName ||
                          user.role.name ||
                          user.role.role
                        : user.role) || "N/A"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 block">
                    User Type
                  </label>
                  <p className="text-gray-800 font-medium text-base capitalize">
                    {user.userType || (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1 block">
                    Block
                  </label>
                  <p className="text-gray-800 font-medium text-base">
                    {user.block || (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition shadow-sm font-medium flex items-center gap-2"
                onClick={() => router.push("/users")}
              >
                <i className="fas fa-arrow-left text-xs"></i> Back to List
              </button>
              <button
                className="px-4 py-2 bg-blue-600 border border-transparent rounded text-white hover:bg-blue-700 transition shadow-sm font-medium flex items-center gap-2"
                onClick={() => router.push(`/users/${id}/edit`)}
              >
                <i className="fas fa-edit text-xs"></i> Edit User
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViewUser;

import { useState, useEffect } from "react";
import { ContentHeader } from "@components";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

interface IUser {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role?: string;
  userType?: string;
  block?: string;
  createdAt?: string;
}

const ViewUser = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/auth/users/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data?.data) {
          setUser(res.data.data);
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "Failed to load user");
        setTimeout(() => navigate("/users"), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div>
        <ContentHeader title="View User" />
        <section className="content">
          <div className="container-fluid">
            <div className="card p-4">
              <div className="text-center">
                <p>Loading...</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <ContentHeader title="View User" />
        <section className="content">
          <div className="container-fluid">
            <div className="card p-4">
              <div className="alert alert-warning">User not found</div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <ContentHeader title="View User" />
      <section className="content">
        <div className="container-fluid">
          <div className="card" style={{ maxWidth: "600px" }}>
            {/* Card Header */}
            <div
              className="card-header"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "16px",
              }}
            >
              <h5 className="mb-0">User Information</h5>
            </div>

            {/* Card Body */}
            <div className="card-body" style={{ padding: "20px" }}>
              {/* Name */}
              <div className="mb-2">
                <label
                  style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}
                >
                  Full Name
                </label>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    fontWeight: "500",
                  }}
                >
                  {user.name}
                </p>
                <hr style={{ margin: "8px 0", borderColor: "#e9ecef" }} />
              </div>

              {/* Email */}
              <div className="mb-2">
                <label
                  style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}
                >
                  Email Address
                </label>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    fontWeight: "500",
                  }}
                >
                  {user.email}
                </p>
                <hr style={{ margin: "8px 0", borderColor: "#e9ecef" }} />
              </div>

              {/* Mobile */}
              <div className="mb-2">
                <label
                  style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}
                >
                  Mobile Number
                </label>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    fontWeight: "500",
                  }}
                >
                  {user.mobile || "-"}
                </p>
                <hr style={{ margin: "8px 0", borderColor: "#e9ecef" }} />
              </div>

              {/* Role */}
              <div className="mb-2">
                <label
                  style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}
                >
                  Role
                </label>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    fontWeight: "500",
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      backgroundColor:
                        user.role === "admin"
                          ? "#dc3545"
                          : user.role === "manager"
                            ? "#ffc107"
                            : user.role === "hr"
                              ? "#17a2b8"
                              : "#6c757d",
                      color: user.role === "manager" ? "#333" : "white",
                      padding: "6px 12px",
                      fontSize: "12px",
                    }}
                  >
                    {user.role || "-"}
                  </span>
                </p>
                <hr style={{ margin: "8px 0", borderColor: "#e9ecef" }} />
              </div>

              {/* User Type */}
              <div className="mb-2">
                <label
                  style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}
                >
                  User Type
                </label>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    fontWeight: "500",
                  }}
                >
                  {user.userType || "-"}
                </p>
                <hr style={{ margin: "8px 0", borderColor: "#e9ecef" }} />
              </div>

              {/* Block */}
              <div className="mb-2">
                <label
                  style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}
                >
                  Block
                </label>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    fontWeight: "500",
                  }}
                >
                  {user.block || "-"}
                </p>
                <hr style={{ margin: "8px 0", borderColor: "#e9ecef" }} />
              </div>

              {/* Created Date */}
              <div className="mb-2">
                <label
                  style={{ fontSize: "12px", color: "#666", fontWeight: "600" }}
                >
                  Created On
                </label>
                <p
                  style={{
                    fontSize: "16px",
                    margin: "8px 0",
                    fontWeight: "500",
                  }}
                >
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>

            {/* Card Footer */}
            <div
              className="card-footer"
              style={{
                backgroundColor: "#f8f9fa",
                padding: "16px",
                borderTop: "1px solid #dee2e6",
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/users/${id}/edit`)}
              >
                <i className="fas fa-edit"></i> Edit
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigate("/users")}
              >
                <i className="fas fa-arrow-left"></i> Back
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ViewUser;

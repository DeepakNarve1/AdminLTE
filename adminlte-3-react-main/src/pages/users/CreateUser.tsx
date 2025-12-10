import { useState } from "react";
import { ContentHeader } from "@components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface UserForm {
  name: string;
  email: string;
  password: string;
}

const CreateUser = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<UserForm>({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createUser = async () => {
    if (!form.name || !form.email || !form.password) {
      alert("All fields are required!");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/auth/register", form);

      alert("User Created Successfully!");

      navigate("/users");
    } catch (error: any) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ContentHeader title="User Management" />

      <section className="content">
        <div className="container-fluid">
          <div className="card p-4" style={{ maxWidth: "550px" }}>
            <div>Enter User Details</div>

            {/* Name */}
            <div className="form-group">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div className="form-group mt-3">
              <label>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter email address"
              />
            </div>

            {/* Password */}
            <div className="form-group mt-3">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter password"
              />
            </div>

            <button
              className="btn btn-primary mt-4"
              onClick={createUser}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateUser;

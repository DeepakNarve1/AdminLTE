import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ContentHeader } from "@components";

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    district: "",
    block: "",
    department: "",
    workName: "",
    projectCost: "",
    proposalEstimate: "",
    tsNoDate: "",
    asNoDate: "",
    status: "Pending",
    officerName: "",
    contactNumber: "",
    remarks: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        projectCost: Number(formData.projectCost),
        proposalEstimate: Number(formData.proposalEstimate),
      };

      await axios.post("http://localhost:5000/api/projects", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Project Created Successfully!");
      navigate("/project-summary");
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create project";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ContentHeader title="Create Project" />
      <section className="content">
        <div className="container-fluid">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Project Details</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* District */}
                  <div className="col-md-4 mb-3">
                    <label>
                      District <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Block */}
                  <div className="col-md-4 mb-3">
                    <label>
                      Block <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="block"
                      value={formData.block}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Department */}
                  <div className="col-md-4 mb-3">
                    <label>
                      Department <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="PWD">PWD</option>
                      <option value="Health">Health</option>
                      <option value="Education">Education</option>
                      <option value="PHE">PHE</option>
                      <option value="RES">RES</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  {/* Work Name */}
                  <div className="col-md-12 mb-3">
                    <label>
                      Work Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="workName"
                      value={formData.workName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  {/* Project Cost */}
                  <div className="col-md-4 mb-3">
                    <label>
                      Project Cost (₹) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="projectCost"
                      value={formData.projectCost}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Proposal Estimate */}
                  <div className="col-md-4 mb-3">
                    <label>
                      Proposal Estimate (₹){" "}
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      name="proposalEstimate"
                      value={formData.proposalEstimate}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="col-md-4 mb-3">
                    <label>
                      Status <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  {/* TS No/Date */}
                  <div className="col-md-6 mb-3">
                    <label>TS No. / Date</label>
                    <input
                      type="text"
                      className="form-control"
                      name="tsNoDate"
                      placeholder="e.g. TS-123 / 2025-01-01"
                      value={formData.tsNoDate}
                      onChange={handleChange}
                    />
                  </div>

                  {/* AS No/Date */}
                  <div className="col-md-6 mb-3">
                    <label>AS No. / Date</label>
                    <input
                      type="text"
                      className="form-control"
                      name="asNoDate"
                      placeholder="e.g. AS-456 / 2025-02-01"
                      value={formData.asNoDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row">
                  {/* Officer Name */}
                  <div className="col-md-6 mb-3">
                    <label>Officer Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="officerName"
                      value={formData.officerName}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="col-md-6 mb-3">
                    <label>Contact Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row">
                  {/* Remarks */}
                  <div className="col-md-12 mb-3">
                    <label>Remarks</label>
                    <textarea
                      className="form-control"
                      name="remarks"
                      rows={3}
                      value={formData.remarks}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <div className="text-start">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Project"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary ml-2"
                    onClick={() => navigate("/project-summary")}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateProject;

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const MPPublicProblem: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    srNo: "",
    reglNo: "",
    timer: "",
    year: "",
    month: "",
    date: "",
    district: "",
    assembly: "",
    block: "",
    recommendedLetterNo: "",
    boothNo: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        srNo: formData.srNo,
        regNo: formData.reglNo, // Mapping reglNo to regNo
        timer: formData.timer,
        year: formData.year,
        month: formData.month,
        day: formData.date, // Mapping date to day
        district: formData.district,
        assembly: formData.assembly,
        block: formData.block,
        recommendedLetterNo: formData.recommendedLetterNo,
        boothNo: formData.boothNo,
        dateString: `${formData.year}-${formData.month}-${formData.date}`, // Optional
      };

      await axios.post("http://localhost:5000/api/public-problems", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Entry Created Successfully!");
      navigate("/mp-public-problem"); // Redirect to list page
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to create entry";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mt-4 mb-4">MP Public Problem Form</h2>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Submit New Entry</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Sr. No.</label>
                <input
                  type="text"
                  className="form-control"
                  name="srNo"
                  value={formData.srNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Regl. No.</label>
                <input
                  type="text"
                  className="form-control"
                  name="reglNo"
                  value={formData.reglNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Timer</label>
                <input
                  type="text"
                  className="form-control"
                  name="timer"
                  placeholder="e.g., 10:30 AM"
                  value={formData.timer}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  className="form-control"
                  name="year"
                  placeholder="2025"
                  min="2000"
                  max="2030"
                  value={formData.year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Month</label>
                <select
                  className="form-control"
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Month</option>
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Date</label>
                <input
                  type="number"
                  className="form-control"
                  name="date"
                  min="1"
                  max="31"
                  placeholder="1-31"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">District</label>
                <input
                  type="text"
                  className="form-control"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Assembly</label>
                <input
                  type="text"
                  className="form-control"
                  name="assembly"
                  value={formData.assembly}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Block</label>
                <input
                  type="text"
                  className="form-control"
                  name="block"
                  value={formData.block}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Recommended Letter No</label>
                <input
                  type="text"
                  className="form-control"
                  name="recommendedLetterNo"
                  value={formData.recommendedLetterNo}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Booth No</label>
                <input
                  type="text"
                  className="form-control"
                  name="boothNo"
                  value={formData.boothNo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="text-start">
              <button
                type="submit"
                className="btn btn-primary btn-sm "
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Form"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MPPublicProblem;

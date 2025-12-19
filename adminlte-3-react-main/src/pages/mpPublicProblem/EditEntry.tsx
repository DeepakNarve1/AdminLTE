import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

const EditEntry: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
    status: "",
  });

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setFetching(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/public-problems/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = res.data?.data;
        if (data) {
          setFormData({
            srNo: data.srNo || "",
            reglNo: data.regNo || "",
            timer: data.timer || "",
            year: data.year || "",
            month: data.month || "",
            date: data.day || "",
            district: data.district || "",
            assembly: data.assembly || "",
            block: data.block || "",
            recommendedLetterNo: data.recommendedLetterNo || "",
            boothNo: data.boothNo || "",
            status: data.status || "Pending",
          });
        }
      } catch (error: any) {
        console.error(error);
        toast.error("Failed to fetch entry details");
        navigate("/mp-public-problem");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchEntry();
  }, [id, navigate]);

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
        regNo: formData.reglNo,
        timer: formData.timer,
        year: formData.year,
        month: formData.month,
        day: formData.date,
        district: formData.district,
        assembly: formData.assembly,
        block: formData.block,
        recommendedLetterNo: formData.recommendedLetterNo,
        boothNo: formData.boothNo,
        status: formData.status,
        dateString: `${formData.year}-${formData.month}-${formData.date}`,
      };

      await axios.put(
        `http://localhost:5000/api/public-problems/${id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Entry Updated Successfully!");
      navigate("/mp-public-problem");
    } catch (error: any) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to update entry";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container-fluid">
      <h2 className="mt-4 mb-4">Edit Public Problem</h2>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Update Entry Details</h3>
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
              <div className="col-md-4 mb-3">
                <label className="form-label">Recommended Letter No</label>
                <input
                  type="text"
                  className="form-control"
                  name="recommendedLetterNo"
                  value={formData.recommendedLetterNo}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Booth No</label>
                <input
                  type="text"
                  className="form-control"
                  name="boothNo"
                  value={formData.boothNo}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-control"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="text-start">
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Entry"}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm ml-2"
                onClick={() => navigate("/mp-public-problem")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEntry;

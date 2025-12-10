import { ContentHeader } from "@components";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const navigate = useNavigate();

  return (
    <div>
      <ContentHeader title="Users" />

      <section className="content">
        <div className="container-fluid">
          <div className="card p-3">
            {/* Create User Button */}
            <div className="d-flex">
              <button
                className="btn btn-primary ml-auto"
                onClick={() => navigate("/users/create")}
              >
                Create User
              </button>
            </div>

            <div className="card-body">
              <table className="table table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>{/* User rows will go here */}</tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Users;

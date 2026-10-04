import { useEffect, useState } from "react";
import { getUsers } from "../api/authApi";
import Spinner from "../components/Spinner";
import { usePageTitle } from "../hooks/usePageTitle";

function AdminPage() {
  usePageTitle("Admin");
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">Error: {error}</p>;
  if (!users) return <Spinner />;

  return (
    <div>
      <h1>Users</h1>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;

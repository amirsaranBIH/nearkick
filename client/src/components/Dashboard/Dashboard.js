import "./Dashboard.css";
import { useState, useContext, useEffect } from "react";
import AuthUserContext from "../../store/auth-user-context";
import { Link } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const authUserContext = useContext(AuthUserContext);

  useEffect(() => {
    axios
      .get(
        "http://localhost:3001/api/projects/getByUserId/" +
          authUserContext.user.id
      )
      .then((res) => {
        setProjects(res.data.data);
        console.log(projects);
      });
  }, []);

  return (
    <div>
      <h1>{authUserContext.user.email}</h1>
      <Link to="/dashboard/create-project">
        <button type="button">Create Project</button>
      </Link>
    </div>
  );
}

export default Dashboard;

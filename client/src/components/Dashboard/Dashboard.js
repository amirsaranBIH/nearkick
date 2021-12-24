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
      .get("/api/projects/getByUserId/" + authUserContext.user.id)
      .then((res) => {
        setProjects(res.data.data);
      });
  }, [authUserContext.user.id]);

  return (
    <div>
      <h1>{authUserContext.user.email}</h1>
      <div className="projects">
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link to={"/dashboard/edit-project/" + project.id}>
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <Link to="/dashboard/create-project">
        <button type="button">Create Project</button>
      </Link>
    </div>
  );
}

export default Dashboard;

import "./Home.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Home() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get("/api/projects/getAll").then((res) => {
      setProjects(res.data.data);
    });
  }, []);

  return (
    <div>
      <h1>Nearkick</h1>
      <div className="projects">
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link to={"/project/" + project.id}>{project.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Home;

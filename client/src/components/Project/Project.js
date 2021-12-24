import "./Project.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { HOST } from "../../config";

function Project() {
  const { id } = useParams();
  const [project, setProject] = useState([]);

  useEffect(() => {
    axios.get("/api/projects/" + id).then((res) => {
      setProject(res.data.data);
    });
  }, [id]);

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      <img src={HOST + "/" + project.image} alt={project.name} />
    </div>
  );
}

export default Project;

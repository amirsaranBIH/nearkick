import "./EditProject.css";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function EditProject() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    axios.get("/api/projects/" + id).then((res) => {
      setProject(res.data.data);
    });
  }, [id]);

  function onSubmitHandler(e) {
    e.preventDefault();

    const formData = new FormData();

    formData.append("id", project.id);
    formData.append("name", project.name);
    formData.append("description", project.description);
    formData.append("image", imageFile);

    axios
      .put("/api/projects/" + id, formData)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function onNameChangeHandler(event) {
    setProject({ ...project, name: event.target.value });
  }

  function onDescriptionChangeHandler(event) {
    setProject({ ...project, description: event.target.value });
  }

  function onImageChangeHandler(event) {
    setImageFile(event.target.files[0]);
  }

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <form onSubmit={onSubmitHandler}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={project.name}
            onInput={onNameChangeHandler}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            onInput={onDescriptionChangeHandler}
            value={project.description}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input type="file" id="image" onChange={onImageChangeHandler} />
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default EditProject;

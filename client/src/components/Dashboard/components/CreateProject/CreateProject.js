import "./CreateProject.css";
import { useRef } from "react";
import axios from "axios";

function CreateProject() {
  const projectNameInputRef = useRef();
  const projectDescriptionInputRef = useRef();
  const projectImageInputRef = useRef();

  function onSubmitHandler(e) {
    e.preventDefault();

    const projectNameValue = projectNameInputRef.current.value;
    const projectDescriptionValue = projectDescriptionInputRef.current.value;
    const projectImageValue = projectImageInputRef.current.files[0];

    const formData = new FormData();
    formData.append("name", projectNameValue);
    formData.append("description", projectDescriptionValue);
    formData.append("image", projectImageValue);

    axios
      .post("http://localhost:3001/api/projects/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {})
      .catch((err) => {});
  }

  return (
    <div>
      <h1>Create Project</h1>
      <form onSubmit={onSubmitHandler} encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" ref={projectNameInputRef} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            ref={projectDescriptionInputRef}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input type="file" id="image" ref={projectImageInputRef} />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default CreateProject;

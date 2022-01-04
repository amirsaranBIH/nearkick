import "./EditProject.css";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import WalletContext from "../../../../store/wallet-context";

function EditProject() {
  const { id } = useParams();

  const walletContext = useContext(WalletContext);

  const [project, setProject] = useState(null);

  useEffect(() => {
    if (walletContext.wallet && walletContext.contract) {
      walletContext.contract
        .get_project({ project_id: parseInt(id, 10) })
        .then((res) => {
          setProject(res);
        });
    }
  }, [walletContext.contract, walletContext.wallet]);

  function onSubmitHandler(e) {
    e.preventDefault();

    walletContext.contract
      .update_project({
        id: parseInt(id, 10),
        goal: parseFloat(project.goal),
        name: project.name,
        description: project.description,
        plan: project.plan,
        end_time: 86400000000000, // one day in nanosec
      })
      .then((res) => {
        console.log(res);
      });
  }

  function onNameChangeHandler(event) {
    setProject({ ...project, name: event.target.value });
  }

  function onDescriptionChangeHandler(event) {
    setProject({ ...project, description: event.target.value });
  }

  function onGoalChangeHandler(event) {
    setProject({ ...project, goal: event.target.value });
  }

  function onPlanChangeHandler(event) {
    setProject({ ...project, plan: event.target.value });
  }

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="h1">Update Project</h1>
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
            value={project.description}
            onInput={onDescriptionChangeHandler}
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="goal">Goal</label>
          <input
            type="number"
            id="goal"
            value={project.goal}
            onInput={onGoalChangeHandler}
          />
        </div>
        <div className="form-group">
          <label htmlFor="plan">Plan</label>
          <select id="plan" value={project.plan} onInput={onPlanChangeHandler}>
            <option value="OneTime">One Time</option>
            <option value="Recurring">Recurring</option>
          </select>
        </div>
        <button className="btn" type="submit">
          Update Project
        </button>
      </form>
    </div>
  );
}

export default EditProject;

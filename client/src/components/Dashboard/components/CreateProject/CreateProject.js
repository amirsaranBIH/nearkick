import "./CreateProject.css";
import { useRef, useContext } from "react";
import WalletContext from "../../../../store/wallet-context";

function CreateProject() {
  const walletContext = useContext(WalletContext);

  const projectNameInputRef = useRef();
  const projectDescriptionInputRef = useRef();
  const projectGoalInputRef = useRef();
  const projectPlanInputRef = useRef("OneTime");

  function onSubmitHandler(e) {
    e.preventDefault();

    const projectNameValue = projectNameInputRef.current.value;
    const projectDescriptionValue = projectDescriptionInputRef.current.value;
    const projectGoalValue = projectGoalInputRef.current.value;
    const projectPlanValue = projectPlanInputRef.current.value;

    walletContext.contract
      .add_project({
        goal: parseFloat(projectGoalValue),
        name: projectNameValue,
        description: projectDescriptionValue,
        plan: projectPlanValue,
        end_time: 86400000000000, // one day in nanosec
      })
      .then((res) => {
        console.log(res);
      });
  }

  return (
    <div>
      <h1 className="h1">Create Project</h1>
      <form onSubmit={onSubmitHandler}>
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
          <label htmlFor="goal">Goal</label>
          <input type="number" id="goal" ref={projectGoalInputRef} />
        </div>
        <div className="form-group">
          <label htmlFor="plan">Plan</label>
          <select id="plan" ref={projectPlanInputRef}>
            <option value="OneTime">One Time</option>
            <option value="Recurring">Recurring</option>
          </select>
        </div>
        <button className="btn" type="submit">
          Create Project
        </button>
      </form>
    </div>
  );
}

export default CreateProject;

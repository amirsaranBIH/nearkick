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

    // const newDate =
    //   (project.end_time / 1000000 - new Date().valueOf()) * 1000000;

    walletContext.contract
      .update_project({
        project_id: parseInt(id, 10),
        goal: parseFloat(project.goal),
        name: project.name,
        description: project.description,
        plan: project.plan,
        basic_supporter_amount: parseFloat(project.level_amounts.Basic),
        intermediate_supporter_amount: parseFloat(
          project.level_amounts.Intermediate
        ),
        advanced_supporter_amount: parseFloat(project.level_amounts.Advanced),
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

  function onBasicAmountChangeHandler(event) {
    setProject({
      ...project,
      level_amounts: {
        ...project.level_amounts,
        Basic: event.target.value,
      },
    });
  }

  function onIntermediateAmountChangeHandler(event) {
    setProject({
      ...project,
      level_amounts: {
        ...project.level_amounts,
        Intermediate: event.target.value,
      },
    });
  }

  function onAdvancedAmountChangeHandler(event) {
    setProject({
      ...project,
      level_amounts: {
        ...project.level_amounts,
        Advanced: event.target.value,
      },
    });
  }

  function onEndDateChangeHandler(event) {
    const newDate = new Date(event.target.value).valueOf() * 1000000;
    setProject({ ...project, end_time: newDate });
  }

  function calculateEndDate(endDateInNanoSec) {
    return new Date(endDateInNanoSec / 1000000).toISOString().split(".")[0];
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
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="datetime-local"
            id="endDate"
            disabled
            value={calculateEndDate(project.end_time)}
            onChange={onEndDateChangeHandler}
          />
        </div>
        <div>
          <h2 className="h2">Supporter Level Amounts</h2>
          <div className="form-group">
            <label htmlFor="basic-level">Basic Level</label>
            <input
              type="number"
              id="basic-level"
              value={project.level_amounts.Basic}
              onInput={onBasicAmountChangeHandler}
            />
          </div>
          <div className="form-group">
            <label htmlFor="intermediate-level">Intermediate Level</label>
            <input
              type="number"
              id="intermediate-level"
              value={project.level_amounts.Intermediate}
              onInput={onIntermediateAmountChangeHandler}
            />
          </div>
          <div className="form-group">
            <label htmlFor="advanced-level">Advanced Level</label>
            <input
              type="number"
              id="advanced-level"
              value={project.level_amounts.Advanced}
              onInput={onAdvancedAmountChangeHandler}
            />
          </div>
        </div>
        <button className="btn" type="submit">
          Update Project
        </button>
      </form>
    </div>
  );
}

export default EditProject;

import "./CreateProject.css";
import { useRef, useContext } from "react";
import WalletContext from "../../../../store/wallet-context";

function CreateProject() {
  const walletContext = useContext(WalletContext);

  const projectNameInputRef = useRef();
  const projectDescriptionInputRef = useRef();
  const projectGoalInputRef = useRef();
  const projectPlanInputRef = useRef("OneTime");
  const projectEndDateInputRef = useRef();
  const projectBasicAmountInputRef = useRef();
  const projectIntermediateAmountInputRef = useRef();
  const projectAdvancedAmountInputRef = useRef();

  function onSubmitHandler(e) {
    e.preventDefault();

    const projectNameValue = projectNameInputRef.current.value;
    const projectDescriptionValue = projectDescriptionInputRef.current.value;
    const projectGoalValue = projectGoalInputRef.current.value;
    const projectPlanValue = projectPlanInputRef.current.value;
    const projectEndDateValue = projectEndDateInputRef.current.value;
    const projectBasicAmountValue = projectBasicAmountInputRef.current.value;
    const projectIntermediateAmountValue =
      projectIntermediateAmountInputRef.current.value;
    const projectAdvancedAmountValue =
      projectAdvancedAmountInputRef.current.value;

    const newDate =
      (new Date(projectEndDateValue).valueOf() - new Date().valueOf()) *
      1000000;

    const date = new Date(projectEndDateValue);
    const cadence = `0 ${date.getMinutes()} ${
      date.getHours() - 1
    } ${date.getDate()} ${date.getMonth() + 1} *`;

    if (newDate < 0) {
      alert("End date must be in the future");
      return;
    }

    walletContext.contract
      .add_project(
        {
          goal: parseFloat(projectGoalValue),
          name: projectNameValue,
          description: projectDescriptionValue,
          plan: projectPlanValue,
          end_time: newDate,
          cadence,
          basic_supporter_amount: parseFloat(projectBasicAmountValue),
          intermediate_supporter_amount: parseFloat(
            projectIntermediateAmountValue
          ),
          advanced_supporter_amount: parseFloat(projectAdvancedAmountValue),
        },
        300000000000000
      )
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
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="datetime-local"
            id="endDate"
            ref={projectEndDateInputRef}
          />
        </div>
        <div>
          <h2 className="h2">Supporter Level Amounts</h2>
          <div className="form-group">
            <label htmlFor="basic-level">Basic Level</label>
            <input
              type="number"
              id="basic-level"
              ref={projectBasicAmountInputRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="intermediate-level">Intermediate Level</label>
            <input
              type="number"
              id="intermediate-level"
              ref={projectIntermediateAmountInputRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="advanced-level">Advanced Level</label>
            <input
              type="number"
              id="advanced-level"
              ref={projectAdvancedAmountInputRef}
            />
          </div>
        </div>
        <button className="btn" type="submit">
          Create Project
        </button>
      </form>
    </div>
  );
}

export default CreateProject;

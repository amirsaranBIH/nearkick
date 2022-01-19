import "./CreateProject.css";
import { useState, useRef, useContext } from "react";
import WalletContext from "../../../../store/wallet-context";
import * as IPFS from "ipfs-core";

function CreateProject() {
  const walletContext = useContext(WalletContext);
  const [errors, setErrors] = useState({});

  const [submitted, setSubmitted] = useState(false);
  const [projectImages, setProjectImages] = useState([]);

  const projectNameInputRef = useRef("");
  const projectDescriptionInputRef = useRef("");
  const projectGoalInputRef = useRef("");
  const projectPlanInputRef = useRef("OneTime");
  const projectEndDateInputRef = useRef("");
  const projectBasicAmountInputRef = useRef("");
  const projectIntermediateAmountInputRef = useRef("");
  const projectAdvancedAmountInputRef = useRef("");

  async function onSubmitHandler(e) {
    e.preventDefault();

    setSubmitted(true);

    const valid = verifyFormValues();

    if (!valid) {
      return;
    }

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
    const date = new Date(new Date(projectEndDateValue).valueOf() - 3600000);
    const cadence = `0 ${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${
      date.getMonth() + 1
    } *`;

    if (newDate < 0) {
      alert("End date must be in the future");
      return;
    }

    const ipfs = await IPFS.create();

    const imageCids = [];

    for (let i = 0; i < projectImages.length; i++) {
      const { path } = await ipfs.add(projectImages[i], {
        onlyHash: true,
      });
      imageCids.push(path);
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
          images: imageCids,
        },
        300000000000000
      )
      .then(async (res) => {
        for (let i = 0; i < projectImages.length; i++) {
          await ipfs.add(projectImages[i]);
        }
        console.log(res);
      });
  }

  function verifyFormValues() {
    const errorMessages = {};

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

    if (projectNameValue.length < 3) {
      errorMessages.name = "Project name must be at least 3 characters";
    }

    if (projectDescriptionValue.length < 100) {
      errorMessages.description =
        "Project description must be at least 100 characters";
    }

    if (projectGoalValue < 1) {
      errorMessages.goal = "Project goal must be at least 1";
    }

    if (projectPlanValue !== "OneTime" && projectPlanValue !== "Recurring") {
      errorMessages.plan = "Project plan must be either OneTime or Recurring";
    }

    if (projectEndDateValue.length < 1) {
      errorMessages.endDate = "Project end date must be set";
    }

    if (projectImages.length < 1) {
      errorMessages.images = "Project must have at least one image";
    }

    if (projectBasicAmountValue < 1) {
      errorMessages.basicAmount = "Project basic amount must be at least 1";
    }

    if (projectIntermediateAmountValue < 1) {
      errorMessages.intermediateAmount =
        "Project intermediate amount must be at least 1";
    }

    if (projectAdvancedAmountValue < 1) {
      errorMessages.advancedAmount =
        "Project advanced amount must be at least 1";
    }

    setErrors(errorMessages);

    return errorMessages.length === 0;
  }

  function onImageUploadHandler(e) {
    const images = Array.from(e.target.files);
    setProjectImages([...projectImages, ...images]);
    checkErrors();
  }

  function onImageRemoveHandler(index) {
    setProjectImages(projectImages.filter((_, i) => i !== index));
    checkErrors();
  }

  function hasErrors(field) {
    return errors[field] !== undefined;
  }

  function getError(field) {
    return errors[field];
  }

  function checkErrors() {
    if (submitted) {
      verifyFormValues();
    }
  }

  return (
    <div>
      <h1 className="h1">Create Project</h1>
      <form onSubmit={onSubmitHandler}>
        <div className={`form-group ${hasErrors("name") ? "input-error" : ""}`}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            ref={projectNameInputRef}
            onChange={checkErrors}
          />
          {hasErrors("name") && (
            <span className="error-message">{getError("name")}</span>
          )}
        </div>
        <div
          className={`form-group ${
            hasErrors("description") ? "input-error" : ""
          }`}
        >
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            ref={projectDescriptionInputRef}
            onChange={checkErrors}
          ></textarea>
          {hasErrors("description") && (
            <span className="error-message">{getError("description")}</span>
          )}
        </div>
        <div className={`form-group ${hasErrors("goal") ? "input-error" : ""}`}>
          <label htmlFor="goal">Goal (in yoctoⓃ)</label>
          <input
            type="number"
            id="goal"
            ref={projectGoalInputRef}
            onChange={checkErrors}
          />
          {hasErrors("goal") && (
            <span className="error-message">{getError("goal")}</span>
          )}
        </div>
        <div className={`form-group ${hasErrors("plan") ? "input-error" : ""}`}>
          <label htmlFor="plan">Plan</label>
          <select id="plan" ref={projectPlanInputRef} onChange={checkErrors}>
            <option value="OneTime">One Time</option>
            <option value="Recurring">Recurring</option>
          </select>
          {hasErrors("plan") && (
            <span className="error-message">{getError("plan")}</span>
          )}
        </div>
        <div
          className={`form-group ${hasErrors("endDate") ? "input-error" : ""}`}
        >
          <label htmlFor="endDate">End Date</label>
          <input
            type="datetime-local"
            id="endDate"
            ref={projectEndDateInputRef}
            onChange={checkErrors}
          />
          {hasErrors("endDate") && (
            <span className="error-message">{getError("endDate")}</span>
          )}
        </div>
        <div>
          <h2 className="h2">Images</h2>
          <div>
            <div
              className={`form-group ${
                hasErrors("images") ? "input-error" : ""
              }`}
            >
              <label htmlFor="image">Add up to five images</label>
              <input
                type="file"
                id="image"
                multiple
                accept=".png, .jpg, jpeg, .gif"
                onChange={onImageUploadHandler}
              />
              {hasErrors("images") && (
                <span className="error-message">{getError("images")}</span>
              )}
            </div>
            <ul className="project-image-preview-list">
              {projectImages.map((image, index) => (
                <li key={index}>
                  <span
                    className="remove-image"
                    onClick={() => {
                      onImageRemoveHandler(index);
                    }}
                  >
                    Remove
                  </span>
                  <img src={URL.createObjectURL(image)} alt="project preview" />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <h2 className="h2">Supporter Level Amounts</h2>
          <div
            className={`form-group ${
              hasErrors("basicAmount") ? "input-error" : ""
            }`}
          >
            <label htmlFor="basic-level">Basic Level (in yoctoⓃ)</label>
            <input
              type="number"
              id="basic-level"
              ref={projectBasicAmountInputRef}
              onChange={checkErrors}
            />
            {hasErrors("basicAmount") && (
              <span className="error-message">{getError("basicAmount")}</span>
            )}
          </div>
          <div
            className={`form-group ${
              hasErrors("intermediateAmount") ? "input-error" : ""
            }`}
          >
            <label htmlFor="intermediate-level">
              Intermediate Level (in yoctoⓃ)
            </label>
            <input
              type="number"
              id="intermediate-level"
              ref={projectIntermediateAmountInputRef}
              onChange={checkErrors}
            />
            {hasErrors("basicAmount") && (
              <span className="error-message">
                {getError("intermediateAmount")}
              </span>
            )}
          </div>
          <div
            className={`form-group ${
              hasErrors("advancedAmount") ? "input-error" : ""
            }`}
          >
            <label htmlFor="advanced-level">Advanced Level (in yoctoⓃ)</label>
            <input
              type="number"
              id="advanced-level"
              ref={projectAdvancedAmountInputRef}
              onChange={checkErrors}
            />
            {hasErrors("advancedAmount") && (
              <span className="error-message">
                {getError("advancedAmount")}
              </span>
            )}
          </div>
        </div>
        <button className="btn" type="submit" disabled={submitted}>
          Create Project
        </button>
      </form>
    </div>
  );
}

export default CreateProject;

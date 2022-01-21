import "./EditProject.css";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import WalletContext from "../../../../store/wallet-context";
import * as IPFS from "ipfs-core";

function EditProject() {
  const { id } = useParams();

  const walletContext = useContext(WalletContext);

  const [project, setProject] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (walletContext.wallet && walletContext.contract) {
      walletContext.contract
        .get_project({ project_id: parseInt(id, 10) })
        .then((res) => {
          setProject(res);
        });
    }
  }, [walletContext.contract, walletContext.wallet, id]);

  async function onSubmitHandler(e) {
    e.preventDefault();

    setSubmitted(true);

    const valid = verifyFormValues();

    if (!valid) {
      return;
    }

    const ipfs = await IPFS.create();

    const images = [];
    const newlyAddedImages = [];

    for (let i = 0; i < project.images.length; i++) {
      if (typeof project.images[i] !== "string") {
        const { path } = await ipfs.add(project.images[i], {
          onlyHash: true,
        });
        images.push(path);
        newlyAddedImages.push(path);
      } else {
        images.push(project.images[i]);
      }
    }

    walletContext.contract
      .update_project({
        project_id: parseInt(id, 10),
        goal: project.goal,
        name: project.name,
        description: project.description,
        plan: project.plan,
        basic_supporter_amount: project.level_amounts.Basic,
        intermediate_supporter_amount: project.level_amounts.Intermediate,
        advanced_supporter_amount: project.level_amounts.Advanced,
        images,
      })
      .then(async (res) => {
        for (let i = 0; i < newlyAddedImages.length; i++) {
          await ipfs.add(newlyAddedImages[i]);
        }
        console.log(res);
      });
  }

  function onNameChangeHandler(event) {
    setProject({ ...project, name: event.target.value });
    checkErrors();
  }

  function onDescriptionChangeHandler(event) {
    setProject({ ...project, description: event.target.value });
    checkErrors();
  }

  function onGoalChangeHandler(event) {
    setProject({ ...project, goal: Number(event.target.value) });
    checkErrors();
  }

  function onPlanChangeHandler(event) {
    setProject({ ...project, plan: event.target.value });
    checkErrors();
  }

  function onBasicAmountChangeHandler(event) {
    setProject({
      ...project,
      level_amounts: {
        ...project.level_amounts,
        Basic: Number(event.target.value),
      },
    });
    checkErrors();
  }

  function onIntermediateAmountChangeHandler(event) {
    setProject({
      ...project,
      level_amounts: {
        ...project.level_amounts,
        Intermediate: Number(event.target.value),
      },
    });
    checkErrors();
  }

  function onAdvancedAmountChangeHandler(event) {
    setProject({
      ...project,
      level_amounts: {
        ...project.level_amounts,
        Advanced: Number(event.target.value),
      },
    });
    checkErrors();
  }

  function onEndDateChangeHandler(event) {
    const newDate = new Date(event.target.value).valueOf() * 1000000;
    setProject({ ...project, end_time: newDate });
    checkErrors();
  }

  function onCancelProjectHandler() {
    walletContext.contract
      .cancel_project({ project_id: parseInt(id, 10) })
      .then((res) => {
        console.log(res);
      });
  }

  function calculateEndDate(endDateInNanoSec) {
    return new Date(endDateInNanoSec / 1000000).toISOString().split(".")[0];
  }

  function verifyFormValues() {
    const errorMessages = {};

    console.log(project);

    if (project.name.length < 3) {
      errorMessages.name = "Project name must be at least 3 characters";
    }

    if (project.name.length > 100) {
      errorMessages.name = "Project name must be 100 characters or less";
    }

    if (project.description.length < 100) {
      errorMessages.description =
        "Project description must be at least 100 characters";
    }

    if (project.description.length > 500) {
      errorMessages.description =
        "Project description must be 500 characters or less";
    }

    if (project.goal < 1) {
      errorMessages.goal = "Project goal must be at least 1";
    }

    if (project.plan !== "OneTime" && project.plan !== "Recurring") {
      errorMessages.plan = "Project plan must be either OneTime or Recurring";
    }

    if (project.end_time <= new Date().toISOString().slice(0, 16)) {
      errorMessages.endDate = "Project end date must be in the future";
    }

    if (project.end_time.length < 1) {
      errorMessages.endDate = "Project end date must be set";
    }

    if (project.images.length < 1) {
      errorMessages.images = "Project must have at least one image";
    }

    if (project.images.length > 5) {
      errorMessages.images = "Project can have a maximum of 5 images";
    }

    if (project.level_amounts.Basic < 1) {
      errorMessages.basicAmount = "Project basic amount must be at least 1";
    }

    if (project.level_amounts.Intermediate < 1) {
      errorMessages.intermediateAmount =
        "Project intermediate amount must be at least 1";
    }

    if (project.level_amounts.Advanced < 1) {
      errorMessages.advancedAmount =
        "Project advanced amount must be at least 1";
    }

    setErrors(errorMessages);

    return Object.keys(errorMessages).length === 0;
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

  function onImageUploadHandler(e) {
    setProject({
      ...project,
      images: [...project.images, ...Array.from(e.target.files)],
    });
  }

  function onImageRemoveHandler(index) {
    const newImages = project.images.filter((image, i) => i !== index);
    setProject({ ...project, images: newImages });
  }

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-project">
      <div className="heading">
        <h1 className="h1">Update Project</h1>
        <span className={`project-status ${project.status}`}>
          {project.status}
        </span>
      </div>
      <form onSubmit={onSubmitHandler}>
        <div className={`form-group ${hasErrors("name") ? "input-error" : ""}`}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={project.name}
            onInput={onNameChangeHandler}
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
            value={project.description}
            onInput={onDescriptionChangeHandler}
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
            value={project.goal}
            onInput={onGoalChangeHandler}
          />
          {hasErrors("goal") && (
            <span className="error-message">{getError("goal")}</span>
          )}
        </div>
        <div className={`form-group ${hasErrors("plan") ? "input-error" : ""}`}>
          <label htmlFor="plan">Plan</label>
          <select id="plan" value={project.plan} onInput={onPlanChangeHandler}>
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
            disabled
            value={calculateEndDate(project.end_time)}
            onChange={onEndDateChangeHandler}
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
              {project.images.map((image, index) => (
                <li key={index}>
                  <span
                    className="remove-image"
                    onClick={() => {
                      onImageRemoveHandler(index);
                    }}
                  >
                    Remove
                  </span>
                  <img
                    src={
                      typeof image === "string"
                        ? `https://ipfs.io/ipfs/${image}`
                        : URL.createObjectURL(image)
                    }
                    alt="project preview"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <h2 className="h2">Supporter Level Amounts</h2>
          <div className="level-amounts">
            <div
              className={`form-group ${
                hasErrors("basicAmount") ? "input-error" : ""
              }`}
            >
              <label htmlFor="basic-level">Basic Level (in yoctoⓃ)</label>
              <input
                type="number"
                id="basic-level"
                value={project.level_amounts.Basic}
                onInput={onBasicAmountChangeHandler}
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
                value={project.level_amounts.Intermediate}
                onInput={onIntermediateAmountChangeHandler}
              />
              {hasErrors("intermediateAmount") && (
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
                value={project.level_amounts.Advanced}
                onInput={onAdvancedAmountChangeHandler}
              />
              {hasErrors("advancedAmount") && (
                <span className="error-message">
                  {getError("advancedAmount")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="buttons">
          <button className="btn" type="submit">
            Update Project
          </button>
          {project.status === "Funding" && (
            <button
              className="btn btn--red"
              type="button"
              onClick={onCancelProjectHandler}
            >
              Cancel Project
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EditProject;

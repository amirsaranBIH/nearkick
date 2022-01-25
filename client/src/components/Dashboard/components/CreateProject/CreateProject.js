import "./CreateProject.css";
import { useState, useRef, useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import WalletContext from "../../../../store/wallet-context";
import LoadingContext from "../../../../store/loading-context";
import { create } from "ipfs-http-client";
import { useToasts } from "react-toast-notifications";

function CreateProject() {
  const { addToast } = useToasts();
  const walletContext = useContext(WalletContext);
  const loadingContext = useContext(LoadingContext);
  const [errors, setErrors] = useState({});

  const [createdProjectId, setCreatedProjectId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [projectImages, setProjectImages] = useState([]);

  const projectNameInputRef = useRef("");
  const projectDescriptionInputRef = useRef("");
  const projectGoalInputRef = useRef("");
  const projectPlanInputRef = useRef("OneTime");
  const projectEndDateInputRef = useRef("");
  const projectBasicAmountInputRef = useRef("");
  const projectIntermediateAmountInputRef = useRef("");
  const projectAdvancedAmountInputRef = useRef("");

  useEffect(() => {
    checkErrors();
  }, [projectImages]);

  async function onSubmitHandler(e) {
    e.preventDefault();

    setDirty(true);

    const valid = verifyFormValues();

    if (!valid) {
      console.log("Form is not valid");
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

    const ipfs = create({
      host: "ipfs.infura.io",
      port: "5001",
      protocol: "https",
    });

    const imageCids = [];

    for (let i = 0; i < projectImages.length; i++) {
      const { path } = await ipfs.add(projectImages[i], {
        onlyHash: true,
      });
      imageCids.push(path);
    }

    loadingContext.setLoading(true);

    walletContext.contract
      .add_project(
        {
          goal: Number(projectGoalValue),
          name: projectNameValue,
          description: projectDescriptionValue,
          plan: projectPlanValue,
          end_time: newDate,
          cadence,
          basic_supporter_amount: Number(projectBasicAmountValue),
          intermediate_supporter_amount: Number(projectIntermediateAmountValue),
          advanced_supporter_amount: Number(projectAdvancedAmountValue),
          images: imageCids,
        },
        300000000000000
      )
      .then(async (res) => {
        for (let i = 0; i < projectImages.length; i++) {
          await ipfs.add(projectImages[i]);
        }
        setCreatedProjectId(parseInt(res, 10));
        addToast("Successfully created project", {
          appearance: "success",
          autoDismiss: true,
        });
        loadingContext.setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        loadingContext.setLoading(false);
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

    if (projectNameValue.length > 100) {
      errorMessages.name = "Project name must be 100 characters or less";
    }

    if (projectDescriptionValue.length < 100) {
      errorMessages.description =
        "Project description must be at least 100 characters";
    }

    if (projectDescriptionValue.length > 500) {
      errorMessages.description =
        "Project description must be 500 characters or less";
    }

    if (projectGoalValue < 1) {
      errorMessages.goal = "Project goal must be at least 1";
    }

    if (projectPlanValue !== "OneTime" && projectPlanValue !== "Recurring") {
      errorMessages.plan = "Project plan must be either OneTime or Recurring";
    }

    if (projectEndDateValue <= new Date().toISOString().slice(0, 16)) {
      errorMessages.endDate = "Project end date must be in the future";
    }

    if (projectEndDateValue.length < 1) {
      errorMessages.endDate = "Project end date must be set";
    }

    if (projectImages.length < 1) {
      errorMessages.images = "Project must have at least one image";
    }

    if (projectImages.length > 5) {
      errorMessages.images = "Project can have a maximum of 5 images";
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

    return Object.keys(errorMessages).length === 0;
  }

  function onImageUploadHandler(e) {
    const images = Array.from(e.target.files);
    setProjectImages([...projectImages, ...images]);
  }

  function onImageRemoveHandler(index) {
    setProjectImages(projectImages.filter((_, i) => i !== index));
  }

  function hasErrors(field) {
    return errors[field] !== undefined;
  }

  function getError(field) {
    return errors[field];
  }

  function checkErrors() {
    if (dirty) {
      verifyFormValues();
    }
  }

  if (createdProjectId) {
    return <Navigate to={`/dashboard/edit-project/${createdProjectId}`} />;
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
          <label htmlFor="plan">
            Plan{" "}
            <span title="What type of subscription does your product or service provide?">
              &#x1F6C8;
            </span>
          </label>
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
                onInput={onImageUploadHandler}
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
        </div>
        <button className="btn" type="submit" disabled={loadingContext.loading}>
          Create Project
        </button>
      </form>
    </div>
  );
}

export default CreateProject;

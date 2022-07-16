import "./CreateProject.css";
import { useState, useRef, useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import WalletContext from "../../../../store/wallet-context";
import LoadingContext from "../../../../store/loading-context";
import { create } from "ipfs-http-client";
import { ToastContainer, toast } from "react-toastify";

function CreateProject() {
  const walletContext = useContext(WalletContext);
  const loadingContext = useContext(LoadingContext);
  const [errors, setErrors] = useState({});

  const [createdProjectId, setCreatedProjectId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [projectImages, setProjectImages] = useState([]);
  const [descriptionLength, setDescriptionLength] = useState(0);

  const projectNameInputRef = useRef(null);
  const projectDescriptionInputRef = useRef(null);
  const projectGoalInputRef = useRef(null);
  const projectPlanInputRef = useRef(null);
  const projectEndDateInputRef = useRef(null);
  const projectBasicAmountInputRef = useRef(null);
  const projectIntermediateAmountInputRef = useRef(null);
  const projectAdvancedAmountInputRef = useRef(null);

  const [goalInNear, setGoalInNear] = useState("0");
  const [basicAmountInNear, setBasicAmountInNear] = useState("0");
  const [intermediateAmountInNear, setIntermediateAmountInNear] = useState("0");
  const [advancedAmountInNear, setAdvancedAmountInNear] = useState("0");

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
    const date = new Date(new Date(projectEndDateValue).valueOf());
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
          goal: projectGoalValue,
          name: projectNameValue,
          description: projectDescriptionValue,
          plan: projectPlanValue,
          end_time: newDate,
          cadence,
          basic_supporter_amount: projectBasicAmountValue,
          intermediate_supporter_amount: projectIntermediateAmountValue,
          advanced_supporter_amount: projectAdvancedAmountValue,
          images: imageCids,
        },
        300000000000000
      )
      .then(async (res) => {
        for (let i = 0; i < projectImages.length; i++) {
          await ipfs.add(projectImages[i]);
        }
        setCreatedProjectId(parseInt(res, 10));
        toast.success("Successfully created project");
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

  function onGoalInputChange() {
    checkErrors();
    setGoalInNear(
      utils.format.formatNearAmount(projectGoalInputRef.current.value)
    );
  }

  function onBasicLevelInputChange() {
    checkErrors();
    setBasicAmountInNear(
      utils.format.formatNearAmount(projectBasicAmountInputRef.current.value)
    );
  }

  function onIntermediateLevelInputChange() {
    checkErrors();
    setIntermediateAmountInNear(
      utils.format.formatNearAmount(
        projectIntermediateAmountInputRef.current.value
      )
    );
  }

  function onAdvancedLevelInputChange() {
    checkErrors();
    setAdvancedAmountInNear(
      utils.format.formatNearAmount(projectAdvancedAmountInputRef.current.value)
    );
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
            onChange={(e) => {
              checkErrors(e);
              setDescriptionLength(e.target.value.length);
            }}
          ></textarea>
          <p className="description-length">
            {descriptionLength}/500 characters
          </p>
          {hasErrors("description") && (
            <span className="error-message">{getError("description")}</span>
          )}
        </div>
        <div className={`form-group ${hasErrors("goal") ? "input-error" : ""}`}>
          <label htmlFor="goal">Goal ({goalInNear}Ⓝ)</label>
          <input
            type="number"
            id="goal"
            ref={projectGoalInputRef}
            onChange={onGoalInputChange}
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
              <label htmlFor="basic-level">
                Basic Level ({basicAmountInNear}Ⓝ)
              </label>
              <input
                type="number"
                id="basic-level"
                ref={projectBasicAmountInputRef}
                onChange={onBasicLevelInputChange}
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
                Intermediate Level ({intermediateAmountInNear}Ⓝ)
              </label>
              <input
                type="number"
                id="intermediate-level"
                ref={projectIntermediateAmountInputRef}
                onChange={onIntermediateLevelInputChange}
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
              <label htmlFor="advanced-level">
                Advanced Level ({advancedAmountInNear}Ⓝ)
              </label>
              <input
                type="number"
                id="advanced-level"
                ref={projectAdvancedAmountInputRef}
                onChange={onAdvancedLevelInputChange}
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
      <ToastContainer />
    </div>
  );
}

export default CreateProject;

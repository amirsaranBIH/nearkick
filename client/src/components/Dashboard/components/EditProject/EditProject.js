import "./EditProject.css";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import WalletContext from "../../../../store/wallet-context";
import { create } from "ipfs-http-client";
import LoadingContext from "../../../../store/loading-context";
import { useToasts } from "react-toast-notifications";
import QrReader from "react-qr-reader";

function EditProject() {
  const { id } = useParams();

  const { addToast } = useToasts();
  const walletContext = useContext(WalletContext);
  const loadingContext = useContext(LoadingContext);

  const [project, setProject] = useState(null);
  const [errors, setErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [scanQrCode, setScanQrCode] = useState(false);

  useEffect(() => {
    if (walletContext.wallet && walletContext.contract) {
      walletContext.contract
        .get_project({ project_id: parseInt(id, 10) })
        .then((res) => {
          setProject(res);
        });
    }
  }, [walletContext.contract, walletContext.wallet, id]);

  useEffect(() => {
    checkErrors();
  }, [project]);

  async function onSubmitHandler(e) {
    e.preventDefault();

    setDirty(true);

    const valid = verifyFormValues();

    if (!valid) {
      return;
    }

    const ipfs = create({
      host: "ipfs.infura.io",
      port: "5001",
      protocol: "https",
    });

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

    loadingContext.setLoading(true);

    walletContext.contract
      .update_project({
        project_id: parseInt(id, 10),
        goal: Number(project.goal),
        name: project.name,
        description: project.description,
        plan: project.plan,
        basic_supporter_amount: Number(project.level_amounts.Basic),
        intermediate_supporter_amount: Number(
          project.level_amounts.Intermediate
        ),
        advanced_supporter_amount: Number(project.level_amounts.Advanced),
        images,
      })
      .then(async () => {
        for (let i = 0; i < newlyAddedImages.length; i++) {
          await ipfs.add(newlyAddedImages[i]);
        }
        addToast("Successfully updated project", {
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
        Advanced: Number(event.target.value),
      },
    });
  }

  function onEndDateChangeHandler(event) {
    const newDate = new Date(event.target.value).valueOf() * 1000000;
    setProject({ ...project, end_time: newDate });
  }

  function onCancelProjectHandler() {
    walletContext.contract
      .cancel_project({ project_id: parseInt(id, 10) })
      .then((res) => {
        console.log(res);
        addToast("Successfully canceled project", {
          appearance: "success",
          autoDismiss: true,
        });
      });
  }

  function calculateEndDate(endDateInNanoSec) {
    return new Date(endDateInNanoSec / 1000000).toISOString().split(".")[0];
  }

  function verifyFormValues() {
    const errorMessages = {};

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
    if (dirty) {
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

  function onQrReaderError(err) {
    alert(err);
  }

  function onQrReaderScan(result) {
    if (result !== null) {
      loadingContext.setLoading(true);
      setScanQrCode(false);
      walletContext.contract
        .verify_supporter_on_project({
          project_id: parseInt(id, 10),
          supporter_id: result,
        })
        .then((res) => {
          if (res) {
            addToast(`${result} is a supporter!`, {
              appearance: "success",
              autoDismiss: true,
            });
          } else {
            addToast(`${result} is NOT a supporter!`, {
              appearance: "error",
              autoDismiss: true,
            });
          }
          loadingContext.setLoading(false);
        })
        .catch((err) => {
          let errorMessage = err.kind.ExecutionError;
          if (!errorMessage) {
            errorMessage = "Failed to verify supporter";
          }
          addToast(errorMessage, {
            appearance: "error",
            autoDismiss: true,
          });
          loadingContext.setLoading(false);
        });
    }
  }

  function showQrCodeScanner() {
    setScanQrCode(true);
  }

  function hideQrCodeScanner() {
    setScanQrCode(false);
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
          <p className="description-length">
            {project.description.length}/500 characters
          </p>
          {hasErrors("description") && (
            <span className="error-message">{getError("description")}</span>
          )}
        </div>
        <div className={`form-group ${hasErrors("goal") ? "input-error" : ""}`}>
          <label htmlFor="goal">Goal (in yocto???)</label>
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
          <label htmlFor="plan">
            Plan{" "}
            <span title="What type of subscription does your product or service provide?">
              &#x1F6C8;
            </span>
          </label>
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
              <label htmlFor="basic-level">Basic Level (in yocto???)</label>
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
                Intermediate Level (in yocto???)
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
              <label htmlFor="advanced-level">Advanced Level (in yocto???)</label>
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
          <button
            className="btn"
            type="submit"
            disabled={loadingContext.loading}
          >
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
      <div className="verify-supporters">
        <h2>Verify Supporters</h2>
        {!scanQrCode && (
          <button className="btn" type="button" onClick={showQrCodeScanner}>
            Scan QR Code
          </button>
        )}
        {scanQrCode && (
          <div>
            <button
              className="btn stop-scanning-btn"
              type="button"
              onClick={hideQrCodeScanner}
            >
              Cancel
            </button>
            <QrReader
              delay={300}
              onError={onQrReaderError}
              onScan={onQrReaderScan}
              style={{
                width: "100%",
                position: "fixed",
                top: 0,
                left: 0,
                height: "100vh",
                backgroundColor: "black",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default EditProject;

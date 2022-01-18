import "./CreateProject.css";
import { useState, useRef, useContext } from "react";
import WalletContext from "../../../../store/wallet-context";
import * as IPFS from "ipfs-core";

function CreateProject() {
  const walletContext = useContext(WalletContext);

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

    setSubmitted(true);

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

  function onImageUploadHandler(e) {
    setProjectImages(Array.from(e.target.files));
  }

  function onImageRemoveHandler(index) {
    console.log(index);
    setProjectImages(projectImages.filter((_, i) => i !== index));
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
          <label htmlFor="goal">Goal (in yoctoⓃ)</label>
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
          <h2 className="h2">Images</h2>
          <div>
            <div className="form-group">
              <label htmlFor="image">Add up to five images</label>
              <input
                type="file"
                id="image"
                multiple
                accept=".png, .jpg, jpeg, .gif"
                onChange={onImageUploadHandler}
              />
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
          <div className="form-group">
            <label htmlFor="basic-level">Basic Level (in yoctoⓃ)</label>
            <input
              type="number"
              id="basic-level"
              ref={projectBasicAmountInputRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="intermediate-level">
              Intermediate Level (in yoctoⓃ)
            </label>
            <input
              type="number"
              id="intermediate-level"
              ref={projectIntermediateAmountInputRef}
            />
          </div>
          <div className="form-group">
            <label htmlFor="advanced-level">Advanced Level (in yoctoⓃ)</label>
            <input
              type="number"
              id="advanced-level"
              ref={projectAdvancedAmountInputRef}
            />
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

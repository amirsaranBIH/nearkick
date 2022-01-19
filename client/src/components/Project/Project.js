import "./Project.css";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import WalletContext from "../../store/wallet-context";
import { CONTRACT_ADDRESS } from "../../config";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

function Project() {
  const walletContext = useContext(WalletContext);

  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [supporterLevel, setSupporterLevel] = useState("Basic");

  useEffect(() => {
    if (walletContext.wallet && walletContext.contract) {
      walletContext.contract
        .get_project({ project_id: parseInt(id, 10) })
        .then((res) => {
          setProject(res);
          console.log(res);
        });
    }
  }, [walletContext.contract, walletContext.wallet, id]);

  function supportProject() {
    if (!walletContext.isSignedIn) {
      walletContext.wallet.requestSignIn(CONTRACT_ADDRESS, "Nearkick");
    } else {
      walletContext.contract
        .add_supporter_to_project(
          {
            project_id: parseInt(id, 10),
            level: supporterLevel,
          },
          300000000000000,
          project.level_amounts[supporterLevel]
        )
        .then((res) => {
          console.log(res);
        });
    }
  }

  function calculateEndDate(endDateInNanoSec) {
    return new Date(endDateInNanoSec / 1000000).toDateString();
  }

  function onSupporterLevelChangeHandler(event) {
    setSupporterLevel(event.target.value);
  }

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="h1">{project.name}</h1>
      <div className="project-details">
        <div className="project-details-first">
          <div className="project-images">
            <Carousel showArrows={true} showStatus={false}>
              {project.images.map((image, index) => (
                <div key={index}>
                  <img
                    src={`https://ipfs.io/ipfs/${image}`}
                    alt={project.name}
                  />
                </div>
              ))}
            </Carousel>
            {/* <span className="project-image-control project-image-control-previous">
              Previous
            </span>
            <span className="project-image-control  project-image-control-next">
              Next
            </span> */}
          </div>
          <p>
            <b>About Project:</b>
          </p>
          <p className="project-description">{project.description}</p>
        </div>
        <div className="project-details-second">
          <p>
            <b>End Date:</b> {calculateEndDate(project.end_time)}
          </p>
          <p>
            <b>Owner Account:</b> {project.owner}
          </p>
          <p>
            <b>Gathered:</b> {project.balance} yoctoⓃ
          </p>
          <p>
            <b>Goal:</b> {project.goal} yoctoⓃ
          </p>
          <p>
            <b>Plan:</b> {project.plan}
          </p>
          <p>
            <b>Status:</b> {project.status}
          </p>
        </div>
      </div>
      <p>
        <b>Supporters:</b>
      </p>
      <ul className="project-supporters">
        {Object.entries(project.supporters).length > 0 ? (
          Object.entries(project.supporters).map(([key, value]) => (
            <li key={key} className={`project-supporter-level-${value.level}`}>
              {key}
            </li>
          ))
        ) : (
          <div>No supporters yet.</div>
        )}
      </ul>
      <div>
        {project.supporters[walletContext.wallet.getAccountId()] ? (
          <p>You are a supporter for this project!</p>
        ) : (
          <div>
            <div className="form-group">
              <label htmlFor="type">Supporter Type</label>
              <select
                id="type"
                value={supporterLevel}
                onChange={onSupporterLevelChangeHandler}
              >
                {Object.keys(project.level_amounts).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn" type="button" onClick={supportProject}>
              Become a Supporter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Project;

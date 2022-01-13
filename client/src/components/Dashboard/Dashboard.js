import "./Dashboard.css";
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import WalletContext from "../../store/wallet-context";

function Dashboard() {
  const walletContext = useContext(WalletContext);

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (walletContext.wallet && walletContext.contract) {
      walletContext.contract
        .get_all_projects_by_owner({
          owner: walletContext.wallet.getAccountId(),
        })
        .then((res) => {
          console.log(res);
          setProjects(res);
        });
    }
  }, [walletContext.contract, walletContext.wallet]);

  function calculateEndDate(endDateInNanoSec) {
    return new Date(endDateInNanoSec / 1000000).toDateString();
  }

  function parseDescriptionWithDots(description) {
    if (description.length > 300) {
      return description.substring(0, 300).trim() + "...";
    } else {
      return description;
    }
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>Logged in as {walletContext.wallet.getAccountId()}</h1>
        </div>
        <div>
          <Link to="/dashboard/create-project">
            <button className="btn" type="button">
              Create New Project
            </button>
          </Link>
        </div>
      </div>
      <div className="dashboard-projects">
        <ul>
          {projects.map((project) => (
            <li key={project.name}>
              <Link to={"/dashboard/edit-project/" + project.id}>
                <div className="dashboard-project">
                  <div className="dashboard-project-details">
                    <div className="dashboard-project-details-first">
                      <h2>{project.name}</h2>
                      <p>{parseDescriptionWithDots(project.description)}</p>
                    </div>
                    <div className="dashboard-project-details-second">
                      <p>
                        <b>End Date:</b> {calculateEndDate(project.end_time)}
                      </p>
                      <p>
                        <b>Owner Account:</b> {project.owner}
                      </p>
                      <p>
                        <b>Progress: </b>
                        {Math.ceil(project.balance / project.goal) * 100}%
                      </p>
                      <p>
                        <b>Status:</b> {project.status}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;

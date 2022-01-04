import "./Dashboard.css";
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import WalletContext from "../../store/wallet-context";

function Dashboard() {
  const walletContext = useContext(WalletContext);

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (walletContext.wallet && walletContext.contract) {
      walletContext.contract.get_all_projects().then((res) => {
        console.log(res);
        setProjects(res);
      });
    }
  }, [walletContext.contract, walletContext.wallet]);

  function calculateEndDate(endDateInNanoSec) {
    return new Date(endDateInNanoSec / 1000000).toISOString();
  }

  return (
    <div>
      <h1>{walletContext.wallet.getAccountId()}</h1>
      <div className="dashboard-projects">
        <ul>
          {projects.map((project) => (
            <li key={project.name}>
              <Link to={"/dashboard/edit-project/" + project.id}>
                {project.name}
              </Link>
              <p>{project.description}</p>
              <p>
                <span>{calculateEndDate(project.end_time)}</span> -{" "}
                <span>
                  {project.goal}/{project.balance}
                </span>
              </p>
            </li>
          ))}
        </ul>
      </div>
      <Link to="/dashboard/create-project">
        <button className="btn" type="button">
          Create Project
        </button>
      </Link>
    </div>
  );
}

export default Dashboard;

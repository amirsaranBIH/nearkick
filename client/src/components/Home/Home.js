import "./Home.css";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import WalletContext from "../../store/wallet-context";

function Home() {
  const walletContext = useContext(WalletContext);

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (walletContext.wallet && walletContext.contract) {
      walletContext.contract.get_all_projects().then((res) => {
        setProjects(res);
      });
    }
  }, [walletContext.contract, walletContext.wallet]);

  function calculateEndDate(endDateInNanoSec) {
    return new Date(endDateInNanoSec / 1000000).toISOString();
  }

  return (
    <div>
      <h1 className="h1">Projects</h1>
      <div className="home-projects">
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link to={"/project/" + project.id}>{project.name}</Link>
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
    </div>
  );
}

export default Home;

import "./Home.css";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import WalletContext from "../../store/wallet-context";

function Home() {
  const walletContext = useContext(WalletContext);

  const [allProjects, setAllProjects] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (walletContext.wallet && walletContext.contract) {
      walletContext.contract.get_all_projects().then((res) => {
        console.log(res);
        setAllProjects(res);
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

  function onProjectSearchHandler(event) {
    const searchTerm = event.target.value.toLowerCase();
    setProjects(
      allProjects.filter((project) => {
        return project.name.toLowerCase().includes(searchTerm);
      })
    );
  }

  return (
    <div>
      <div className="search-projects">
        <h1 className="h1">Find a Project To Support</h1>
        <div className="form-group">
          <input
            type="search"
            placeholder="Search"
            onInput={onProjectSearchHandler}
          />
        </div>
      </div>
      <div className="home-projects">
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <Link to={"/project/" + project.id}>
                <div className="home-project">
                  <div className="home-project-details">
                    <div className="home-project-details-first">
                      <h2>{project.name}</h2>
                      <p>{parseDescriptionWithDots(project.description)}</p>
                    </div>
                    <div className="home-project-details-second">
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

export default Home;

import "./Project.css";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import WalletContext from "../../store/wallet-context";

function Project() {
  const walletContext = useContext(WalletContext);

  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (walletContext.wallet && walletContext.contract) {
      walletContext.contract
        .get_project({ project_id: parseInt(id, 10) })
        .then((res) => {
          setProject(res);
        });
    }
  }, [walletContext.contract, walletContext.wallet]);

  function supportProject() {
    if (!walletContext.isSignedIn) {
      walletContext.wallet.requestSignIn(
        "second.amirsaran2.testnet",
        "Nearkick"
      );
    } else {
      walletContext.contract.get_num().then((res) => {
        console.log(res);
      });
    }
  }

  function calculateEndDate(endDateInNanoSec) {
    return new Date(endDateInNanoSec / 1000000).toISOString();
  }

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      <hr />
      <p>End Date: {calculateEndDate(project.end_time)}</p>
      <p>Owner: {project.owner}</p>
      <p>Goal: {project.goal}</p>
      <p>Plan: {project.plan}</p>
      <p>Status: {project.status}</p>
      <p>Supporters: {Object.keys(project.supporters).length}</p>
      <hr />
      <button className="btn" type="button" onClick={supportProject}>
        Become a Supporter
      </button>
    </div>
  );
}

export default Project;

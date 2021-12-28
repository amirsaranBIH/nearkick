import "./Project.css";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { HOST } from "../../config";
import WalletContext from "../../store/wallet-context";

function Project() {
  const walletContext = useContext(WalletContext);

  const { id } = useParams();
  const [project, setProject] = useState([]);

  useEffect(() => {
    axios.get("/api/projects/" + id).then((res) => {
      setProject(res.data.data);
    });
  }, [id]);

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

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{project.name}</h1>
      <p>{project.description}</p>
      <img src={HOST + "/" + project.image} alt={project.name} />
      <button type="button" onClick={supportProject}>
        Support
      </button>
    </div>
  );
}

export default Project;

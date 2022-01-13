import "./Home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <div className="cta">
        <h1>Nearkick</h1>
        <p>
          Nearkick is a decentralized application that allows you to create and
          kickstart your own projects.
        </p>
        <Link to="/projects">
          <button className="btn" type="button">
            Find a Project
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Home;

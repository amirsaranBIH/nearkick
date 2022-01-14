import "./Home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <div className="cta">
        <div>
          <img
            src="/people-networking-through-technology.jpg"
            alt="Pepople networking through technology"
          />
        </div>
        <p>
          Nearkick is a decentralized kickstarter app that allows you to
          kickstart your own projects or fund existing ones.
        </p>
        <div className="buttons">
          <Link to="/projects">
            <button className="btn" type="button">
              Find a Project
            </button>
          </Link>
          <Link to="/about">
            <button className="btn" type="button">
              About Nearkick
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;

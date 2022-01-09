import "./Home.css";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <div className="cta">
        <h1>Nearkick</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. In nisi
          felis, ullamcorper et leo non, posuere maximus velit. Curabitur a
          tortor vel justo pellentesque tempus.
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

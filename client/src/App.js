import "./App.css";
import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./components/Home/Home";
import Projects from "./components/Projects/Projects";
import About from "./components/About/About";
import Dashboard from "./components/Dashboard/Dashboard";
import Project from "./components/Project/Project";
import CreateProject from "./components/Dashboard/components/CreateProject/CreateProject";
import EditProject from "./components/Dashboard/components/EditProject/EditProject";

import WalletContext from "./store/wallet-context";
import LoadingContext from "./store/loading-context";

import Header from "./components/Header/Header";

function App() {
  const walletContext = useContext(WalletContext);
  const loadingContext = useContext(LoadingContext);

  return (
    <Router>
      <div>
        <Header />
        {loadingContext.loading && (
          <div className="loading">
            <div className="loading-bar"></div>
          </div>
        )}
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/about" element={<About />} />
            <Route path="/project/:id" element={<Project />} />
            <Route
              path="/dashboard"
              element={
                walletContext.isSignedIn ? <Dashboard /> : <Navigate to="/" />
              }
            />
            <Route
              path="/dashboard/create-project"
              element={
                walletContext.isSignedIn ? (
                  <CreateProject />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/dashboard/edit-project/:id"
              element={
                walletContext.isSignedIn ? <EditProject /> : <Navigate to="/" />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

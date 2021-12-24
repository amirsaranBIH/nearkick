import "./Register.css";
import { useContext, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import AuthUserContext from "../../store/auth-user-context";
import { HOST } from "../../config";

function Register() {
  console.log(HOST);
  const authUserContext = useContext(AuthUserContext);

  const [redirectToHome, setRedirectToHome] = useState(false);
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  function onSubmitHandler(e) {
    e.preventDefault();

    const emailValue = emailInputRef.current.value;
    const passwordValue = passwordInputRef.current.value;

    axios
      .post("/api/auth/register", {
        email: emailValue,
        password: passwordValue,
      })
      .then((res) => {
        setRedirectToHome(true);
        axios
          .get("/api/auth/user")
          .then((res) => {
            if (res.status === 200) {
              authUserContext.setUser(res.data.data);
              authUserContext.setIsAuthenticated(true);
            } else {
              authUserContext.setUser(null);
              authUserContext.setIsAuthenticated(false);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (redirectToHome) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={onSubmitHandler}>
        <div className="form-group">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            className="form-control"
            id="email"
            ref={emailInputRef}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            ref={passwordInputRef}
          />
        </div>
        <button type="submit" className="btn">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;

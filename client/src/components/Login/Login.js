import "./Login.css";
import { useRef, useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import AuthUserContext from "../../store/auth-user-context";

function Login() {
  const authUserContext = useContext(AuthUserContext);

  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const [redirectToHome, setRedirectToHome] = useState(false);

  function onSubmitHandler(e) {
    e.preventDefault();

    const emailValue = emailInputRef.current.value;
    const passwordValue = passwordInputRef.current.value;

    axios
      .post("http://localhost:3001/api/auth/login", {
        email: emailValue,
        password: passwordValue,
      })
      .then((res) => {
        setRedirectToHome(true);
        axios
          .get("http://localhost:3001/api/auth/user")
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
        console.log(res);
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
      <h1>Login</h1>
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
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;

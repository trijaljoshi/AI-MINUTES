import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import axios from "axios";

function Login() {

  const navigate = useNavigate();

  const [option, setOption] = useState("");

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register State
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");

  // Email Validation Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---------------- LOGIN ----------------

  async function loginUser() {

    if (loginEmail.trim() === "") {
      alert("Please enter your email.");
      return;
    }

    if (!emailRegex.test(loginEmail)) {
      alert("Please enter a valid email.");
      return;
    }

    if (loginPassword.trim() === "") {
      alert("Please enter your password.");
      return;
    }

    try {

      const response = await axios.post(
        "https://project-wt9v.onrender.com/api/auth/login",
        {
          email: loginEmail,
          password: loginPassword
        }
      );

      // Save JWT Token
      localStorage.setItem("token", response.data.token);

      

      navigate("/home", {
        state: {
          username: response. data.user.name
        }
      });

    }

    catch (error) {

      alert(error.response?.data?.message || "Login Failed");

    }

  }

  // ---------------- REGISTER ----------------

  const registerUser = async() => {

    if (registerName.trim() === "") {
      alert("Please enter your name.");
      return;
    }

    if (registerEmail.trim() === "") {
      alert("Please enter your email.");
      return;
    }

    if (!emailRegex.test(registerEmail)) {
      alert("Please enter a valid email.");
      return;
    }

    if (registerPassword.trim() === "") {
      alert("Please enter your password.");
      return;
    }

    if (registerPassword.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    try {
      console.log("registerName", registerName,registerEmail,registerPassword)
    await axios.post(
        "https://project-wt9v.onrender.com/api/auth/register",
        {
          name: registerName,
          email: registerEmail,
          password: registerPassword
        }
      ).then((res)=> {
        console.log("res", res.data)
         
        navigate("/home", {
          state: {
            username: registerName
          }
        });
      })
    }

    catch (error) {

      alert(error.response?.data?.message || "Registration Failed");

    }

  }

  return (

    <div className="login-page">

      <div className="header">
        <Header />
        <hr />
      </div>

      <div className="login-card">

        <h2>Welcome Back 👋</h2>

        <p>
          Generate meeting minutes automatically using AI
        </p>

        <button
          className="button"
          onClick={() => setOption("login")}
        >
          Login
        </button>

        <button
          className="button"
          onClick={() => setOption("register")}
        >
          Register
        </button>

        <br /><br />

        {/* LOGIN FORM */}

        {option === "login" && (

          <div>

            <input
              type="email"
              placeholder="Enter Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />

            <br /><br />

            <input
              type="password"
              placeholder="Enter Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />

            <br /><br />

            <button
              className="button"
              onClick={loginUser}
            >
              Login
            </button>

          </div>

        )}

        {/* REGISTER FORM */}

        {option === "register" && (

          <div>

            <input
              type="text"
              placeholder="Enter Name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
            />

            <br /><br />

            <input
              type="email"
              placeholder="Enter Email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
            />

            <br /><br />

            <input
              type="password"
              placeholder="Set Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
            />

            <br /><br />

            <button
              className="button"
              onClick={() => registerUser()}
            >
              Register
            </button>

          </div>

        )}

      </div>

    </div>

  );

}

export default Login;
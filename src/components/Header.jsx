import { FaRobot } from "react-icons/fa";

function Header() {
  return (
    <div className="header">

      <div className="header-left">

        <div className="logo-box">
          <FaRobot className="logo-icon" />
        </div>

        <div className="header-text">
          <h1>AI MINUTES OF MEETING</h1>
          <p>Smart Meeting Assistant</p>
        </div>

      </div>

      <div className="header-right">
        <FaRobot className="robot-icon" />
      </div>

    </div>
  );
}

export default Header;
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";

function Home() {

  const navigate = useNavigate();
  const location = useLocation();

  const username = location.state?.username || "User";

  const [showForm, setShowForm] = useState(false);
  const [showMeetingButton, setShowMeetingButton] = useState(false);

  const [members, setMembers] = useState([
    {
      name: "",
      email: ""
    }
  ]);

  function addMember() {

    // Maximum members allowed
    if (members.length >= 20) {
      alert("Maximum 20 members allowed.");
      return;
    }

    const lastMember = members[members.length - 1];

    if (
      lastMember.name.trim() === "" ||
      lastMember.email.trim() === ""
    ) {
      alert("Please complete the current member details first.");
      return;
    }

    setMembers([
      ...members,
      {
        name: "",
        email: ""
      }
    ]);

  }

  function handleChange(index, field, value) {

    const updatedMembers = [...members];

    updatedMembers[index][field] = value;

    setMembers(updatedMembers);

  }

  function submitMembers() {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let member of members) {

      if (
        member.name.trim() === "" ||
        member.email.trim() === ""
      ) {
        alert("Please fill all member details.");
        return;
      }

      if (!emailRegex.test(member.email)) {
        alert("Please enter a valid email address.");
        return;
      }

    }

    // Check duplicate emails
    const emails = members.map(member => member.email);

    const uniqueEmails = new Set(emails);

    if (emails.length !== uniqueEmails.size) {
      alert("Duplicate email addresses are not allowed.");
      return;
    }

    console.log("Members:", members);

    setShowForm(false);

    setShowMeetingButton(true);

  }

  return (

    <div className="page">

      <div className="header">
        <Header />
        <hr />
      </div>

      <div className="page-card">

        <h2>Welcome {username} 👋</h2>

        <p>
          Add meeting participants to begin your meeting.
        </p>

        {!showForm && (

          <button
            className="button"
            onClick={() => setShowForm(true)}
          >
            Add Members
          </button>

        )}

        {showForm && (

          <div>

            {members.map((member, index) => (

              <div
                key={index}
                className="member-box"
              >

                <input
                  type="text"
                  placeholder={`Member ${index + 1} Name`}
                  value={member.name}
                  onChange={(e) =>
                    handleChange(index, "name", e.target.value)
                  }
                />

                <input
                  type="email"
                  placeholder={`Member ${index + 1} Email`}
                  value={member.email}
                  onChange={(e) =>
                    handleChange(index, "email", e.target.value)
                  }
                />

                <br /><br />

              </div>

            ))}

            <button
              className="button add-button"
              onClick={addMember}
            >
              + Add Member
            </button>

            <button
              className="button submit-button"
              onClick={submitMembers}
            >
              Submit
            </button>

          </div>

        )}

        {showMeetingButton && (

          <button
            className="button start-button"
            onClick={() =>
              navigate("/meeting", {
                state: {
                  username: username,
                  members: members
                }
              })
            }
          >
            Start Meeting
          </button>

        )}

      </div>

    </div>

  );

}

export default Home;
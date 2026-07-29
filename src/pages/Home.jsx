import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const username = location.state?.username || "User";
  const email = location.state?.email || "";

  const [title, setTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showMeetingButton, setShowMeetingButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meetingId, setMeetingId] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");

  const [members, setMembers] = useState([
    {
      name: "",
      email: "",
    },
  ]);

  function addMember() {
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
        email: "",
      },
    ]);
  }

  function handleChange(index, field, value) {
    const updatedMembers = [...members];
    updatedMembers[index][field] = value;
    setMembers(updatedMembers);
  }

  async function submitMembers() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (title.trim() === "") {
      alert("Please enter meeting title.");
      return;
    }

    for (let member of members) {
      if (
        member.name.trim() === "" ||
        member.email.trim() === ""
      ) {
        alert("Please fill all member details.");
        return;
      }

      if (!emailRegex.test(member.email)) {
        alert("Please enter valid email.");
        return;
      }
    }

    const emails = members.map((m) =>
      m.email.trim().toLowerCase()
    );

    if (emails.length !== new Set(emails).size) {
      alert("Duplicate email addresses are not allowed.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "https://project-wt9v.onrender.com/api/meeting",
        {
          title,
          members,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMeetingId(response.data.meetingId);
      setMeetingLink(response.data.meetingLink);
      setShowForm(false);
      setShowMeetingButton(true);

  
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to create meeting."
      );
    } finally {
      setLoading(false);
    }
  }

  function startMeeting() {
    navigate(`/meeting/${meetingId}`, {
      state: {
        username,
        email,
        role: "host",
        title,
      },
    });

  }return (
    <div className="page">
      <div className="header">
        <Header />
      </div>

      <div className="page-card">
        <h2>Welcome {username} 👋</h2>

        <p>Add meeting participants to begin your meeting.</p>

        <input
          type="text"
          className="meeting-title-input"
          placeholder="Enter Meeting Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />
        <br />

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
                    handleChange(
                      index,
                      "name",
                      e.target.value
                    )
                  }
                />

                <input
                  type="email"
                  placeholder={`Member ${index + 1} Email`}
                  value={member.email}
                  onChange={(e) =>
                    handleChange(
                      index,
                      "email",
                      e.target.value
                    )
                  }
                />

                <br />
                <br />
              </div>
            ))}

            <button
              className="button add-button"
              onClick={addMember}
              disabled={loading}
            >
              + Add Member
            </button>

            <button
              className="button submit-button"
              onClick={submitMembers}
              disabled={loading}
            >
              {loading ? "Creating..." : "Submit"}
            </button>
          </div>
        )}
        {meetingLink && (
  <div style={{ marginTop: "20px" }}>
    <h3>Meeting Link</h3>

    <input
      type="text"
      value={meetingLink}
      readOnly
    />

    <br />
    <br />

    <button
      className="button"
      onClick={() => {
        navigator.clipboard.writeText(meetingLink);
        alert("Meeting link copied!");
      }}
    >
      Copy Link
    </button>
  </div>
)}

        {showMeetingButton && (
          <button
            className="button start-button"
            onClick={startMeeting}
          >
            Start Meeting
          </button>
        )}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loader-box">
            <div className="spinner"></div>

            <h3>Creating Meeting...</h3>

            <p>Please wait while invitations are being sent.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
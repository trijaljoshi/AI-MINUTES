import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Control from "../components/Control";
import socket from "../socket";

function Meeting() {
  const navigate = useNavigate();
  const location = useLocation();
  const { meetingId } = useParams();

  const username = location.state?.username || "";
  const title = location.state?.title || "AI MINUTES OF MEETING";

  const [email, setEmail] = useState(location.state?.email || "");
  const [role, setRole] = useState(location.state?.role || "guest");

  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    socket.emit("join-meeting", meetingId);
  
    socket.on("transcript", (data) => {
      setTranscript((prev) => {
        if (!prev) {
          return `${data.speaker}: ${data.text}`;
        }
  
        return `${prev}\n${data.speaker}: ${data.text}`;
      });
    });
  
    return () => {
      socket.off("transcript");
    };
  }, [meetingId]);
  

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Host entered from Home page
    if (role === "host") {
      setLoading(false);
      return;
    }

    // User not logged in
    if (!token) {
      navigate(`/login?meetingId=${meetingId}`);
      return;
    }

    // Logged in user
    setLoading(false);
  }, [meetingId, navigate, role]);

  const joinMeeting = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `https://project-wt9v.onrender.com/api/meeting/${meetingId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRole("participant");
      setEmail(response.data.member.email);

      alert("Joined successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to join meeting");
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="page">
      <div className="header">
        <Header />
      </div>

      <div className="page-card">
        <h2>Meeting Title: {title}</h2>

        {username && (
          <p>
            <strong>Host:</strong> {username}
          </p>
        )}

        <p>
          <strong>Meeting ID:</strong> {meetingId}
        </p>

        {role === "guest" && (
          <button className="button" onClick={joinMeeting}>
            Join Meeting
          </button>
        )}

        {role !== "guest" && (
          <>
            <Control
              role={role}
              email={email}
              meetingId={meetingId}
              transcript={transcript}
              setTranscript={setTranscript}
            />

            <br />

            <textarea
              rows={10}
              cols={70}
              value={transcript}
              readOnly
              placeholder="Transcript will appear here..."
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Meeting;
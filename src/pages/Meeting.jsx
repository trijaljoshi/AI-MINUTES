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
  const [name, setName] = useState(location.state?.username || "");
  const [role, setRole] = useState(location.state?.role || "guest");

  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  useEffect(() => {
    if (role === "guest") return;
  
    socket.emit("join-meeting", {
      meetingId,
      name,
      role,
      email,
    });
    
  
    socket.on("participants-updated", (list) => {
      setParticipants(list);
    });
  
    return () => {
      socket.off("participants-updated");
    };
  }, [role, meetingId, name, email]);
  useEffect(() => {

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
      setName(response.data.member.name);

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
            <div className="participants">
    <h3>Participants ({participants.length})</h3>

    {participants.map((p) => (
        <div key={p.socketId}>
            👤 {p.name}
        </div>
    ))}
</div>
          </>
          
        )}
      </div>
    </div>
  );
}

export default Meeting;
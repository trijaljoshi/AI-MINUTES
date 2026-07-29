import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Header from "../components/Header";
import Control from "../components/Control";

function Meeting() {
  const location = useLocation();
  const { meetingId } = useParams();

  const username = location.state?.username || "";
  const email = location.state?.email || "";
  const role = location.state?.role || "guest";
  const title = location.state?.title || "AI MINUTES OF MEETING";

  const [transcript, setTranscript] = useState("");

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
      </div>
    </div>
  );
}

export default Meeting;
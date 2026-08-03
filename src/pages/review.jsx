import { Navigate } from "react-router-dom";

function startMeeting() {
    navigate(`/meeting/${meetingId}`, {
      state: {
        username,
        email,
        role: "host",
        title,
      },
    });
}

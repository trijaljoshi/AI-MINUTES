import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";
import { APP_ID } from "../config";
import client from "../agora";
import { decodeSTT } from "../pages/utils/decodeSTT";
import socket from "../socket";
function Control({
  role,
  email,
  meetingId,
  transcript,
  setTranscript,
})  {
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const microphoneTrack = useRef(null);
  const joining = useRef(false);
  const channelRef = useRef("");
  const uidRef = useRef(null);
  const agentIdRef = useRef("");

  async function handleStreamMessage(uid, data) {
    try {
      const decoded = await decodeSTT(data);
  
      console.log("WORDS:", decoded.words);
  
      const words = decoded.words || [];
  
      words.forEach((word) => {
        if (word.isFinal || word.is_final) {
  
          console.log("FINAL WORD:", word.text);
  
          // Send transcript to everyone in this meeting
          console.log("🚀 SENDING TRANSCRIPT:", {
            meetingId,
            text: word.text,
          });
          
          socket.emit("transcript", {
            meetingId,
            text: word.text,
          });
  
          // Update this user's own transcript
          setTranscript((prev) => {
            if (!prev) {
              return word.text;
            }
  
            if (prev.endsWith(word.text)) {
              return prev;
            }
  
            return prev + " " + word.text;
          });
        }
      });
  
    } catch (err) {
      console.error("Decode failed:", err);
    }
  }
  async function joinRtc() {
    const token = localStorage.getItem("token");
  
    const response = await axios.post(
      `https://project-wt9v.onrender.com/api/meeting/${meetingId}/join`,
      { email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  
    const {
      token: agoraToken,
      agoraChannel: channel,
      uid,
    } = response.data;
  
    channelRef.current = channel;
    uidRef.current = uid;
  
    try {
      await client.leave();
    } catch {}
  
    client.off("stream-message", handleStreamMessage);
    client.on("stream-message", handleStreamMessage);
  
    await client.join(APP_ID, channel, agoraToken, uid);
 
 
  
  
    microphoneTrack.current =
      await AgoraRTC.createMicrophoneAudioTrack();
  
    await client.publish([microphoneTrack.current]);
  
    setIsListening(true);
  }

  async function startMeeting() {
    if (joining.current || isListening) return;
  
    joining.current = true;
  
    try {
      setTranscript("");
  
      console.log("Meeting ID:", meetingId);
      console.log("Email:", email);
  
      await joinRtc();
  
      if (role === "host") {
        const sttResponse = await axios.post(
          "https://project-wt9v.onrender.com/api/speech/start",
          {
            channel: channelRef.current,
            uid: uidRef.current,
          },
          {
            headers:{
              Authorization:`Bearer ${localStorage.getItem("token")}`
            }
          }
         );
  
         agentIdRef.current = sttResponse.data.agent_id;
         socket.emit("recording-started", meetingId);      }
  
      console.log("Meeting Started");
    } catch (error) {
      console.error(error);
    } finally {
      joining.current = false;
    }
  }
  async function stopMeeting() {
    if (role !== "host") return;
  
    try {
      const token = localStorage.getItem("token");
  
      if (agentIdRef.current) {
        await axios.post(
          "https://project-wt9v.onrender.com/api/speech/stop",
          {     channel: channelRef.current,

            agent_id: agentIdRef.current,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        console.log("STT stopped");
        socket.emit("recording-stopped", meetingId);
      }
  
      client.off("stream-message", handleStreamMessage);
  
      if (microphoneTrack.current) {
        await client.unpublish([microphoneTrack.current]);
        microphoneTrack.current.close();
        microphoneTrack.current = null;
      }
  
      await client.leave();
  
      setIsListening(false);
  
      setLoading(true);
  
      const llmResponse = await axios.post(
        "https://project-wt9v.onrender.com/api/llm/summarize",
        {
          transcript,
        }
      );
  
      setLoading(false);
      console.log("Meeting ID before navigate:", meetingId);
  
      navigate("/minutes", {
        state: { meetingId,
          transcript,
          summary: llmResponse.data.summary,
        },
      });
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  }
  useEffect(() => {

    async function handleRecordingStarted() {
  
      console.log(
        "🔥 RECORDING STARTED EVENT RECEIVED"
      );
  
      console.log(
        "Current role:",
        role
      );
  
      console.log(
        "Current isListening:",
        isListening
      );
  
      // Host is already in Agora
      if (role === "host") {
        console.log(
          "Host received event - ignoring"
        );
        return;
      }
  
      // Participant joins automatically
      if (!isListening) {
  
        console.log(
          "Participant joining Agora..."
        );
  
        try {
  
          await joinRtc();
  
        } catch (error) {
  
          console.error(
            "Participant failed to join Agora:",
            error
          );
        }
      }
    }
  
    socket.on(
      "recording-started",
      handleRecordingStarted
    );
  
    return () => {
  
      socket.off(
        "recording-started",
        handleRecordingStarted
      );
  
    };
  
  }, [
    role,
    isListening
  ]);
  useEffect(() => {
    async function handleRecordingStopped() {
      if (role === "host") return;
  
      try {
        client.off("stream-message", handleStreamMessage);
  
        if (microphoneTrack.current) {
          await client.unpublish([microphoneTrack.current]);
          microphoneTrack.current.close();
          microphoneTrack.current = null;
        }
  
        try {
          await client.leave();
        } catch {}
  
        setIsListening(false);
      } catch (err) {
        console.error(err);
      }
    }
  
socket.on(
 "recording-stopped",
 handleRecordingStopped
);  
    return () => {
      socket.off(
        "recording-stopped",
        handleRecordingStopped
             );
    };
  }, [role]);
  useEffect(() => {

    async function handleUserPublished(
      user,
      mediaType
    ) {
  
      console.log(
        "🔥 REMOTE USER PUBLISHED:",
        user.uid,
        mediaType
      );
  
      try {
  
        await client.subscribe(
          user,
          mediaType
        );
  
        console.log(
          "✅ SUBSCRIBED TO:",
          user.uid,
          mediaType
        );
  
        if (mediaType === "audio") {
  
          user.audioTrack.play();
  
          console.log(
            "🔊 PLAYING AUDIO FROM:",
            user.uid
          );
        }
  
      } catch (error) {
  
        console.error(
          "❌ Failed to subscribe:",
          error
        );
      }
    }
  
    client.on(
      "user-published",
      handleUserPublished
    );
  
    return () => {
  
      client.off(
        "user-published",
        handleUserPublished
      );
  
    };
  
  }, []);

  async function leaveMeeting() {
    try {
      const token = localStorage.getItem("token");
  
      // Notify backend
      await axios.post(
        `https://project-wt9v.onrender.com/api/meeting/${meetingId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      client.off("stream-message", handleStreamMessage);
  
      if (microphoneTrack.current) {
        await client.unpublish([microphoneTrack.current]);
        microphoneTrack.current.close();
        microphoneTrack.current = null;
      }
  
      try {
        await client.leave();
      } catch (e) {
        console.error(e);
      }
  
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
       
       <div className="control">
  {role === "host" ? (
    !isListening ? (
      <button
        className="start-button"
        onClick={startMeeting}
      >
        🎤 Start Recording
      </button>
    ) : (
      <button
        className="stop-button"
        onClick={stopMeeting}
      >
        ⏹ Stop Recording
      </button>
    )
  ) : (
    <button
      className="button"
      onClick={leaveMeeting}
    >
      🚪 Leave Meeting
    </button>
  )}
</div>      

      {loading && (
        <div className="loading-overlay">
          <div className="loader-box">
            <div className="spinner"></div>
            <h3>Generating Minutes...</h3>
            <p>Please wait while AI summarizes your meeting.</p>
          </div>
        </div>
      )}
    </>
  );
}

export default Control;
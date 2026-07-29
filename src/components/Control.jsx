import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";
import { APP_ID } from "../config";
import client from "../agora";
import { decodeSTT } from "../pages/utils/decodeSTT";

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
          setTranscript((prev) => {
            if (!prev) return word.text;

            if (prev.endsWith(word.text)) return prev;

            return prev + " " + word.text;
          });
        }
      });
    } catch (err) {
      console.error("Decode failed:", err);
    }
  }

  async function startMeeting() {
    if (joining.current || isListening) return;

    joining.current = true;

    try {
      setTranscript("");

      console.log("Meeting ID:", meetingId);
      console.log("Email:", email);
      
      const response = await axios.post(
        `https://project-wt9v.onrender.com/api/meeting/${meetingId}/join`,
        {
          email,
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
      } catch (e) {}

      client.off("stream-message", handleStreamMessage);
      client.on("stream-message", handleStreamMessage);

      await client.join(APP_ID, meetingId, agoraToken, uid);

      microphoneTrack.current =
        await AgoraRTC.createMicrophoneAudioTrack();

      await client.publish([microphoneTrack.current]);

      const sttResponse = await axios.post(
        "https://project-wt9v.onrender.com/api/speech/start",
        {
          channel,
          uid,
        }
      );

      agentIdRef.current = sttResponse.data.agent_id;

      setIsListening(true);

      console.log("Meeting Started");
    } catch (error) {
      console.error(error);
    } finally {
      joining.current = false;
    }
  }

  async function stopMeeting() {
    try {
      if (agentIdRef.current) {
        await axios.post(
          "https://project-wt9v.onrender.com/api/speech/stop",
          {
            agent_id: agentIdRef.current,
          }
        );

        console.log("STT stopped");
      }

      client.off("stream-message", handleStreamMessage);

      if (microphoneTrack.current) {
        await client.unpublish([microphoneTrack.current]);
        microphoneTrack.current.close();
        microphoneTrack.current = null;
      }

      await client.leave();

      setIsListening(false);

      console.log("Meeting Ended");

      setLoading(true);

      console.log("Transcript:", transcript);

      const llmResponse = await axios.post(
        "https://project-wt9v.onrender.com/api/llm/summarize",
        {
          transcript,
        }
      );

      console.log("LLM Response:", llmResponse.data);

      setLoading(false);

      navigate("/minutes", {
        state: {
          transcript,
          summary: llmResponse.data.summary,
        },
      });
    } catch (err) {
      setLoading(false);
      console.error(err);
    }
  }

  return (
    <>
       
        <div className="control">
          {!isListening ? (
            <button className="start-button" onClick={startMeeting}>
              🎤 Start Recording
            </button>
          ) : (
            <div className="recording-container">
              <button className="stop-button" onClick={stopMeeting}>
                ⏹ Stop Recording
              </button>
            </div>
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
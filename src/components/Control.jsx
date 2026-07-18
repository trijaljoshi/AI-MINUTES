import { useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import axios from "axios";
import { APP_ID, CHANNEL } from "../config";
import client from "../agora";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function Control({ transcript, setTranscript }) {
  const [isListening, setIsListening] = useState(false);

  const microphoneTrack = useRef(null);
  const recognition = useRef(null);
  const joining = useRef(false);

  async function startMeeting() {
    if (joining.current || isListening) return;

    joining.current = true;

    try {
      // Get Agora Token
      const response = await axios.get(
        "https://project-wt9v.onrender.com/api/agora/token",
        {
          params: {
            channel: CHANNEL,
            uid: 1,
          },
        }
      );

      const agoraToken = response.data.token;

      console.log("Agora Token:", agoraToken);

      // Leave previous session if connected
      try {
        await client.leave();
      } catch (e) {}

      console.log("Joining Agora...");

      await client.join(APP_ID, CHANNEL, agoraToken, 1);

      console.log("Joined!");

      microphoneTrack.current =
        await AgoraRTC.createMicrophoneAudioTrack();

      console.log("Microphone Created!");

      await client.publish([microphoneTrack.current]);

      console.log("Published!");

      // Start Agora Speech-to-Text
      const sttResponse = await axios.post(
        "https://project-wt9v.onrender.com/api/speech/start",
        {
          channel: CHANNEL,
          uid: 1,
        }
      );

      console.log("Speech Started:", sttResponse.data);

      // Browser Speech Recognition
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();

        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.lang = "en-US";

        recognition.current.onstart = () => {
          console.log("🎤 SpeechRecognition Started");
        };

        recognition.current.onend = () => {
          console.log(
            "🛑 SpeechRecognition Ended at",
            new Date().toLocaleTimeString()
          );
        };

        recognition.current.onerror = (event) => {
          console.log("❌ SpeechRecognition Error:", event.error);
        };

        recognition.current.onresult = (event) => {
          console.log("========== RESULT EVENT ==========");
          console.log(event);

          let text = "";

          for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
          ) {
            text += event.results[i][0].transcript + " ";
          }

          console.log("Recognized Text:", text);

          setTranscript((prev) => prev + text);
        };

        recognition.current.start();
      } else {
        console.log("SpeechRecognition API not supported.");
      }

      setIsListening(true);
    } catch (error) {
      console.error("Error starting meeting:", error);
    } finally {
      joining.current = false;
    }
  }

  async function stopMeeting() {
    try {
      if (recognition.current) {
        recognition.current.stop();
        recognition.current = null;
      }

      if (microphoneTrack.current) {
        await client.unpublish([microphoneTrack.current]);
        microphoneTrack.current.close();
        microphoneTrack.current = null;
      }

      await client.leave();

      setIsListening(false);

      console.log("Meeting Ended");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="control">
      {!isListening ? (
        <button
          className="start-button"
          onClick={startMeeting}
        >
          🎤 Start Recording
        </button>
      ) : (
        <div className="recording-container">
          <button
            className="stop-button"
            onClick={stopMeeting}
          >
            ⏹ Stop Recording
          </button>
        </div>
      )}
    </div>
  );
}

export default Control;
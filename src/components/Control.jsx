import { useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { APP_ID, TOKEN, CHANNEL } from "../config";
import client from "../agora";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

function Control({ transcript, setTranscript }) {

  const [isListening, setIsListening] = useState(false);

  const microphoneTrack = useRef(null);

  const recognition = useRef(null);

  async function startMeeting() {
     console.log("Joining Agora...");

    await client.join(APP_ID, CHANNEL, TOKEN, null);

    console.log("Joined!");

    microphoneTrack.current =
      await AgoraRTC.createMicrophoneAudioTrack();

    console.log("Microphone Created!");

    await client.publish([microphoneTrack.current]);

    console.log("Published!");

    recognition.current = new SpeechRecognition();

    recognition.current.continuous = true;
    recognition.current.interimResults = true;
    recognition.current.lang = "en-US";

    recognition.current.onresult = (event) => {

      let text = "";

      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }

      setTranscript(text);

    };

    recognition.current.start();

    setIsListening(true);

  }

  async function stopMeeting() {

    if (recognition.current) {
      recognition.current.stop();
    }

    if (microphoneTrack.current) {
      await client.unpublish([microphoneTrack.current]);
      microphoneTrack.current.close();
    }

    await client.leave();

    setIsListening(false);

    console.log("Meeting Ended");

  }

  return (

    <div className="control">

      {!isListening ? (

        <button
          className="button"
          onClick={startMeeting}
        >
          Start Recording
        </button>

      ) : (

        <>

          <button disabled>
            Listening...
          </button>

          <button
           className="button"
            onClick={stopMeeting}
          >
            ■
          </button>

        </>

      )}

    </div>

  );
}

export default Control;
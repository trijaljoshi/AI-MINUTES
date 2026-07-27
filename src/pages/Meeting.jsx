import { useState, useEffect } from "react";
import Header from "../components/Header";
import Control from "../components/Control";
import Text from "../components/Text";
import socket from "../socket";

function Meeting() {
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const handleTranscript = (data) => {
      if (!data?.text) return;

      setTranscript((prev) =>
        prev ? prev + " " + data.text : data.text
      );
    };

    socket.on("transcript", handleTranscript);

    return () => {
      socket.off("transcript", handleTranscript);
    };
  }, []);

  return (
    <div>
      <div className="header">
        <Header />
        <hr />
      </div>

      <br />

      <Control

        transcript={transcript}
        role={role}
        setTranscript={setTranscript}
      />

      <br />

      <Text transcript={transcript} />
    </div>
  );
}

export default Meeting;
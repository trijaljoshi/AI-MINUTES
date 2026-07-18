import { useState, useEffect } from "react";
import Header from "../components/Header";
import Control from "../components/Control";
import Text from "../components/Text";
import socket from "../socket";

function Meeting() {
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    socket.on("transcript", (data) => {
      setTranscript(data.text);
    });

    return () => {
      socket.off("transcript");
    };
  }, []);

  return (
    <div>
     <div className="header">
        <Header />
        <hr />
      </div>

      <Control
        transcript={transcript}
        setTranscript={setTranscript}
      />

      <Text transcript={transcript} />
    </div>
  );
}

export default Meeting;
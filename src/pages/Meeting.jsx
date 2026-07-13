import { useState } from "react";
import Header from "../components/Header";
import Control from "../components/Control";
import Text from "../components/Text";

function Meeting() {

  const [transcript, setTranscript] = useState("");

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
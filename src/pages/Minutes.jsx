import Header from "../components/Header";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Meeting from "./Meeting";

function Minutes() {
  const location = useLocation();

  const transcript = location.state?.transcript || "";
  const summary = location.state?.summary || "";
  const meetingId = location.state?.meetingId || "";

  const handleGeneratePdf = async () => {
    try {console.log("Meeting ID:", meetingId);
      const response = await axios.post(
  "https://project-wt9v.onrender.com/api/pdf/generate",
  { meetingId,
    geminiResponse: summary,
  },
  {
    responseType: "blob",
  }
);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "meeting-minutes.pdf";

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF");
    }
  };

  return (
    <div>
      <div className="header">
        <Header />
      </div>

      <br />

      <h2>Minutes of the Meeting are:</h2>

      <br />

      <textarea
        value={summary}
        readOnly
        rows={20}
        cols={100}
        placeholder="The AI-generated meeting summary will appear here..."
      />

      <br />
      <br />

      <button
        className="button"
        onClick={handleGeneratePdf}
      >
        Generate PDF
      </button>
    </div>
  );
}

export default Minutes;
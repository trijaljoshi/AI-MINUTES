import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
function Join() {
    const navigate = useNavigate();
    const { meetingId } = useParams();

    const [displayName, setDisplayName] = useState("");
    const joinMeeting = async () => {
        try {
    
            const response = await axios.post(
                `http://localhost:5000/api/meeting/${meetingId}/join`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
    
            navigate(`/meeting/${meetingId}`, {
                state: {
                    username: response.data.member.name,
                    email: response.data.member.email,
                    role: "participant",
                    title: response.data.title,
                    agoraToken: response.data.token,
                    uid: response.data.uid,
                    channel: response.data.agoraChannel,
                },
            });
    
        } catch (error) {
    
            alert(error.response?.data?.message);
    
        }
    };
return(
    <div className="page">
      <div className="header">
        <Header />
        </div>
        
        <div className="page-card">
            
            <h2>Please enter your name:</h2>
            <input
      type="text"
      placeholder="Display Name"
      value={displayName}
      onChange={(e) => setDisplayName(e.target.value)}
   
    
        />
        <button className="button" onClick={joinMeeting}> Join Meeting

        </button>
        </div>
      </div>
      
 
);
}
export default Join;

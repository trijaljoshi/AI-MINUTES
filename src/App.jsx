import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Meeting from "./pages/Meeting";
import Minutes from "./pages/Minutes";
import Login from "./pages/login";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/meeting" element={<Meeting />} />
        <Route path="/meeting/:meetingId" element={<Meeting />} />
        <Route path="/minutes" element={<Minutes />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
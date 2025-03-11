import React from "react";

export default function CameraStream() {
  return (
    <div>
      <h1>No camera found</h1>
      <img src="http://localhost:8000/video_feed" alt="Webcam Stream" />
    </div>
  );
}

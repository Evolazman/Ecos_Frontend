import React from "react";
const Video: React.FC = () => {
  return (
    <video autoPlay muted loop id="myVideo">
        <source src="./space-bg.mp4"></source>
    </video>
    
  );
};

export default Video;

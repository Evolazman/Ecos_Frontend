import { useEffect, useState } from "react";
import { api } from "../utils/api";

export default function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("http://192.168.1.121:8000/video_feed")
      .then((response) => setMessage(response.data.message))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h1>FastAPI + Next.js</h1>
      <p>{message}</p>
    </div>
  );
}

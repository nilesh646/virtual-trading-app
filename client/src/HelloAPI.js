import React, { useEffect, useState } from "react";
import axios from "axios";

const HelloAPI = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    axios
      .get("/api/hello")   // 👈 IMPORTANT
      .then((res) => setMessage(res.data.message))
      .catch((err) => {
        console.error(err);
        setError(true);
      });
  }, []);

  return (
    <div>
      <h1>Message from Backend:</h1>
      {error ? (
        <p style={{ color: "green" }}>Error fetching message</p>
      ) : (
        <p>{message}</p>
      )}
    </div>
  );
};

export default HelloAPI;
import React, { useState } from 'react';

function App() {
  alert("🚀 App component loaded");

  const [userPrompt, setUserPrompt] = useState('');
  const [torahResponses, setTorahResponses] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert("📤 Submitting prompt: " + userPrompt);

    try {
      const response = await fetch("https://torah-ai-backend.onrender.com/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await response.json();
      alert("📥 Data received from backend: " + JSON.stringify(data));

      setTorahResponses(data.sources);
    } catch (error) {
      alert("❌ Error during fetch: " + error.message);
      console.error("❌ Fetch failed:", error);
    }
  };

  return (
    <div className="App" style={{ padding: "1rem", fontFamily: "Arial" }}>
      <h1>Torah AI Debug Mode</h1>
      <p>✅ React component rendered</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Ask your Torah question..."
          style={{ width: "300px", padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem", marginLeft: "0.5rem" }}>
          Submit
        </button>
      </form>

      <div>
        {torahResponses.length > 0 ? (
          torahResponses.map((source, index) => (
            <div key={index} style={{ marginBottom: "1rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
              <h3>📘 {source.source_name}</h3>
              <p><strong>English:</strong> {source.text_en}</p>
              <p><strong>Hebrew:</strong> {source.text_he}</p>
            </div>
          ))
        ) : (
          <p>ℹ️ No responses yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;

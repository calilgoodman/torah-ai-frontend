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

      const allResponses = Object.values(data).flat();
      setTorahResponses(allResponses);

      const rawTexts = data[0]?.torah_texts?.documents?.[0] || [];
      const rawMetas = data[0]?.torah_texts?.metadatas?.[0] || [];

      const sources = rawTexts.map((doc, index) => ({
        source_name: rawMetas[index]?.citation || `Source ${index + 1}`,
        text_en: doc,
        text_he: rawMetas[index]?.hebrew || "(Hebrew not available)"
      }));

      setTorahResponses(sources);
    } catch (error) {
      alert("❌ Error during fetch: " + error.message);
      console.error("❌ Fetch failed:", error);
    }
  };

  return (
    <div className="App" style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>📖 Torah AI Companion</h1>

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

      {torahResponses.length > 0 ? (
        <div style={{ marginTop: "2rem" }}>
          <h2>📘 Torah Responses:</h2>
          {torahResponses.map((res, index) => (
            <div key={index} style={{ marginBottom: "1.5rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
              <h3>{res.source_label || res.source_name}</h3>
              <p><strong>{res.citation || "English"}:</strong> {res.text_en}</p>
              <p style={{ direction: "rtl", fontFamily: "David, serif" }}>
                <strong>Hebrew:</strong> {res.text_he}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ marginTop: '1rem' }}>ℹ️ No responses yet. Try submitting a question above.</p>
      )}
    </div>
  );
}

export default App;

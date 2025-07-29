import React, { useState } from 'react';

function App() {
  console.log("🚀 App component loaded");

  const [userPrompt, setUserPrompt] = useState('');
  const [torahResponses, setTorahResponses] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Submitting prompt:", userPrompt);

    try {
      const response = await fetch("https://torah-ai-backend.onrender.com/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await response.json();
      console.log("📥 Data received from backend:", data);

      setTorahResponses(data.sources);
    } catch (error) {
      console.error("❌ Error during fetch:", error);
    }
  };

  return (
    <div className="App">
      <h1>Torah AI Companion</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Ask your Torah question..."
        />
        <button type="submit">Submit</button>
      </form>

      <div>
        {torahResponses.length > 0 ? (
          torahResponses.map((source, index) => (
            <div key={index}>
              <h3>📘 {source.source_name}</h3>
              <p><strong>English:</strong> {source.text_en}</p>
              <p><strong>Hebrew:</strong> {source.text_he}</p>
            </div>
          ))
        ) : (
          <p>No responses yet.</p>
        )}
      </div>
    </div>
  );
}

export default App;

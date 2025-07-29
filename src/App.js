import React, { useState, useEffect } from 'react';

function App() {
  const [themes, setThemes] = useState({});
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedSources, setSelectedSources] = useState([]);
  const [responses, setResponses] = useState([]);

  const API_BASE_URL = "https://torah-ai-backend.onrender.com";

  const sourceCategories = [
    "Torah",
    "Prophets",
    "Writings",
    "Talmud",
    "Midrash",
    "Halacha",
    "Mitzvah",
    "Kabbalah",
    "Chasidut",
    "Mussar",
    "Jewish Thought"
  ];

  const sourceMap = {
    "Torah": "torah_texts",
    "Talmud": "talmud_text",
    "Midrash": "midrash_text",
    "Halacha": "halacha_texts",
    "Mitzvah": "mitzvah_texts",
    "Kabbalah": "kabbalah_text",
    "Chasidut": "chassidut_text",
    "Mussar": "mussar_texts",
    "Jewish Thought": "jewish_thought_texts",
    "Prophets": "navi_texts",
    "Writings": "ketuvim_texts"
  };

  useEffect(() => {
    fetch('/themes_maincat_subcat.json')
      .then(res => res.json())
      .then(data => setThemes(data))
      .catch(err => console.error('Failed to load themes:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sources = selectedSources.map(s => sourceMap[s] || s.toLowerCase().replace(/ /g, "_") + "_texts");

    const payload = {
      prompt: userPrompt,
      theme: selectedTheme,
      main: selectedMainCategory,
      sub: selectedSubCategory,
      sources: sources
    };

    try {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("🧠 Raw data from backend:", data);

      const allSources = [];

      data.forEach(sourceResult => {
        const sourceKey = Object.keys(sourceResult)[0];
        const sourceData = sourceResult[sourceKey];
        const docs = sourceData?.documents?.[0] || [];
        const metas = sourceData?.metadatas?.[0] || [];

        docs.forEach((doc, index) => {
          allSources.push({
            source_name: sourceKey,
            citation: metas[index]?.citation || `Source ${index + 1}`,
            text_en: doc,
            text_he: metas[index]?.text_he || metas[index]?.hebrew || "(Hebrew not available)"
          });
        });
      });

      console.log("📦 Processed sources:", allSources);
      setResponses(allSources);
    } catch (error) {
      console.error("❌ Fetch failed:", error);
    }
  };

  return (
    <div className="App" style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>📖 Torah AI Companion</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Theme:</label>
          <select value={selectedTheme} onChange={(e) => {
            setSelectedTheme(e.target.value);
            setSelectedMainCategory('');
            setSelectedSubCategory('');
          }}>
            <option value="">Select Theme</option>
            {Object.keys(themes).map(theme => (
              <option key={theme} value={theme}>{theme}</option>
            ))}
          </select>
        </div>

        {selectedTheme && (
          <div>
            <label>Main Category:</label>
            <select value={selectedMainCategory} onChange={(e) => {
              setSelectedMainCategory(e.target.value);
              setSelectedSubCategory('');
            }}>
              <option value="">Select Main Category</option>
              {Object.keys(themes[selectedTheme] || {}).map(main => (
                <option key={main} value={main}>{main}</option>
              ))}
            </select>
          </div>
        )}

        {selectedMainCategory && (
          <div>
            <label>Subcategory:</label>
            <select value={selectedSubCategory} onChange={(e) => setSelectedSubCategory(e.target.value)}>
              <option value="">Select Subcategory</option>
              {(themes[selectedTheme]?.[selectedMainCategory] || []).map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ marginTop: '1rem' }}>
          <label><strong>Select Source Types:</strong></label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
            {sourceCategories.map((category) => (
              <label key={category}>
                <input
                  type="checkbox"
                  value={category}
                  checked={selectedSources.includes(category)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedSources(prev =>
                      e.target.checked
                        ? [...prev, value]
                        : prev.filter(v => v !== value)
                    );
                  }}
                />
                {category}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label>Your Prompt:</label>
          <input
            type="text"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="What are you going through?"
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </div>

        <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          Submit
        </button>
      </form>

      {responses.length > 0 ? (
        <div style={{ marginTop: "2rem" }}>
          <h2>📘 Responses:</h2>
          {responses.map((res, index) => (
            <div key={index} style={{ marginBottom: "2rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
              <h3>📚 {res.source_name}</h3>
              <p><strong>Citation:</strong> {res.citation}</p>

              <p><strong>English:</strong></p>
              <p style={{ whiteSpace: "pre-wrap" }}>{res.text_en}</p>

              <p><strong>Hebrew:</strong></p>
              <p dir="rtl" style={{ fontFamily: "David, serif", whiteSpace: "pre-wrap" }}>{res.text_he}</p>
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

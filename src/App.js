import React, { useState, useEffect } from 'react';

function App() {
  const [themes, setThemes] = useState({});
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedSources, setSelectedSources] = useState([]);
  const [torahResponses, setTorahResponses] = useState([]);

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

  useEffect(() => {
    fetch('/themes_maincat_subcat.json')
      .then(res => res.json())
      .then(data => setThemes(data))
      .catch(err => console.error('Failed to load themes:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      prompt: userPrompt,
      theme: selectedTheme,
      main: selectedMainCategory,
      sub: selectedSubCategory,
      sources: selectedSources.map(s => s.toLowerCase().replace(/ /g, "_") + "_texts")
    };

    try {
      const response = await fetch('https://torah-ai-backend.onrender.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      const allResponses = Object.values(data).flat();
      setTorahResponses(allResponses);
    } catch (error) {
      console.error('Error fetching Torah response:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Torah AI Companion</h1>

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
          Get Torah Response
        </button>
      </form>

      {torahResponses.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Torah Responses:</h2>
          {torahResponses.map((res, index) => (
            <div key={index} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #ccc', paddingBottom: '1rem' }}>
              <h3>{res.source_label}</h3>
              <p><strong>{res.citation}</strong></p>
              <p>{res.text_en}</p>
              <p style={{ direction: 'rtl', fontFamily: 'David, serif' }}>{res.text_he}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

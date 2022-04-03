import React, { useState } from 'react';
import './App.css';


function App() {
  const [input, setInput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [outputData, setOutputData] = useState();

  const translate = async () => {
    setIsTranslating(true);
    fetch('http://localhost:5001/translate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input }),
    })
      .then(async (res) => {
        if (res.ok) {
          return res.json();
        }
        const { error } = await res.json();
        throw new Error(error);
      })
      .then(data => {
        setOutputData(data);
        setIsTranslating(false);

      })
      .catch(err => {
        alert(err)
      });
  }
  const handleEnterKeyDown = (e) => {
    e.nativeEvent.key === 'Enter' && translate();
  }

  const outputDisplay = outputData ?
    <div>
      <p>{outputData.japanese}</p>
      <p>{outputData.romanji}</p>
      <p>{outputData.romanjiArray.join(" ")}</p>
    </div>
    : undefined

  return (
    <div className="App">
      <div className="container">
        <textarea
          className="inputText"
          type="text"
          placeholder="Something to say"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleEnterKeyDown}
          disabled={isTranslating}
        />
        <div className="loadingContainer">
          {isTranslating ?
            <p>Translating...</p>
            : outputDisplay}
        </div>
        {!(outputData && outputData.input === input) ?
          <button onClick={translate} className="translateButton">Translate</button>
          : undefined}
      </div>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import './App.css';


function App() {
  const [input, setInput] = useState('');

  const translate = async () => {
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
        console.log(data);
      })
      .catch(err => {
        alert(err)
      });
  }

  return (
    <div className="App">
      <div className="container">
        <textarea
          className="inputText"
          type="text"
          placeholder="Something to say"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={translate} className="translateButton">Translate</button>
      </div>
    </div>
  );
}

export default App;

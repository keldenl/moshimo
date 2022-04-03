import React, { useEffect, useState, useCallback } from 'react';
import { Howl, Howler } from 'howler';

import { voiceSpeed, voiceSpriteSheet } from './utils';
import soundSrc from './assets/kelden-full-jp-1.mp3';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [outputData, setOutputData] = useState();
  const [speakingArr, setSpeakingArr] = useState([]);

  useEffect(() => {
    if (!speakingArr.length) return;
    const sound = new Howl({
      src: [soundSrc],
      sprite: voiceSpriteSheet,
      rate: voiceSpeed,
      html5: true,
      onend: onSoundEnd
    })

    sound.play(speakingArr[0]);
    // sound.onend = onSoundEnd
  }, [speakingArr])

  const onSoundEnd = useCallback(() => {
    console.log(speakingArr);
    const newSpeakingArr = [...speakingArr];
    console.log('update array to ', newSpeakingArr);
    newSpeakingArr.shift();
    console.log('update array to ', newSpeakingArr);
    setSpeakingArr(newSpeakingArr);
  }, [speakingArr]);

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
        setSpeakingArr(data.romanjiArray);
        setIsTranslating(false);
      })
      .catch(err => {
        alert(err);
        setIsTranslating(false);
      });
  }

  // useEffect(() => {
  //   if (!outputData) return;

  // }, [outputData])

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

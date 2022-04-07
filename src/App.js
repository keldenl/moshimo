import React, { useEffect, useState } from 'react';
import { Howl } from 'howler';

import { voiceSpeed, voiceSpriteSheet } from './utils';
import soundSrc from './assets/kelden-full-jp-1.mp3';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [outputData, setOutputData] = useState();
  const [speakingArr, setSpeakingArr] = useState([]);
  const [speakingIdx, setSpeakingIdx] = useState(0);

  useEffect(() => {
    if (!speakingArr.length) return;

    const nextBreakIndex = speakingArr.indexOf('--');
    const endIndex = nextBreakIndex > -1 ? nextBreakIndex : speakingArr.length;
    const currWordArr = [...speakingArr].slice(0, endIndex);

    const wordDelayArr = currWordArr.map(char => {
      const [, length] = voiceSpriteSheet[char];
      return length;
    });

    currWordArr.map((char, index) => {
      const currDelay = wordDelayArr.reduce((a, b, i) => i < index ? a + b : a, 0);
      const [, length] = voiceSpriteSheet[char];
      if (index === 0) {
        const sound = new Howl({
          src: [soundSrc],
          sprite: voiceSpriteSheet,
          rate: voiceSpeed,
          html5: true,
        })
        const id = sound.play(char);
        sound.fade(0, 1, length - 25, id);
        sound.fade(1, 0, length - 75, id);
        if (index === currWordArr.length - 1 && nextBreakIndex > -1) {
          onWordSoundEnd();
        }
      } else {
        setTimeout(() => {
          const sound = new Howl({
            src: [soundSrc],
            sprite: voiceSpriteSheet,
            rate: voiceSpeed,
            html5: true,
          })
          const id = sound.play(char);
          sound.fade(0, 1, length - 25, id);
          sound.fade(1, 0, length - 75, id);
          if (index === currWordArr.length - 1 && nextBreakIndex > -1) {
            onWordSoundEnd();
          }
        }, currDelay);
      }
    })

  }, [speakingArr])

  const onWordSoundEnd = () => {
    const nextBreakIndex = speakingArr.indexOf('--');
    const nextWordArr = [...speakingArr].slice(nextBreakIndex + 1, speakingArr.length);
    while (nextWordArr[0] === '--' || nextWordArr[0] === '-') {
      nextWordArr.shift();
    }

    // manually add the word break
    setTimeout(() => {
      setSpeakingArr(nextWordArr);
      setSpeakingIdx(speakingIdx + 1);
    }, 500);
  }

  const translate = async () => {
    setIsTranslating(true);
    setSpeakingIdx(0);

    // setSpeakingArr([
    //     "ko",
    //     "n",
    //     "ni",
    //     "chi",
    //     "wa",
    //     "--",
    //     "wa",
    //     "ta",
    //     "shi",
    //     "--",
    //     "no",
    //     "--",
    //     "na",
    //     "ma",
    //     "e",
    //     "--",
    //     "wa",
    //     "--",
    //     "ke",
    //     "ru",
    //     "de",
    //     "n",
    //     "--",
    //     "de",
    //     "su"
    // ])
    // return
    fetch('https://moshimo.herokuapp.com/translate', {
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

  const handleEnterKeyDown = (e) => {
    e.nativeEvent.key === 'Enter' && translate();
  }

  const handleMoshimo = () => setSpeakingArr(['mo', 'shi', 'mo']);

  const outputDisplay = outputData ?
    <div>
      <p className='jap-output'>{outputData.japanese}</p>
      <p className='romanji-output'>{outputData.romanji}</p>
      <p className='romanji-output' onClick={() => setSpeakingArr(outputData.romanjiArray)}>
        {outputData.romanjiArray.join("").replaceAll("--", " ").split(" ").map((word, index) => {
          return <span key={index} className={index === speakingIdx ? "active" : undefined}>{word} </span>
        })}
      </p>
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
            : outputDisplay
          }
          <div className='footer'>
            <p className='moshimo' onClick={handleMoshimo}>Moshi Mo</p>
            <p>Built by <a href="http://keldenl.com">Kelden Lin</a> © {new Date().getFullYear()}</p>
          </div>
        </div>
        {!(outputData && outputData.input === input) && input.length > 0 ?
          <div className="translateButton">Press Enter to Translate</div>
          : undefined}
      </div>
    </div>
  );
}

export default App;

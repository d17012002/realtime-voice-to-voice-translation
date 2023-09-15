import "./App.css";
import io from "socket.io-client";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useEffect, useState, useRef } from "react";

const socket = io.connect("http://localhost:3001");

const languageOptions = [
  { label: "English (India)", value: "en-IN" },
  { label: "English (US)", value: "en-US" },
  { label: "Afrikaans", value: "af" },
  { label: "Basque", value: "eu" },
  { label: "Zulu", value: "zu" },
  { label: "French (France)", value: "fr-FR" },
  { label: "French (Canada)", value: "fr-CA" },
  { label: "German (Germany)", value: "de-DE" },
  { label: "Spanish (Spain)", value: "es-ES" },
  { label: "Spanish (Mexico)", value: "es-MX" },
  { label: "Portuguese (Portugal)", value: "pt-PT" },
  { label: "Portuguese (Brazil)", value: "pt-BR" },
  { label: "Russian", value: "ru" },
  { label: "Japanese", value: "ja" },
  { label: "Chinese Simplified", value: "zh-CN" },
  { label: "Chinese Traditional", value: "zh-TW" },
  { label: "Hindi", value: "hi-IN" },
  // ... (and so on)
];


const App = () => {
  //receiving message
  const [selectedLanguage1, setSelectedLanguage1] = useState("en-IN");

  //sending message
  const [selectedLanguage2, setSelectedLanguage2] = useState("en-IN");
  const [messageReceived, setMessageReceived] = useState("");

  //speaking
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true, language: selectedLanguage2 });
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const handleLanguageChange1 = (event) => {
    setSelectedLanguage1(event.target.value);
  };

  const handleLanguageChange2 = (event) => {
    setSelectedLanguage2(event.target.value);
  };

  const sendMessage = () => {
    socket.emit("send_message", {
      language: selectedLanguage2,
      message: transcript,
    });
    SpeechRecognition.abortListening();
    resetTranscript(); // Clear the transcript
  };

  const selectedLanguage1Ref = useRef(selectedLanguage1); // Create a ref to hold the value

  useEffect(() => {
    selectedLanguage1Ref.current = selectedLanguage1; // Update the ref when selectedLanguage1 changes
  }, [selectedLanguage1]);

  const handleSpeak = () => {

    if ('speechSynthesis' in window) {

      const synthesis = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(messageReceived);
      utterance.lang = selectedLanguage1;
      synthesis.speak(utterance);

    } else {
      alert('Text-to-speech is not supported in this browser.');
    }

  };
  
  useEffect(() => {
    socket.on("receive_message", (data) => {
      
      setSelectedLanguage1(selectedLanguage1Ref.current);

      let text = data.message;
      let translateFrom = data.language;
      let translateTo = selectedLanguage1Ref.current;

      if (!text) return;
      if(translateFrom === translateTo) {
          setMessageReceived(text);
      }
      else {
        let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
        fetch(apiUrl)
          .then((res) => res.json())
          .then((data) => {
            setMessageReceived(data.responseData.translatedText);
          })
        }
      });
  }, [socket]);

  useEffect(() => {
    if (messageReceived) {
        handleSpeak();
    }
}, [messageReceived]);



  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  return (
    <>
      {/* RECEIVING BROADCAST MESSAGES */}

      <div className="container">
        <h3>
          Listening Area 
        </h3>
        <div className="language-dropdown1">
          {"Which language do you understand ? "}
          <select value={selectedLanguage1} onChange={handleLanguageChange1}>
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* <button className="receiversButton" onClick={handleSpeak}>Listen</button> */}
        </div>
        <br />
        <div className="main-content">{messageReceived}</div>
        {/* SENDING MESSAGE VIA SOCKET */}

        <br />
        <h3>
          Start Speaking
        </h3>
        <div className="language-dropdown2">
          {"Which language you are speaking in? "}
          <select value={selectedLanguage2} onChange={handleLanguageChange2}>
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <br />

        <div className="main-content">{transcript}</div>

        <div className="btn-style">
          <button className="speakersButton" onClick={startListening}>
            Start
          </button>
          <button
            className="speakersButton"
            onClick={SpeechRecognition.stopListening}
          >
            Stop 
          </button>

          <button className="speakersButton" onClick={sendMessage}>
            Done
          </button>
        </div>
      </div>
    </>
  );
};

export default App;

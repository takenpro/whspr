import React, { useState, useRef, useEffect } from 'react'
import { Upload, FileAudio, FileVideo, Loader, Download, Cpu, Zap, Mic, Youtube, Globe } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
]

const whisperModels = [
  { name: 'Whisper Medium', value: 'whisper-medium' },
  { name: 'Whisper Large', value: 'whisper-large' },
  { name: 'WhisperX Medium', value: 'whisperx-medium' },
  { name: 'WhisperX Large', value: 'whisperx-large' },
]

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState<string>('')
  const [transcription, setTranscription] = useState<Array<{text: string, time: string}>>([])
  const [translatedTranscription, setTranslatedTranscription] = useState<Array<{text: string, time: string}>>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [language, setLanguage] = useState<string>('en')
  const [displayLanguage, setDisplayLanguage] = useState<string>('en')
  const [useGPU, setUseGPU] = useState<boolean>(false)
  const [model, setModel] = useState<string>('whisper-medium')
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setYoutubeUrl('')
    }
  }

  const handleYoutubeUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(event.target.value)
    setFile(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file && !youtubeUrl) return

    setIsLoading(true)
    // Simulamos el proceso de transcripción
    await new Promise(resolve => setTimeout(resolve, 3000))
    const englishTranscription = [
      { text: "Welcome to the simulated transcription.", time: "00:00" },
      { text: "This is an example of how the transcribed text would look.", time: "00:05" },
      { text: `${file ? `File: ${file.name}` : `YouTube URL: ${youtubeUrl}`}, Language: ${language}, Model: ${model}, GPU: ${useGPU ? 'Yes' : 'No'}`, time: "00:10" },
    ]
    setTranscription(englishTranscription)
    
    const spanishTranscription = [
      { text: "Bienvenidos a la transcripción simulada.", time: "00:00" },
      { text: "Este es un ejemplo de cómo se vería el texto transcrito.", time: "00:05" },
      { text: `${file ? `Archivo: ${file.name}` : `URL de YouTube: ${youtubeUrl}`}, Idioma: ${language}, Modelo: ${model}, GPU: ${useGPU ? 'Sí' : 'No'}`, time: "00:10" },
    ]
    setTranslatedTranscription(spanishTranscription)
    
    setIsLoading(false)
  }

  const handleDownload = () => {
    const currentTranscription = displayLanguage === 'en' ? transcription : translatedTranscription
    const element = document.createElement("a");
    const file = new Blob([currentTranscription.map(t => `${t.time} - ${t.text}`).join('\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `transcripcion_${displayLanguage}.txt`;
    document.body.appendChild(element);
    element.click();
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const audioFile = new File([event.data], "recorded_audio.wav", { type: "audio/wav" });
          setFile(audioFile);
          setYoutubeUrl('');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al iniciar la grabación:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleDisplayLanguage = () => {
    setDisplayLanguage(prev => prev === 'en' ? 'es' : 'en')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-4xl border-2 border-green-500">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-500 uppercase tracking-wider">Atrevo Whisper</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-green-500 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition duration-300">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-green-500" />
                    <p className="mb-2 text-sm text-green-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-green-400">Audio (MP3, WAV) or Video (MP4, MOV)</p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".mp3,.wav,.mp4,.mov" />
                </label>
              </div>
              {file && (
                <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded">
                  {file.type.startsWith('audio/') ? <FileAudio className="text-green-500" /> : <FileVideo className="text-green-500" />}
                  <span className="text-sm text-green-400">{file.name}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Youtube className="text-green-500" />
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={handleYoutubeUrlChange}
                  placeholder="YouTube URL"
                  className="flex-1 p-2 border border-green-500 rounded bg-gray-700 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-green-500 rounded bg-gray-700 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full p-2 border border-green-500 rounded bg-gray-700 text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {whisperModels.map((m) => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
              <div className="flex justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useGPU}
                    onChange={() => setUseGPU(!useGPU)}
                    className="form-checkbox text-green-500 bg-gray-700 border-green-500"
                  />
                  <span className="text-sm text-green-400">Use NVIDIA GPU</span>
                  {useGPU ? <Zap className="w-5 h-5 text-green-500" /> : <Cpu className="w-5 h-5 text-green-500" />}
                </label>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                  disabled={(!file && !youtubeUrl) || isLoading}
                >
                  {isLoading ? (
                    <Loader className="animate-spin mx-auto" />
                  ) : (
                    'Transcribe'
                  )}
                </button>
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 flex items-center justify-center"
                >
                  <Mic className="mr-2" /> {isRecording ? 'Stop' : 'Record'}
                </button>
              </div>
            </form>
          </div>
          <div>
            {transcription.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-green-500">Transcription:</h2>
                  <button
                    onClick={toggleDisplayLanguage}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transition duration-300 flex items-center"
                  >
                    <Globe className="mr-2" /> {displayLanguage === 'en' ? 'EN' : 'ES'}
                  </button>
                </div>
                <div className="bg-gray-700 p-3 rounded h-64 overflow-y-auto">
                  {(displayLanguage === 'en' ? transcription : translatedTranscription).map((t, index) => (
                    <p key={index} className="text-sm text-green-400 mb-2">
                      <span className="font-bold">{t.time}</span> - {t.text}
                    </p>
                  ))}
                </div>
                <button
                  onClick={handleDownload}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 flex items-center justify-center"
                >
                  <Download className="mr-2" /> Download Transcription
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
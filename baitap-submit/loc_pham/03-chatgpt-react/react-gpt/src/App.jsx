import { useState, useEffect } from 'react';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: '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',
  dangerouslyAllowBrowser: true,
});

function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const apiKey = window.localStorage.getItem('apiKey')
    if (!apiKey) {
      const newApiKey = window.prompt('Nhập API Key của bạn (groq AI):');
      if (newApiKey) {
        window.localStorage.setItem('apiKey', apiKey);
      }
    }
    
  }, []);

  const sendMessage = async () => {
    setMessage('');

    const userMessage = { role: 'user', content: message };
    const waitingBotMessage = {
      role: 'assistant',
      content: 'Vui lòng chờ bot trả lời...',
    };
    setChatHistory([...chatHistory, userMessage, waitingBotMessage]);

    const chatCompletion = await client.chat.completions.create({
      messages: [...chatHistory, userMessage],
      model: 'gemma2-9b-it',
    });

    const response = chatCompletion.choices[0].message.content;
    const botMessage = { role: 'assistant', content: response };
    setChatHistory([...chatHistory, userMessage, botMessage]);
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <div className="container mx-auto p-4 flex flex-col h-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">ChatUI với React + OpenAI</h1>

        <form className="flex">
          <input
            value={message}
            type="text"
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tin nhắn của bạn..."
            className="flex-grow p-2 rounded-l border border-gray-300"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            onClick={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            Gửi tin nhắn
          </button>
        </form>

        <div className="flex-grow overflow-y-auto mt-4 bg-white rounded shadow p-4">
          {chatHistory?.map((message) => (
            <div
              key={message.content}
              className={`mb-2 ${
                message.role === 'assistant' ? 'text-right' : 'text-left'
              }`}
            >
              <p className="text-gray-600 text-sm capitalize">{message.role}</p>
              <p
                className={`${
                  message.role === 'assistant' ? 'bg-green-100' : 'bg-blue-100'
                } p-2 rounded-lg inline-block whitespace-pre-line`}
              >
                {message.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

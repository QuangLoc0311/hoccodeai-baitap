import { useState, useEffect } from 'react';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: window.localStorage.getItem('apiKey'),
  dangerouslyAllowBrowser: true,
});

function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'user',
      content: 'Hello: How are you?',
    },
    {
      role: 'assistant',
      content: "I'm fine. Thank you",
    },
  ]);

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
    const userMessage = [
      {
        role: 'user',
        content: message,
      },
    ];

    const waitingBotMessage = {
      role: 'assistant',
      content: 'Waiting...',
    };

    setChatHistory([...chatHistory, userMessage, waitingBotMessage]);
    setMessage('');

    try {
      const chatCompletion = await client.chat.completions.create({
        messages: [...chatHistory, userMessage], // Include full chat history
        model: 'gemma2-9b-it',
        stream: true,
      });

      let fullResponse = '';

      // Handle streaming response
      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;

        // Update chat history with accumulated response
        setChatHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: fullResponse,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error appropriately
    }
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

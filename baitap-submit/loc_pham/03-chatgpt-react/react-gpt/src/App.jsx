import { useState, useEffect } from 'react';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: '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',
  dangerouslyAllowBrowser: true,
});

function isBotMessage(chatMessage) {
  return chatMessage.role === 'assistant';
}

function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    const apiKey = window.localStorage.getItem('apiKey')
    const oldChatHistory = JSON.parse(window.localStorage.getItem('chatHistory')) || []
    if (oldChatHistory.length > 0) {
      setChatHistory(oldChatHistory)
    }
    if (!apiKey) {
      const newApiKey = window.prompt('Nhập API Key của bạn (groq AI):');
      if (newApiKey) {
        window.localStorage.setItem('apiKey', apiKey);
      }
    }
    
  }, []);

  useEffect(() => {
    window.localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const sendMessage = async (e) => {
    e.preventDefault();

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
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of chatCompletion) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullResponse += content;
      setChatHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: fullResponse,
        };
        return updated;
      });
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    //remove from local storage
    window.localStorage.removeItem('chatHistory');
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <div className="container mx-auto p-4 flex flex-col h-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">ChatUI với React + OpenAI</h1>
        <form className="flex" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Tin nhắn của bạn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-2 rounded-l border border-gray-300"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
          >
            Gửi tin nhắn
          </button>
        </form>
        <button onClick={clearChatHistory} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 cursor-pointer">Xóa lịch sử</button>

        <div className="flex-grow overflow-y-auto mt-4 bg-white rounded shadow p-4">
          {chatHistory.map((chatMessage, i) => (
            <div
              key={i}
              className={`mb-2 ${
                isBotMessage(chatMessage) ? 'text-right' : ''
              }`}
            >
              <p className="text-gray-600 text-sm">
                {isBotMessage(chatMessage) ? 'Bot' : 'User'}
              </p>
              <p
                className={`p-2 rounded-lg inline-block text-left ${
                  isBotMessage(chatMessage) ? 'bg-green-100' : 'bg-blue-100'
                }`}
              >
                {chatMessage.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

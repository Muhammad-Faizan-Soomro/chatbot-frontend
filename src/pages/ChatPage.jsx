import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios"; // your Axios instance
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await api.get("/chat/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formatted = res.data.reverse().flatMap((entry) => [
          {
            role: "user",
            content: entry.message,
            timestamp: entry.timestamp,
          },
          {
            role: "bot",
            content: entry.response,
            timestamp: entry.timestamp,
          },
        ]);

        setMessages(formatted);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };

    fetchHistory();
  }, [token, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      // Optimistically update UI
      const userMsg = {
        role: "user",
        content: input,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const res = await api.post(
        "/chat/",
        { message: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botMsg = {
        role: "bot",
        content: res.data.response,
        timestamp: res.data.timestamp,
      };

      setMessages((prev) => [...prev, botMsg]);
      setInput("");
    } catch (err) {
      console.error("Chat failed", err);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center mb-4">Chat with Bot 🤖</h1>

      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-2 shadow-inner">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
              msg.role === "user"
                ? "ml-auto bg-blue-100 text-right"
                : "mr-auto bg-green-100 text-left"
            }`}
          >
            <p>{msg.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit(e)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}


// app/chat/page.js
"use client";

import { useState } from "react";
import { Search, Send, Paperclip, Smile } from "lucide-react";

export default function Chat() {
  const [conversations, setConversations] = useState([
    {
      id: "gen-chat",
      name: "General Chat",
      type: "group",
      unread: 2,
      messages: [
        { user: "Dr. Emily Carter", text: "Has anyone seen an increase in avian flu cases in the Green Valley area?", time: "10:30 AM" },
        { user: "You", text: "Not on my farm, but I'll keep an eye out.", time: "10:32 AM" },
        { user: "John Doe", text: "We had a scare last week, but it turned out to be a false alarm.", time: "10:35 AM" },
      ],
    },
    {
      id: "user-jd",
      name: "John Doe",
      type: "private",
      unread: 0,
      messages: [
        { user: "You", text: "Hey John, can you check the feed levels in Barn 3?", time: "9:15 AM" },
        { user: "John Doe", text: "On it. Looks like we're running low on the starter feed.", time: "9:17 AM" },
      ],
    },
    {
        id: "user-ec",
        name: "Dr. Emily Carter",
        type: "private",
        unread: 1,
        messages: [
            { user: "Dr. Emily Carter", text: "I have the lab results back for Flock B. Please give me a call when you have a moment.", time: "Yesterday" },
        ],
    },
  ]);

  const [activeConversation, setActiveConversation] = useState(conversations[0]);

  return (
    <div className="flex h-[calc(100vh-10rem)]">
      {/* Sidebar */}
      <div className="w-1/4 bg-[color:var(--card)] border-r border-[color:var(--border)] flex flex-col">
        <div className="p-4 border-b border-[color:var(--border)]">
          <h2 className="text-xl font-bold">Conversations</h2>
          <div className="relative mt-4">
            <input
              type="text"
              placeholder="Search conversations..."
              className="input w-full pl-10"
            />
            <Search
              className="absolute left-3 top-2.5 text-[color:var(--muted-foreground)]"
              size={18}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              className={`p-4 cursor-pointer border-l-4 ${activeConversation.id === convo.id
                  ? "border-l-[color:var(--primary)] bg-[color:var(--accent)]"
                  : "border-l-transparent hover:bg-[color:var(--muted)]"
                }`}
              onClick={() => setActiveConversation(convo)}
            >
              <div className="flex justify-between">
                <span className="font-medium">{convo.name}</span>
                {convo.unread > 0 && (
                  <span className="bg-[color:var(--primary)] text-white text-xs rounded-full px-2 py-1">
                    {convo.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-[color:var(--border)] flex items-center">
          <h2 className="text-xl font-bold">{activeConversation.name}</h2>
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-[color:var(--background)]">
          <div className="space-y-6">
            {activeConversation.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.user === "You" ? "flex-row-reverse" : ""}`}>
                <div className="w-10 h-10 rounded-full bg-[color:var(--muted)] flex items-center justify-center font-bold">
                  {msg.user.charAt(0)}
                </div>
                <div
                  className={`p-3 rounded-lg max-w-lg ${msg.user === "You"
                      ? "bg-[color:var(--primary)] text-white"
                      : "bg-[color:var(--card)]"
                    }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-[color:var(--card)] border-t border-[color:var(--border)]">
          <div className="relative">
            <input
              type="text"
              placeholder="Type a message..."
              className="input w-full pr-28"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button className="p-2 rounded-full hover:bg-[color:var(--muted)]">
                    <Smile size={20} className="text-[color:var(--muted-foreground)]" />
                </button>
                <button className="p-2 rounded-full hover:bg-[color:var(--muted)]">
                    <Paperclip size={20} className="text-[color:var(--muted-foreground)]" />
                </button>
                <button className="btn-primary">
                    <Send size={20} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { IoChatbox, IoExpand } from "react-icons/io5";
import { ImCross } from "react-icons/im";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

export default function ChatBox({
  chatMessages,
  chatInput,
  setChatInput,
  handleChatKeyDown,
  sendChatMessage,
}) {
  const [minimized, setMinimized] = useState(false);
  const [visible, setVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 448, height: 480 });

  const boxRef = useRef(null);

  const startDrag = (e) => {
    if (isResizing) return;
    setIsDragging(true);
    const startX = e.clientX || e.touches[0].clientX;
    const startY = e.clientY || e.touches[0].clientY;
    const rect = boxRef.current.getBoundingClientRect();
    setOffset({ x: startX - rect.left, y: startY - rect.top });
  };

  const duringDrag = (e) => {
    const moveX = e.clientX || e.touches[0].clientX;
    const moveY = e.clientY || e.touches[0].clientY;

    if (isDragging) {
      setPosition({ x: moveX - offset.x, y: moveY - offset.y });
    } else if (isResizing) {
      const newWidth = moveX - boxRef.current.getBoundingClientRect().left;
      const newHeight = moveY - boxRef.current.getBoundingClientRect().top;
      setDimensions({
        width: Math.max(320, Math.min(newWidth, window.innerWidth - 40)),
        height: Math.max(320, Math.min(newHeight, window.innerHeight - 40)),
      });
    }
  };

  const endDrag = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", duringDrag);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", duringDrag);
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", duringDrag);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", duringDrag);
      window.removeEventListener("touchend", endDrag);
    };
  }, [isDragging, isResizing, offset]);

  if (!visible) return null;

  return (
    <div
      ref={boxRef}
      className="fixed z-50 border border-zinc-700/50 rounded-2xl shadow-xl bg-zinc-900/95 backdrop-blur-sm text-white transition-all duration-300 ease-in-out transform hover:shadow-2xl"
      style={{
        left: position.x,
        top: position.y,
        width: dimensions.width,
        height: minimized ? 48 : dimensions.height,
        touchAction: "none",
        maxWidth: "95vw",
        maxHeight: "95vh",
        minWidth: 320,
        minHeight: minimized ? 48 : 320,
        display: "flex",
        flexDirection: "column",
        willChange: "transform, width, height",
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-t-2xl cursor-move select-none transition-colors duration-200 hover:bg-gradient-to-r hover:from-zinc-700 hover:to-zinc-800"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <span className="flex items-center gap-2 text-lg font-semibold text-green-400">
          <IoChatbox
            className="transition-transform duration-200 group-hover:scale-110"
            size={20}
          />
          Chat
        </span>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setMinimized(!minimized)}
            className="text-zinc-300 hover:text-green-400 transition-transform duration-200 hover:scale-110 focus:outline-none"
            aria-label={minimized ? "Maximize" : "Minimize"}
          >
            {minimized ? <FaAngleUp size={16} /> : <FaAngleDown size={16} />}
          </button>
          <button
            onClick={() => setVisible(false)}
            className="text-zinc-300 hover:text-red-500 transition-transform duration-200 hover:scale-110 focus:outline-none"
            aria-label="Close"
          >
            <ImCross size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      {!minimized && (
        <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-900">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className="bg-zinc-800/50 rounded-lg px-4 py-3 text-sm break-words transform transition-all duration-200 hover:bg-zinc-800 hover:scale-[1.01]"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-green-400 font-medium">
                    {msg.userName}
                  </span>
                  <span className="text-xs text-zinc-500">{msg.timestamp}</span>
                </div>
                <div className="text-zinc-200 leading-relaxed">
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-zinc-700/50 bg-zinc-900/50">
            <textarea
              rows={3}
              className="w-full bg-zinc-800/50 text-white p-3 rounded-lg resize-none outline-none border border-zinc-700/50 focus:ring-2 focus:ring-green-500/50 transition-all duration-200 placeholder-zinc-500"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleChatKeyDown}
            />
            <button
              onClick={sendChatMessage}
              className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Resize Handle */}
      {!minimized && (
        <div
          onMouseDown={() => setIsResizing(true)}
          onTouchStart={() => setIsResizing(true)}
          className="absolute bottom-2 right-2 w-6 h-6 cursor-nwse-resize text-zinc-500 hover:text-green-400 transition-transform duration-200 hover:scale-110"
        >
          <IoExpand size={19} />
        </div>
      )}
    </div>
  );
}

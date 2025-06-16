import {
  useLocation,
  useParams,
  useNavigate,
  Navigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import Client from "./Client";
import Editor from "./Editor";
import { availableLanguages } from "./Language";
import { availableThemes, themeMap, formatThemeName } from "./Theme";
import { initSocket } from "../config/socket";
import ChatBox from "./ChatBox";
import { Menu, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MdOutlineComputer } from "react-icons/md";
import SidebarButton from "./SidebarButton";

export default function EditorPage() {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [clients, setClients] = useState([]);
  const [theme, setTheme] = useState("dracula");
  const [language, setLanguage] = useState("javascript");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [mode, setMode] = useState("dark"); // Dark or Light mode

  const socketRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const userName = location.state?.userName;

  const handleError = (e) => {
    console.error("Socket error:", e);
    toast.error("Connection failed");
    navigate("/");
  };

  const handleLeave = () => {
    if (socketRef.current) {
      socketRef.current.emit("user-left", {
        roomId,
        userName,
        socketId: socketRef.current.id,
      });
      socketRef.current.disconnect();
    }
    navigate("/");
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied!");
    } catch {
      toast.error("Failed to copy Room ID.");
    }
  };

  const sendChatMessage = () => {
    if (chatInput.trim()) {
      socketRef.current?.emit("chat-message", {
        roomId,
        message: chatInput.trim(),
      });
      setChatInput("");
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  useEffect(() => {
    if (!userName) {
      toast.error("Username missing.");
      navigate("/");
      return;
    }

    const init = async () => {
      try {
        socketRef.current = await initSocket();
        socketRef.current.on("connect_error", handleError);
        socketRef.current.on("connect_failed", handleError);

        socketRef.current.on("connect", () => {
          socketRef.current.emit("join", { roomId, userName });
        });

        socketRef.current.on("newUser", ({ clients, userName: joinedUser }) => {
          if (joinedUser !== userName) toast.success(`${joinedUser} joined`);
          setClients(clients);
        });

        socketRef.current.on(
          "user-left",
          ({ socketId, userName: leftUser }) => {
            setClients((prev) => prev.filter((c) => c.socketId !== socketId));
            if (leftUser !== userName)
              toast(`${leftUser} left the room.`, { icon: "👋" });
          }
        );

        socketRef.current.on("disconnect", () => {
          toast("Disconnected from the server.", { icon: "🔌" });
        });

        socketRef.current.on(
          "chat-message",
          ({ userName, message, timestamp }) => {
            setChatMessages((prev) => [
              ...prev,
              {
                userName,
                message,
                timestamp: new Date(timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
          }
        );
      } catch (err) {
        handleError(err);
      }
    };

    init();

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off();
    };
  }, [roomId, userName, navigate]);

  if (!location.state) return <Navigate to="/" />;

  return (
    <div
      className={`flex flex-col h-screen ${
        mode === "dark" ? "bg-[#121212] text-white" : "bg-white text-black"
      } relative`}
    >
      {/* Header */}
      <header
        className={`flex justify-between items-center px-4 py-3 ${
          mode === "dark"
            ? "bg-zinc-900 text-white border-zinc-800"
            : "bg-gray-100 text-black border-gray-300"
        } border-b shadow-md relative`}
      >
        <div className="flex items-center space-x-3 gap-3 w-full">
          <button
            className="block lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={28} />
          </button>

          <div className="text-xl sm:text-2xl font-bold text-green-400 flex items-center gap-2 ml-auto sm:ml-0">
            <MdOutlineComputer className="text-2xl" />
            CODECAST
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-sm text-right">
            <p>
              <span className="font-semibold">Room:</span> {roomId}
            </p>
            <p>
              <span className="font-semibold">You:</span> {userName}
            </p>
            <p>
              <span className="font-semibold">Users:</span> {clients.length}
            </p>
          </div>
          {/* Theme Toggle */}
          <button
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            className={`ml-4 px-3 py-1 border rounded text-sm ${
              mode === "dark"
                ? "bg-zinc-800 border-zinc-600 hover:bg-zinc-700"
                : "bg-gray-200 border-gray-400 hover:bg-gray-300"
            }`}
          >
            {mode === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden ">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } lg:block absolute lg:static z-20 w-64 ${
            mode === "dark"
              ? "bg-zinc-900 text-white border-zinc-800"
              : "bg-gray-100 text-black border-gray-300"
          } p-4 flex flex-col justify-between transition-all duration-300`}
        >
          <div className="space-y-2 mb-4 lg:hidden">
            <SidebarButton
              onClick={copyRoomId}
              color="green"
              label="📋 Copy Room ID"
            />
            <SidebarButton
              onClick={handleLeave}
              color="red"
              label="🚪 Leave Room"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">
              Members ({clients.length})
            </h2>
            <ul className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {clients.map((client) => (
                <li key={client.socketId}>
                  <Client name={client.userName} mode={mode} />
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2 mt-6 hidden lg:block">
            <SidebarButton
              onClick={copyRoomId}
              color="green"
              label="📋 Copy Room ID"
            />
            <SidebarButton
              onClick={handleLeave}
              color="red"
              label="🚪 Leave Room"
            />
          </div>
        </aside>

        {/* Main Section */}
        <main className="flex-1 flex flex-col p-4 space-y-4 overflow-hidden relative">
          {/* Theme + Language Selectors + Chat Toggle */}
          <div className="flex flex-wrap gap-6 items-end justify-between">
            <div className="flex gap-6">
              <div className="flex flex-col">
                <label
                  htmlFor="themeSelect"
                  className="text-sm font-medium mb-1"
                >
                  Theme
                </label>
                <select
                  id="themeSelect"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className={`px-3 py-2 rounded-md border focus:outline-none ${
                    mode === "dark"
                      ? "bg-zinc-800 text-white border-zinc-700"
                      : "bg-white text-black border-gray-400"
                  }`}
                >
                  {availableThemes.map((t) => (
                    <option key={t} value={t} className="text-black">
                      {formatThemeName(t)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="languageSelect"
                  className="text-sm font-medium mb-1"
                >
                  Language
                </label>
                <select
                  id="languageSelect"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`px-3 py-2 rounded-md border focus:outline-none ${
                    mode === "dark"
                      ? "bg-zinc-800 text-white border-zinc-700"
                      : "bg-white text-black border-gray-400"
                  }`}
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang} value={lang} className="text-black">
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* <div className="relative z-50 ">
              <label
                htmlFor="languageSelect"
                className="text-sm font-medium mb-1"
              >
                chat
              </label>
              <button
                onClick={() => setChatVisible(!chatVisible)}
                className={`flex items-center px-6 py-2.5 rounded-md border focus:outline-none ${
                  mode === "dark"
                    ? "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
                    : "bg-white text-black border-gray-400 hover:bg-gray-300"
                }`}
              >
                <MessageCircle size={18} className="mr-2" />
                <span className="hidden sm:inline">
                  {chatVisible ? "Hide Chat" : "Show Chat"}
                </span>
              </button>
            </div> */}
            <div className="relative z-50 flex flex-col items-center">
              <label
                htmlFor="languageSelect"
                className="text-sm font-medium mb-1 text-center"
              >
                Chat
              </label>
              <button
                onClick={() => setChatVisible(!chatVisible)}
                className={`flex items-center px-6 py-2.5 rounded-md border focus:outline-none ${
                  mode === "dark"
                    ? "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
                    : "bg-white text-black border-gray-400 hover:bg-gray-300"
                }`}
              >
                <MessageCircle size={18} className="mr-2" />
                <span className="hidden sm:inline">
                  {chatVisible ? "Hide " : "Show"}
                </span>
              </button>
            </div>
          </div>

          {/* Editor */}
          <div
            className={`flex-1 overflow-hidden rounded-lg border ${
              mode === "dark" ? "border-zinc-700" : "border-gray-300"
            }`}
          >
            <Editor
              defaultCode={`// Start Your Code ...`}
              theme={themeMap[theme] || themeMap["dracula"]}
              language={language}
              socket={socketRef.current}
              roomId={roomId}
            />
          </div>

          {/* ChatBox */}
          {chatVisible && (
            <div className="fixed bottom-4 right-4 z-50 w-full max-w-xs sm:max-w-sm md:max-w-md">
              <ChatBox
                chatMessages={chatMessages}
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleChatKeyDown={handleChatKeyDown}
                sendChatMessage={sendChatMessage}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

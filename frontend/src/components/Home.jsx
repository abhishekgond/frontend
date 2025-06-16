import React, { useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuId } from "uuid";
import { useNavigate } from "react-router-dom";
import { MdOutlineComputer } from "react-icons/md";

export default function Home() {
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const generateRoomId = (e) => {
    e.preventDefault();
    const newRoomId = uuId();
    setRoomId(newRoomId);
    toast.success("Room Id Created successfully");
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (!roomId || !userName) {
      toast.error("Please enter both room id and user name");
      navigate("/");
    } else {
      // Here you can call your API to join the room
      navigate(`/editor/${roomId}`, { state: { userName } });
      toast.success("Room Is Created Succesfully ");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="bg-zinc-900 p-8 rounded-xl shadow-lg w-[350px] sm:w-[400px]">
        <div className="flex flex-col items-center mb-6">
          <div className="text-3xl mb-2">
            <MdOutlineComputer />
          </div>
          <h1 className="text-xl font-bold">CODECAST</h1>
        </div>
        <h2 className="text-lg font-semibold text-center mb-6">
          Enter the <span className="text-green-400">ROOM ID</span>
        </h2>
        <form className="space-y-4">
          <input
            type="text"
            value={roomId}
            onChange={(e) => {
              // e.preventDefault();
              setRoomId(e.target.value);
            }}
            placeholder="ROOM ID"
            className="w-full px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="USERNAME"
            className="w-full px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            onClick={joinRoom}
            className="w-full py-2 bg-green-600 hover:bg-green-700 transition rounded font-semibold"
          >
            JOIN
          </button>
        </form>
        <p className="text-center text-sm mt-6 text-zinc-400">
          Don’t have a room ID?{" "}
          <span
            className="text-green-400 cursor-pointer hover:underline"
            onClick={generateRoomId}
          >
            New Room
          </span>
        </p>
      </div>
    </div>
  );
}

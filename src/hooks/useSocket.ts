import { useEffect, useMemo } from "react";
import { io, Socket } from "socket.io-client";

const useSocket = (): Socket => {
  const socket = useMemo(() => {
    const s = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8080", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      query: { provider: "face" },
    });
    console.log(
      "Connecting to:",
      import.meta.env.VITE_SOCKET_URL || "http://localhost:8080"
    );

    s.on("connect", () => {
      console.log("WebSocket connected:", s.id);
    });

    s.on("connect_error", (error: Error) => {
      console.error("WebSocket connection error:", error.message);
    });

    s.on("disconnect", (reason: string) => {
      console.warn("WebSocket disconnected:", reason);
    });

    s.on("reconnect_attempt", (attempt: number) => {
      console.log(`WebSocket reconnect attempt ${attempt}`);
    });

    s.on("reconnect", () => {
      console.log("WebSocket reconnected successfully");
    });

    return s;
  }, []);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return socket;
};

export default useSocket;

import { useEffect, useRef, useState, useCallback } from "react";

const useWebSocket = (url, token) => {
  const ws = useRef(null);
  const [connectionState, setConnectionState] = useState("CONNECTING");
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const subscriptions = useRef(new Set());

  const connect = useCallback(() => {
    if (!url || !token) return;

    try {
      ws.current = new WebSocket(`${url}?token=${encodeURIComponent(token)}`);
      setConnectionState("CONNECTING");
      setError(null);

      ws.current.onopen = () => {
        console.log("WebSocket connected");
        setConnectionState("OPEN");
        setError(null);

        // Re-subscribe to all previous subscriptions
        subscriptions.current.forEach((subscription) => {
          ws.current.send(JSON.stringify(subscription));
        });
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.current.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("WebSocket connection error");
      };

      ws.current.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnectionState("CLOSED");

        // Handle different close codes
        if (event.code === 4001) {
          setError("Authentication token missing");
        } else if (event.code === 4002) {
          setError("Invalid or expired token");
        } else if (event.code === 4003) {
          setError("Session not found or expired");
        } else if (event.code === 1011) {
          setError("Internal server error");
        } else if (event.code !== 1000) {
          // Attempt to reconnect for unexpected closures
          setTimeout(() => {
            if (ws.current?.readyState === WebSocket.CLOSED) {
              connect();
            }
          }, 3000);
        }
      };
    } catch (err) {
      console.error("Failed to create WebSocket connection:", err);
      setError("Failed to establish connection");
      setConnectionState("CLOSED");
    }
  }, [url, token]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, "Client disconnect");
    }
  }, []);

  const subscribe = useCallback((channel, campaignId, subCampaignId) => {
    const subscription = {
      action: "subscribe",
      channel,
      ...(campaignId && { campaignId }),
      ...(subCampaignId && { subCampaignId }),
    };

    subscriptions.current.add(subscription);

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(subscription));
    }
  }, []);

  const unsubscribe = useCallback((channel, campaignId, subCampaignId) => {
    const subscription = {
      action: "unsubscribe",
      channel,
      ...(campaignId && { campaignId }),
      ...(subCampaignId && { subCampaignId }),
    };

    // Remove from subscriptions
    subscriptions.current.forEach((sub) => {
      if (
        sub.channel === channel &&
        sub.campaignId === campaignId &&
        sub.subCampaignId === subCampaignId
      ) {
        subscriptions.current.delete(sub);
      }
    });

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(subscription));
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionState,
    lastMessage,
    error,
    subscribe,
    unsubscribe,
    sendMessage,
    reconnect: connect,
  };
};

export default useWebSocket;

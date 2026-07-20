/**
 * Hearth presence client — WS /presence on signal server
 */
(function (global) {
  const STATE = {
    ws: null,
    url: null,
    username: null,
    roster: new Map(), // username -> { status, statusText, displayName }
    onRoster: null,
    onStatus: null,
    retry: 0,
    closed: false,
    generation: 0,
    retryTimer: null,
    heartbeatTimer: null,
    displayName: null,
    status: "online",
    statusText: "",
  };

  function connect({ url, username, displayName, status, statusText, onRoster, onStatus }) {
    disconnect();
    const generation = ++STATE.generation;
    STATE.closed = false;
    STATE.url = url;
    STATE.username = username;
    STATE.onRoster = onRoster;
    STATE.onStatus = onStatus;
    STATE.displayName = displayName || username;
    STATE.status = status || "online";
    STATE.statusText = statusText || "";

    const ws = new WebSocket(url);
    STATE.ws = ws;

    ws.onopen = () => {
      if (generation !== STATE.generation) return ws.close();
      ws.send(
        JSON.stringify({
          type: "identify",
          username,
          displayName: displayName || username,
          status: status || "online",
          statusText: statusText || "",
        })
      );
      clearInterval(STATE.heartbeatTimer);
      STATE.heartbeatTimer = setInterval(() => {
        if (STATE.ws === ws && ws.readyState === 1) ws.send(JSON.stringify({ type: "ping" }));
      }, 20000);
    };

    ws.onmessage = (ev) => {
      if (generation !== STATE.generation) return;
      let msg;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (msg.type === "identified" || msg.type === "roster") {
        if (msg.type === "identified") STATE.retry = 0;
        STATE.roster.clear();
        for (const u of msg.users || []) {
          if (u.username) {
            STATE.roster.set(u.username, {
              status: u.status || "online",
              statusText: u.statusText || "",
              displayName: u.displayName || u.username,
            });
          }
        }
        if (typeof STATE.onRoster === "function") STATE.onRoster(STATE.roster);
      }
      if (msg.type === "status_update" && msg.username) {
        STATE.roster.set(msg.username, {
          status: msg.status || "online",
          statusText: msg.statusText || "",
          displayName: msg.displayName || msg.username,
        });
        if (typeof STATE.onStatus === "function") STATE.onStatus(msg);
        if (typeof STATE.onRoster === "function") STATE.onRoster(STATE.roster);
      }
      if (msg.type === "error" && msg.code === "USERNAME_IN_USE") {
        STATE.retry = Math.max(STATE.retry, 8);
      }
    };

    ws.onclose = () => {
      if (STATE.ws === ws) STATE.ws = null;
      clearInterval(STATE.heartbeatTimer);
      STATE.heartbeatTimer = null;
      if (STATE.closed || generation !== STATE.generation) return;
      const delay = Math.min(15000, 800 * Math.pow(1.5, STATE.retry++));
      STATE.retryTimer = setTimeout(() => {
        if (!STATE.closed && STATE.url) {
          connect({
            url: STATE.url,
            username: STATE.username,
            displayName: STATE.displayName,
            status: STATE.status,
            statusText: STATE.statusText,
            onRoster: STATE.onRoster,
            onStatus: STATE.onStatus,
          });
        }
      }, delay);
    };

    ws.onerror = () => {
      try {
        ws.close();
      } catch {}
    };

    return () => disconnect();
  }

  function updateStatus({ status, statusText }) {
    STATE.status = status || "online";
    STATE.statusText = statusText || "";
    if (!STATE.ws || STATE.ws.readyState !== 1) return;
    STATE.ws.send(
      JSON.stringify({
        type: "status_update",
        status,
        statusText: statusText || "",
      })
    );
  }

  function disconnect() {
    STATE.closed = true;
    STATE.generation++;
    clearTimeout(STATE.retryTimer);
    clearInterval(STATE.heartbeatTimer);
    STATE.retryTimer = null;
    STATE.heartbeatTimer = null;
    if (STATE.ws) {
      try {
        STATE.ws.close();
      } catch {}
    }
    STATE.ws = null;
    STATE.roster.clear();
  }

  function getRoster() {
    return STATE.roster;
  }

  global.HearthPresence = {
    connect,
    updateStatus,
    disconnect,
    getRoster,
  };
})(typeof window !== "undefined" ? window : globalThis);

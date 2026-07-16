/**
 * Hearth cloud client (Supabase).
 * Medya P2P kalır; bu katman auth + profil + arkadaş + presence.
 * Config yoksa / hata olursa null döner → yerel moda düşülür.
 */
(function (global) {
  const STATE = {
    client: null,
    config: null,
    session: null,
    profile: null,
    presenceChannel: null,
    onlineMap: new Map(), // username -> { status, statusText, lastSeen }
  };

  function isEnabled() {
    return !!(STATE.client && STATE.config && STATE.config.enabled !== false);
  }

  async function init(config) {
    if (!config || !config.supabaseUrl || !config.supabaseAnonKey) {
      STATE.client = null;
      STATE.config = null;
      return { ok: false, reason: "no-config" };
    }
    if (typeof supabase === "undefined" || !supabase.createClient) {
      return { ok: false, reason: "sdk-missing" };
    }
    STATE.config = config;
    STATE.client = supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
    const { data } = await STATE.client.auth.getSession();
    STATE.session = data.session || null;
    if (STATE.session) {
      await refreshProfile();
    }
    return { ok: true, session: STATE.session };
  }

  async function refreshProfile() {
    if (!STATE.client || !STATE.session) {
      STATE.profile = null;
      return null;
    }
    const uid = STATE.session.user.id;
    const { data, error } = await STATE.client
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    if (error) throw error;
    STATE.profile = data;
    return data;
  }

  function mapProfile(p) {
    if (!p) return null;
    return {
      id: p.id,
      cloud: true,
      email: STATE.session?.user?.email || "",
      username: p.username,
      displayName: p.display_name || p.username,
      about: p.about || "",
      status: p.status || "online",
      statusText: p.status_text || "",
      socials: p.socials || {},
      avatarUrl: p.avatar_url || null,
      peerId: p.peer_id || null,
      createdAt: p.created_at ? Date.parse(p.created_at) : Date.now(),
    };
  }

  function friendlyNetworkError(err) {
    const msg = String(err?.message || err || "");
    const low = msg.toLowerCase();
    if (
      low.includes("failed to fetch") ||
      low.includes("networkerror") ||
      low.includes("network request failed") ||
      low.includes("fetch failed") ||
      low.includes("load failed")
    ) {
      return (
        "Sunucuya ulaşılamadı (Failed to fetch). " +
        "cloud/config.json içinde URL sadece https://PROJE.supabase.co olmalı " +
        "(sonunda /rest/v1/ olmamalı). Publishable veya anon key doğru mu? " +
        "Supabase projesi duraklatılmış (paused) olabilir — dashboard’dan Restore et."
      );
    }
    return msg;
  }

  async function register({ email, password, username, displayName }) {
    if (!STATE.client) throw new Error("Bulut yapılandırması yok");
    const un = String(username || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._]/g, "");
    if (un.length < 3) throw new Error("Kullanıcı adı en az 3 karakter");

    try {
      // Önce username müsait mi?
      const { data: existing, error: checkErr } = await STATE.client
        .from("profiles")
        .select("id")
        .eq("username", un)
        .maybeSingle();
      if (checkErr) {
        // Tablo yoksa / ağ hatası — anlamlı mesaj
        throw checkErr;
      }
      if (existing) throw new Error("Bu kullanıcı adı alınmış");
    } catch (e) {
      throw new Error(friendlyNetworkError(e));
    }

    let data, error;
    try {
      const res = await STATE.client.auth.signUp({
        email: String(email).trim().toLowerCase(),
        password,
        options: {
          data: {
            username: un,
            display_name: displayName || un,
          },
        },
      });
      data = res.data;
      error = res.error;
    } catch (e) {
      throw new Error(friendlyNetworkError(e));
    }
    if (error) throw new Error(friendlyNetworkError(error) || error.message);
    STATE.session = data.session;
    // Email confirm açıksa session null olabilir
    if (!STATE.session && data.user) {
      // profil trigger ile oluşur; giriş sonra
      return {
        needsConfirm: true,
        user: { email, username: un, displayName: displayName || un, cloud: true },
      };
    }
    await refreshProfile();
    // trigger username farklı ürettiyse düzelt
    if (STATE.profile && STATE.profile.username !== un) {
      await STATE.client
        .from("profiles")
        .update({
          username: un,
          display_name: displayName || un,
          updated_at: new Date().toISOString(),
        })
        .eq("id", STATE.profile.id);
      await refreshProfile();
    }
    return { needsConfirm: false, user: mapProfile(STATE.profile) };
  }

  async function login({ email, password }) {
    if (!STATE.client) throw new Error("Bulut yapılandırması yok");
    let data, error;
    try {
      const res = await STATE.client.auth.signInWithPassword({
        email: String(email).trim().toLowerCase(),
        password,
      });
      data = res.data;
      error = res.error;
    } catch (e) {
      throw new Error(friendlyNetworkError(e));
    }
    if (error) throw new Error(friendlyNetworkError(error) || error.message);
    STATE.session = data.session;
    await refreshProfile();
    return mapProfile(STATE.profile);
  }

  async function logout() {
    if (STATE.presenceChannel) {
      try {
        await STATE.client.removeChannel(STATE.presenceChannel);
      } catch {}
      STATE.presenceChannel = null;
    }
    if (STATE.client) await STATE.client.auth.signOut();
    STATE.session = null;
    STATE.profile = null;
    STATE.onlineMap.clear();
  }

  async function currentUser() {
    if (!STATE.client) return null;
    const { data } = await STATE.client.auth.getSession();
    STATE.session = data.session;
    if (!STATE.session) return null;
    await refreshProfile();
    return mapProfile(STATE.profile);
  }

  async function updateProfile(patch) {
    if (!STATE.client || !STATE.session) throw new Error("Oturum yok");
    const row = {};
    if (patch.displayName != null) row.display_name = String(patch.displayName).slice(0, 32);
    if (patch.about != null) row.about = String(patch.about).slice(0, 500);
    if (patch.status != null) row.status = patch.status;
    if (patch.statusText != null) row.status_text = String(patch.statusText).slice(0, 80);
    if (patch.socials != null) row.socials = patch.socials;
    if (patch.peerId != null) row.peer_id = patch.peerId;
    if (patch.avatarUrl != null) row.avatar_url = patch.avatarUrl;
    row.updated_at = new Date().toISOString();
    row.last_seen = new Date().toISOString();
    const { error } = await STATE.client.from("profiles").update(row).eq("id", STATE.session.user.id);
    if (error) throw error;
    await refreshProfile();
    return mapProfile(STATE.profile);
  }

  async function findByUsername(username) {
    const un = String(username || "").trim().toLowerCase();
    const { data, error } = await STATE.client
      .from("profiles")
      .select("*")
      .eq("username", un)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async function listFriends() {
    if (!STATE.session) return [];
    const uid = STATE.session.user.id;
    const { data, error } = await STATE.client
      .from("friendships")
      .select("id, status, friend:friend_id(id, username, display_name, about, status, status_text, socials, avatar_url, peer_id, last_seen)")
      .eq("user_id", uid)
      .eq("status", "accepted");
    if (error) throw error;
    return (data || []).map((row) => {
      const f = row.friend || {};
      return {
        username: f.username,
        displayName: f.display_name || f.username,
        about: f.about || "",
        remoteStatus: f.status,
        statusText: f.status_text || "",
        socials: f.socials || {},
        avatarUrl: f.avatar_url,
        peerId: f.peer_id,
        cloudId: f.id,
        lastSeen: f.last_seen,
        addedAt: Date.now(),
      };
    });
  }

  async function addFriendByUsername(username) {
    const profile = await findByUsername(username);
    if (!profile) throw new Error("Kullanıcı bulunamadı (bulutta kayıtlı olmalı).");
    if (profile.id === STATE.session.user.id) throw new Error("Kendini ekleyemezsin.");
    const uid = STATE.session.user.id;
    // çift yönlü accepted (basit model: hemen arkadaş)
    const { error: e1 } = await STATE.client.from("friendships").upsert(
      { user_id: uid, friend_id: profile.id, status: "accepted" },
      { onConflict: "user_id,friend_id" }
    );
    if (e1) throw e1;
    await STATE.client.from("friendships").upsert(
      { user_id: profile.id, friend_id: uid, status: "accepted" },
      { onConflict: "user_id,friend_id" }
    );
    return {
      username: profile.username,
      displayName: profile.display_name || profile.username,
      cloudId: profile.id,
      addedAt: Date.now(),
    };
  }

  async function logMissedCall({ calleeUsername, groupId }) {
    if (!STATE.session) return;
    const callee = await findByUsername(calleeUsername);
    if (!callee) return;
    await STATE.client.from("call_events").insert({
      caller_id: STATE.session.user.id,
      callee_id: callee.id,
      group_id: groupId || null,
      kind: "missed",
    });
  }

  /**
   * Presence: her kullanıcı kendi kanalında "online" track eder;
   * arkadaş kanallarına subscribe olur.
   */
  async function startPresence({ username, status, statusText, onChange }) {
    if (!STATE.client || !STATE.session) return () => {};
    if (STATE.presenceChannel) {
      try {
        await STATE.client.removeChannel(STATE.presenceChannel);
      } catch {}
    }

    const channel = STATE.client.channel("hearth-presence", {
      config: { presence: { key: username } },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      STATE.onlineMap.clear();
      for (const [key, metas] of Object.entries(state)) {
        const meta = metas[0] || {};
        STATE.onlineMap.set(key, {
          status: meta.status || "online",
          statusText: meta.statusText || "",
          online: true,
        });
      }
      if (typeof onChange === "function") onChange(STATE.onlineMap);
    });

    await channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          username,
          status: status || "online",
          statusText: statusText || "",
          at: Date.now(),
        });
        // last_seen DB
        try {
          await updateProfile({ status: status || "online", statusText: statusText || "" });
        } catch {}
      }
    });

    STATE.presenceChannel = channel;

    return async function stop() {
      try {
        await channel.untrack();
        await STATE.client.removeChannel(channel);
      } catch {}
      if (STATE.presenceChannel === channel) STATE.presenceChannel = null;
    };
  }

  async function trackPresenceUpdate({ status, statusText }) {
    if (!STATE.presenceChannel) return;
    const un = STATE.profile?.username;
    if (!un) return;
    await STATE.presenceChannel.track({
      username: un,
      status: status || "online",
      statusText: statusText || "",
      at: Date.now(),
    });
  }

  function getOnlineMap() {
    return STATE.onlineMap;
  }

  global.HearthCloud = {
    init,
    isEnabled: () => isEnabled(),
    register,
    login,
    logout,
    currentUser,
    updateProfile,
    listFriends,
    addFriendByUsername,
    findByUsername,
    logMissedCall,
    startPresence,
    trackPresenceUpdate,
    getOnlineMap,
    getProfile: () => mapProfile(STATE.profile),
  };
})(typeof window !== "undefined" ? window : globalThis);

const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const source = fs.readFileSync(
  path.join(__dirname, "..", "..", "public", "cloud", "hearth-cloud.js"),
  "utf8"
);

function makeCloud({ rpcData = null, rpcError = null, existingProfile = null, fallbackError = null }) {
  let signUpCalls = 0;
  let profileLookupCalls = 0;

  const client = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      signUp: async () => {
        signUpCalls++;
        return { data: { session: null, user: { id: "new-user" } }, error: null };
      },
    },
    rpc: async () => ({ data: rpcData, error: rpcError }),
    from(table) {
      assert.equal(table, "profiles");
      const query = {
        select() {
          return query;
        },
        eq() {
          return query;
        },
        async maybeSingle() {
          profileLookupCalls++;
          return { data: existingProfile, error: fallbackError };
        },
      };
      return query;
    },
  };

  const window = {};
  const context = vm.createContext({
    window,
    globalThis: window,
    supabase: { createClient: () => client },
    console: { warn() {}, log() {}, error() {} },
    Map,
    Date,
  });
  vm.runInContext(source, context, { filename: "hearth-cloud.js" });

  return {
    api: window.HearthCloud,
    calls: () => ({ signUpCalls, profileLookupCalls }),
  };
}

async function register(api) {
  await api.init({
    enabled: true,
    supabaseUrl: "https://example.supabase.co",
    supabaseAnonKey: "test-anon-key",
  });
  return api.register({
    email: "new@example.com",
    password: "password123",
    username: "new.user",
    displayName: "New User",
  });
}

async function run() {
  const missingRpc = {
    code: "PGRST202",
    message: "Could not find the function public.is_username_available(candidate_username) in the schema cache",
  };

  const legacyAvailable = makeCloud({ rpcError: missingRpc });
  const result = await register(legacyAvailable.api);
  assert.equal(result.needsConfirm, true);
  assert.deepEqual(legacyAvailable.calls(), { signUpCalls: 1, profileLookupCalls: 1 });

  const legacyTaken = makeCloud({ rpcError: missingRpc, existingProfile: { id: "existing" } });
  await assert.rejects(() => register(legacyTaken.api), /kullanıcı adı alınmış/i);
  assert.deepEqual(legacyTaken.calls(), { signUpCalls: 0, profileLookupCalls: 1 });

  const messageOnly = makeCloud({ rpcError: { message: missingRpc.message } });
  await register(messageOnly.api);
  assert.deepEqual(messageOnly.calls(), { signUpCalls: 1, profileLookupCalls: 1 });

  const rpcAvailable = makeCloud({ rpcData: true });
  await register(rpcAvailable.api);
  assert.deepEqual(rpcAvailable.calls(), { signUpCalls: 1, profileLookupCalls: 0 });

  const realFailure = makeCloud({ rpcError: { code: "42501", message: "permission denied" } });
  await assert.rejects(() => register(realFailure.api), /permission denied/i);
  assert.deepEqual(realFailure.calls(), { signUpCalls: 0, profileLookupCalls: 0 });

  console.log("Cloud registration fallback tests OK");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

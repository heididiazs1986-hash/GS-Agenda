/* GS Agenda — desbloqueo con huella en la versión web/PWA (Windows Hello, huella del celular).
   Preferido: la extensión PRF de WebAuthn, que entrega un secreto solo tras la huella y con él se cifra la clave.
   Alternativa: si el navegador no la ofrece, la huella actúa como puerta y la clave se guarda cifrada con una llave del navegador. */
const Huella = (() => {
  const K = 'gs.wa', KEY = 'wakey';
  const rnd = n => crypto.getRandomValues(new Uint8Array(n));
  const toB = u => b64(u), fromB = s => unb64(s);
  const aes = (raw, usage) => crypto.subtle.importKey('raw', raw, 'AES-GCM', false, usage);
  const sha = async u => new Uint8Array(await crypto.subtle.digest('SHA-256', u));
  async function seal(key, text) { const iv = rnd(12); const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text)); return { iv: toB(iv), ct: toB(ct) }; }
  async function open(key, o) { return dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB(o.iv) }, key, fromB(o.ct))); }
  const api = {
    async available() { try { return !IS_ANDROID && window.isSecureContext && !!window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); } catch { return false; } },
    enabled: () => !IS_ANDROID && !!LS.get(K),
    async enable(code) {
      const salt = rnd(32);
      const cred = await navigator.credentials.create({ publicKey: {
        rp: { name: 'GS Agenda', id: location.hostname }, user: { id: rnd(16), name: 'gs-agenda', displayName: 'GS Agenda' },
        challenge: rnd(32), pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
        timeout: 60000, extensions: { prf: {} },
      } });
      if (!cred) throw new Error('cancelado');
      const id = new Uint8Array(cred.rawId);
      let secret = null;
      if ((cred.getClientExtensionResults().prf || {}).enabled !== false) {
        try {
          const a = await navigator.credentials.get({ publicKey: { challenge: rnd(32), rpId: location.hostname, allowCredentials: [{ type: 'public-key', id }], userVerification: 'required', timeout: 60000, extensions: { prf: { eval: { first: salt } } } } });
          const r = (a.getClientExtensionResults().prf || {}).results; if (r && r.first) secret = new Uint8Array(r.first);
        } catch (e) { if (e && e.name === 'NotAllowedError') throw e; }
      }
      if (secret) {
        const s = await seal(await aes(await sha(secret), ['encrypt']), code);
        LS.set(K, { mode: 'prf', id: toB(id), salt: toB(salt), ...s });
      } else {
        const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
        await IDB.set(KEY, key);
        const s = await seal(key, code);
        LS.set(K, { mode: 'gate', id: toB(id), ...s });
      }
      return LS.get(K).mode;
    },
    async unlock() {
      const o = LS.get(K); if (!o) throw new Error('sin huella');
      const opts = { challenge: rnd(32), rpId: location.hostname, allowCredentials: [{ type: 'public-key', id: fromB(o.id) }], userVerification: 'required', timeout: 60000 };
      if (o.mode === 'prf') opts.extensions = { prf: { eval: { first: fromB(o.salt) } } };
      const a = await navigator.credentials.get({ publicKey: opts });
      if (!a) throw new Error('cancelado');
      if (o.mode === 'prf') {
        const r = (a.getClientExtensionResults().prf || {}).results; if (!r || !r.first) throw new Error('sin secreto');
        return open(await aes(await sha(new Uint8Array(r.first)), ['decrypt']), o);
      }
      const key = await IDB.get(KEY); if (!key) throw new Error('sin llave');
      return open(key, o);
    },
    async disable() { LS.del(K); await IDB.del(KEY); },
  };
  return api;
})();

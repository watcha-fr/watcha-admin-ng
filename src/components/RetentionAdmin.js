import React, { useEffect, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

// Durées proposées (en millisecondes). null = illimité (pas de durée par défaut).
const PRESETS = [
  { id: "unlimited", label: "Illimité", ms: null },
  { id: "1_week", label: "1 semaine", ms: 7 * DAY_MS },
  { id: "1_month", label: "1 mois", ms: 30 * DAY_MS },
  { id: "6_months", label: "6 mois", ms: 180 * DAY_MS },
  { id: "1_year", label: "1 an", ms: 365 * DAY_MS },
  { id: "custom", label: "Personnalisé (en jours)", ms: undefined },
];

// Détermine le préréglage correspondant à une durée en ms.
function presetForMs(ms) {
  if (ms === null || ms === undefined) return "unlimited";
  const match = PRESETS.find(p => p.ms === ms);
  return match ? match.id : "custom";
}

export default function RetentionAdmin() {
  const [preset, setPreset] = useState("unlimited");
  const [customDays, setCustomDays] = useState("");
  const [allowOverride, setAllowOverride] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const homeserver = localStorage.getItem("base_url");
  const token = localStorage.getItem("access_token");
  const endpoint = homeserver + "/_synapse/admin/v1/watcha_retention_config";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      try {
        const resp = await fetch(endpoint, { headers });
        if (!resp.ok)
          throw new Error("Erreur lors du chargement de la configuration");
        const data = await resp.json();

        const ms = data.default_max_lifetime;
        const detected = presetForMs(ms);
        setPreset(detected);
        if (detected === "custom" && typeof ms === "number") {
          setCustomDays(String(Math.round(ms / DAY_MS)));
        }
        setAllowOverride(data.allow_room_override !== false);
      } catch (err) {
        console.error(err);
        setMessage({
          type: "error",
          text: "Impossible de charger la configuration.",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  // Calcule la durée en ms à envoyer, ou false si la saisie personnalisée est invalide.
  const computeMs = () => {
    if (preset === "unlimited") return null;
    if (preset === "custom") {
      const days = parseInt(customDays, 10);
      if (!Number.isInteger(days) || days <= 0) return false;
      return days * DAY_MS;
    }
    const found = PRESETS.find(p => p.id === preset);
    return found ? found.ms : null;
  };

  const saveConfig = async () => {
    const ms = computeMs();
    if (ms === false) {
      setMessage({
        type: "error",
        text: "Veuillez saisir un nombre de jours valide (entier positif).",
      });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          default_max_lifetime: ms,
          allow_room_override: allowOverride,
        }),
      });
      if (!resp.ok) throw new Error("Erreur lors de la sauvegarde");
      setMessage({ type: "success", text: "Configuration enregistrée." });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Erreur lors de la sauvegarde." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Chargement...</div>;

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "640px",
      }}
    >
      <h2>Profondeur des messages</h2>
      <p style={{ color: "#555" }}>
        Définissez la durée de conservation par défaut des messages pour les
        salons du serveur. Au-delà de cette durée, les messages sont purgés (les
        messages épinglés sont toujours conservés).
      </p>

      <div style={{ marginTop: "20px" }}>
        <label
          style={{ display: "block", fontWeight: 600, marginBottom: "6px" }}
        >
          Durée de rétention par défaut
        </label>
        <select
          value={preset}
          onChange={e => setPreset(e.target.value)}
          style={{ padding: "6px", minWidth: "240px" }}
        >
          {PRESETS.map(p => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        {preset === "custom" && (
          <div style={{ marginTop: "10px" }}>
            <input
              type="number"
              min="1"
              value={customDays}
              onChange={e => setCustomDays(e.target.value)}
              placeholder="Nombre de jours"
              style={{ padding: "6px", width: "160px" }}
            />
            <span style={{ marginLeft: "8px", color: "#555" }}>jours</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: "24px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            type="checkbox"
            checked={allowOverride}
            onChange={e => setAllowOverride(e.target.checked)}
          />
          <span>
            Autoriser les administrateurs des salons à paramétrer la durée de
            l'historique des messages
          </span>
        </label>
        <p
          style={{
            color: "#777",
            fontSize: "0.85rem",
            marginTop: "4px",
            marginLeft: "26px",
          }}
        >
          Si activé, un menu « Rétention des messages » apparaît dans les
          paramètres de chaque salon et surpasse la durée par défaut. Si
          désactivé, ce menu est masqué.
        </p>
      </div>

      <div style={{ marginTop: "24px" }}>
        <button onClick={saveConfig} disabled={saving}>
          {saving ? "Sauvegarde..." : "Enregistrer"}
        </button>
        {message && (
          <span
            style={{
              marginLeft: "12px",
              color: message.type === "error" ? "#b71c1c" : "#2e7d32",
            }}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";

export default function FileTypeFilterAdmin() {
  const [mimes, setMimes] = useState([]);
  const [newMime, setNewMime] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Base URL du homeserver
  const homeserver = localStorage.getItem("base_url");
  const endpoint = homeserver + "/_synapse/admin/v1/watcha_file_type_filter";

  // Charger la liste depuis le serveur
  useEffect(() => {
    async function fetchMimes() {
      setLoading(true);
      try {
        const resp = await fetch(endpoint);
        if (!resp.ok) throw new Error("Erreur lors du chargement des MIME");
        const data = await resp.json();
        setMimes(data.blocked_mimes.map(m => ({ mime: m, blocked: true })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMimes();
  }, [endpoint]);

  // Toggle Bloqué/Autorisé
  const toggleBlocked = index => {
    setMimes(prev => {
      const copy = [...prev];
      copy[index].blocked = !copy[index].blocked;
      return copy;
    });
  };

  // Ajouter un nouveau MIME
  const addMime = () => {
    if (!newMime.trim()) return;
    setMimes(prev => [...prev, { mime: newMime.trim(), blocked: true }]);
    setNewMime("");
  };

  // Sauvegarder la liste
  const saveMimes = async () => {
    setSaving(true);
    try {
      const blockedList = mimes.filter(m => m.blocked).map(m => m.mime);
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked_mimes: blockedList }),
      });
      if (!resp.ok) throw new Error("Erreur lors de la sauvegarde");
      alert("Liste sauvegardée !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Gestion des MIME bloqués</h2>

      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>MIME Type</th>
              <th>Bloqué</th>
            </tr>
          </thead>
          <tbody>
            {mimes.map((m, i) => (
              <tr key={i}>
                <td>{m.mime}</td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={m.blocked}
                    onChange={() => toggleBlocked(i)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "15px" }}>
        <input
          type="text"
          value={newMime}
          onChange={e => setNewMime(e.target.value)}
          placeholder="Ajouter un MIME type"
        />
        <button onClick={addMime} style={{ marginLeft: "5px" }}>Ajouter</button>
      </div>

      <div style={{ marginTop: "15px" }}>
        <button onClick={saveMimes} disabled={saving}>
          {saving ? "Sauvegarde..." : "Sauvegarder la liste"}
        </button>
      </div>
    </div>
  );
}

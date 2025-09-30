import React, { useEffect, useState } from "react";

export default function FileTypeFilterAdmin() {
  const [extensions, setExtensions] = useState([]);
  const [newExt, setNewExt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Base URL et token du homeserver
  const homeserver = localStorage.getItem("base_url");
  const token = localStorage.getItem("access_token");
  const endpoint = homeserver + "/_synapse/admin/v1/watcha_file_type_filter";

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  // Charger la liste depuis le serveur
  useEffect(() => {
    async function fetchExtensions() {
      setLoading(true);
      try {
        const resp = await fetch(endpoint, { headers });
        if (!resp.ok) throw new Error("Erreur lors du chargement des extensions");
        const data = await resp.json();
        setExtensions(data.blocked_extensions.map(e => ({ ext: e, blocked: true })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchExtensions();
  }, [endpoint]);

  // Toggle Bloqué/Autorisé
  const toggleBlocked = index => {
    setExtensions(prev => {
      const copy = [...prev];
      copy[index].blocked = !copy[index].blocked;
      return copy;
    });
  };

  // Ajouter une nouvelle extension
  const addExtension = () => {
    if (!newExt.trim()) return;
    setExtensions(prev => [...prev, { ext: newExt.trim(), blocked: true }]);
    setNewExt("");
  };

  // Sauvegarder la liste
  const saveExtensions = async () => {
    setSaving(true);
    try {
      const blockedList = extensions.filter(e => e.blocked).map(e => e.ext);
      const resp = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({ blocked_extensions: blockedList }),
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
      <h2>Gestion des extensions de fichiers bloquées</h2>

      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ccc", padding: "10px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left" }}>Extension</th>
              <th>Bloqué</th>
            </tr>
          </thead>
          <tbody>
            {extensions.map((e, i) => (
              <tr key={i}>
                <td>{e.ext}</td>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={e.blocked}
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
          value={newExt}
          onChange={e => setNewExt(e.target.value)}
          placeholder="Ajouter une extension"
        />
        <button onClick={addExtension} style={{ marginLeft: "5px" }}>Ajouter</button>
      </div>

      <div style={{ marginTop: "15px" }}>
        <button onClick={saveExtensions} disabled={saving}>
          {saving ? "Sauvegarde..." : "Sauvegarder la liste"}
        </button>
      </div>
    </div>
  );
}

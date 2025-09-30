import React, { useEffect, useState } from "react";

export default function FileTypeFilterAdmin() {
  const [blockedExtensions, setBlockedExtensions] = useState([]);
  const [newExt, setNewExt] = useState("");
  const homeserver = localStorage.getItem("base_url");
  const accessToken = localStorage.getItem("access_token");

  const fetchBlockedExtensions = async () => {
    try {
      const res = await fetch(`${homeserver}/_synapse/admin/v1/watcha_file_type_filter`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setBlockedExtensions(data.blocked_extensions || []);
    } catch (err) {
      console.error("Erreur lors du fetch des extensions bloquées", err);
    }
  };

  const saveBlockedExtensions = async (extensions) => {
    try {
      const res = await fetch(`${homeserver}/_synapse/admin/v1/watcha_file_type_filter`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ blocked_extensions: extensions }),
      });
      const data = await res.json();
      setBlockedExtensions(data.blocked_extensions || []);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde des extensions", err);
    }
  };

  useEffect(() => {
    fetchBlockedExtensions();
  }, []);

  const toggleExtension = (ext) => {
    let updated;
    if (blockedExtensions.includes(ext)) {
      updated = blockedExtensions.filter((e) => e !== ext);
    } else {
      updated = [...blockedExtensions, ext];
    }
    saveBlockedExtensions(updated);
  };

  const handleAdd = () => {
    if (newExt && !blockedExtensions.includes(newExt)) {
      saveBlockedExtensions([...blockedExtensions, newExt]);
      setNewExt("");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Extensions bloquées</h2>
      <ul style={{ maxHeight: "300px", overflowY: "auto" }}>
        {blockedExtensions.map((ext) => (
          <li key={ext}>
            <label>
              <input
                type="checkbox"
                checked={true}
                onChange={() => toggleExtension(ext)}
              />
              {ext}
            </label>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: "1rem" }}>
        <input
          type="text"
          value={newExt}
          onChange={(e) => setNewExt(e.target.value)}
          placeholder="Nouvelle extension"
        />
        <button onClick={handleAdd}>Ajouter</button>
      </div>
    </div>
  );
}

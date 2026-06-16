import React from "react";

// Message affiché lorsqu'un endpoint d'administration Watcha répond en erreur
// (typiquement parce que le module correspondant n'est pas installé sur le
// serveur Synapse). Évite d'afficher un toast d'erreur peu parlant.
export default function ModuleNotInstalled({ title }) {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {title && <h2>{title}</h2>}
      <p style={{ color: "#777" }}>
        Ce module n'est pas installé sur le serveur.
      </p>
    </div>
  );
}

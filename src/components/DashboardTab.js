import React, { useEffect, useState } from "react";

const DashboardTab = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        // Exemple de fetch des données
        fetch('/watcha_admin_stats')
            .then(response => response.json())
            .then(data => setData(data))
            .catch(err => console.error("Failed to load dashboard data", err));
    }, []);

    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default DashboardTab;

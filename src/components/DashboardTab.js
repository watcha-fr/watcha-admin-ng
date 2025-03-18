import React, { useState } from "react";
import { Card, CardContent, Typography, MenuItem, Select } from "@material-ui/core";

const DashboardTab = () => {
    const homeserver = localStorage.getItem("base_url");
    const grafana = homeserver.replace("-core", "-dashboard");
    const grafanaUrl = `${grafana}/d-solo/000000012/synapse?orgId=1&panelId=`;
    const grafanaMemoryPanelId = "198";
    const grafanaCPUPanelId = "75";

    // State pour la plage de temps sélectionnée
    const [timeRange, setTimeRange] = useState('now-1h');

    const handleTimeChange = (event) => {
        setTimeRange(event.target.value);
    };

    const getIframeUrl = (panelId) => {
        return `${grafanaUrl}${panelId}&from=${timeRange}&to=now`;
    };

    return (
        <div style={{ padding: '20px' }}>
            <Typography variant="h5" gutterBottom>
                Dashboard Grafana
            </Typography>

            {/* Menu déroulant pour la plage de temps */}
            <Select
                value={timeRange}
                onChange={handleTimeChange}
                style={{ marginBottom: '20px', width: '200px' }}
            >
                <MenuItem value="now-1h">Dernière heure</MenuItem>
                <MenuItem value="now-6h">Dernières 6 heures</MenuItem>
                <MenuItem value="now-24h">Dernières 24 heures</MenuItem>
                <MenuItem value="now-7d">Dernière semaine</MenuItem>
                <MenuItem value="now-30d">Dernier mois</MenuItem>
            </Select>

            <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
                {/* Panel CPU */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Panel CPU Usage</Typography>
                        <iframe
                            src={getIframeUrl(grafanaCPUPanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>

                {/* Panel Memory */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Panel Memory Usage</Typography>
                        <iframe
                            src={getIframeUrl(grafanaMemoryPanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardTab;

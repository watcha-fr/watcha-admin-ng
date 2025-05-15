import React, { useState } from "react";
import { Card, CardContent, Typography, MenuItem, Select } from "@material-ui/core";

const DashboardTab = () => {
    const homeserver = localStorage.getItem("base_url");
    const grafana = homeserver.replace("-core", "-dashboard");
    const grafanaUrl = `${grafana}/d-solo/299792458/metriques-personnalisees-synapse?orgId=1&panelId=`;
    const grafanaUsersPanelId = "101";
    const grafanaDAUPanelId = "102";
    const grafanaRoomsPanelId = "103";
    const grafanaSpacesPanelId = "104";
    const grafanaCPUPanelId = "105";
    const grafanaMemoryPanelId = "106";
    const grefanaUsgaePanelId = "107";
    const grafanaDocumentsPanelId = "108";
    const grafanaJitsiPanelId = "109";
    const grafanaNotificationMobilPanelId = "110";
    const grafanaNetUsagePanelId = "117";  
    const grafanaPartageTypePanelId = "114";
    const grafanaPartageFederePanelId = "115";

    // State pour la plage de temps sélectionnée
    const [timeRange, setTimeRange] = useState('now-1h');

    const handleTimeChange = (event) => {
        setTimeRange(event.target.value);
    };

const getIframeUrl = (panelId) => {
    const serverMap = {
        "https://discuter-mdl-core.territoirenumeriqueouvert.org": "dicuter-mdl",
        "https://discuter-core.territoirenumeriqueouvert.org": "dicuter-sitiv",
        "https://discuter-vdl-core.territoirenumeriqueouvert.org": "dicuter-vdl",
    };

    const instance = serverMap[homeserver];
    const instanceParam = instance ? `&var-instance=${instance}` : "";

    return `${grafanaUrl}${panelId}&from=${timeRange}&to=now${instanceParam}`;
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
                        <Typography variant="h6">Utilisation du CPU</Typography>
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
                        <Typography variant="h6">Mémoire</Typography>
                        <iframe
                            src={getIframeUrl(grafanaMemoryPanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>

                {/* Panel NetUsage */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Bande Passante</Typography>
                        <iframe
                            src={getIframeUrl(grafanaNetUsagePanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>

                {/* Panel Users */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Utilisateurs Totaux</Typography>
                        <iframe
                            src={getIframeUrl(grafanaUsersPanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>

                {/* Panel DAU */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Utilisateurs Actifs Quotidients</Typography>
                        <iframe
                            src={getIframeUrl(grafanaDAUPanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>

                {/* Panel Rooms */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Vue d'ensemble des Salons</Typography>
                        <iframe
                            src={getIframeUrl(grafanaRoomsPanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>

                {/* Panel Spaces */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Vue d'ensemble des Espaces</Typography>
                        <iframe
                            src={getIframeUrl(grafanaSpacesPanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>

                {/* Panel Documents */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Documents partagés</Typography>
                        <iframe
                            src={getIframeUrl(grafanaDocumentsPanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>

                {/* Panel Partage Type */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Type de Partage</Typography>
                        <iframe
                            src={getIframeUrl(grafanaPartageTypePanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen 
                        />
                    </CardContent>
                </Card>

                {/* Panel Partage Fédéré */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Partage Fédéré</Typography>
                        <iframe 
                            src={getIframeUrl(grafanaPartageFederePanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>

                {/* Panel Jitsi */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Appels Jitsi</Typography>
                        <iframe
                            src={getIframeUrl(grafanaJitsiPanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>

                {/* Panel Notification Mobile */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Notifications Mobiles</Typography>
                        <iframe
                            src={getIframeUrl(grafanaNotificationMobilPanelId)}
                            width="100%"
                            height="300"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </CardContent>
                </Card>

                {/* Panel Usage */}
                <Card>
                    <CardContent>
                        <Typography variant="h6">Utilisation de Watcha</Typography>
                        <iframe
                            src={getIframeUrl(grefanaUsgaePanelId)}
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

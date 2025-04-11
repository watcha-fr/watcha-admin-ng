import React from "react";

const DashboardAllTab = () => {
    const homeserver = localStorage.getItem("base_url");
    const grafana = homeserver.replace("-core","-dashboard")
    const grafanaUrl = grafana+"/d/299792458/synapse-custom-metrics?orgId=1&refresh=10s&from=now-2d&to=now&kiosk";

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <iframe
                src={grafanaUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
            />
        </div>
    );
};

export default DashboardAllTab;
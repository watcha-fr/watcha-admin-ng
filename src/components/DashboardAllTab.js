import React from "react";

const DashboardAllTab = () => {
    const homeserver = localStorage.getItem("base_url");
    const grafana = homeserver.replace("-core","-dashboard")
    const grafanaUrl = grafana+"/d/000000012/synapse?orgId=1";

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
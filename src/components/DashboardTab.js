import React from "react";

const DashboardTab = () => {
    const homeserver = localStorage.getItem("base_url");
    const grafana = homeserver.replace("-core","-dashboard")
    const grafanaUrl = grafana+"/d-solo/000000012/synapse?orgId=1&panelId=";
    const grafanaMemoryPanelId = "198";
    const grafanaCPUPanelId = "75";

    return (
        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
        {/* Panel 1 */}
        <Card>
          <CardContent>
            <Typography variant="h6">Panel 1 - CPU Usage</Typography>
            <iframe
              src={grafanaUrl+grafanaCPUPanelId}
              width="100%"
              height="300"
              frameBorder="0"
            />
          </CardContent>
        </Card>
    
        {/* Panel 2 */}
        <Card>
          <CardContent>
            <Typography variant="h6">Panel 2 - Memory Usage</Typography>
            <iframe
              src={grafanaUrl+grafanaMemoryPanelId}
              width="100%"
              height="300"
              frameBorder="0"
            />
          </CardContent>
        </Card>
      </div>
    );
};


export default DashboardTab;

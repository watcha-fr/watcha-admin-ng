import React, { useEffect, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";
import {
  Datagrid,
  DateField,
  Filter,
  FunctionField,
  List,
  Pagination,
  SearchInput,
  SelectInput,
  TextField,
} from "react-admin";
import ModuleNotInstalled from "./ModuleNotInstalled";

const useStyles = makeStyles({
  small: {
    height: "40px",
    width: "40px",
  },
});

const ACTION_COLORS = {
  CREATE: { background: "#e8f5e9", color: "#2e7d32" },
  DEACTIVATE: { background: "#fff3e0", color: "#e65100" },
  REACTIVATE: { background: "#e3f2fd", color: "#1565c0" },
  DELETE: { background: "#fce4ec", color: "#b71c1c" },
};

const ACTION_LABELS = {
  CREATE: "Créé",
  DEACTIVATE: "Désactivé",
  REACTIVATE: "Réactivé",
  DELETE: "Supprimé",
};

export function accountHistoryGetList({
  data = [],
  filter = {},
  pagination = {},
  sort = {},
}) {
  let rows = [...data];

  if (filter.name) {
    const q = filter.name.toLowerCase();
    rows = rows.filter(
      r =>
        (r.user_id || "").toLowerCase().includes(q) ||
        (r.display_name || "").toLowerCase().includes(q)
    );
  }

  if (filter.action) {
    rows = rows.filter(r => r.action === filter.action);
  }

  const field = sort.field || "timestamp";
  const dir = sort.order === "ASC" ? 1 : -1;
  rows.sort((a, b) => {
    if (a[field] < b[field]) return -1 * dir;
    if (a[field] > b[field]) return 1 * dir;
    return 0;
  });

  const { page = 1, perPage = 25 } = pagination;
  const start = (page - 1) * perPage;
  return { data: rows.slice(start, start + perPage), total: rows.length };
}

const AvatarField = ({ source, className, record = {} }) => (
  <Avatar src={record[source]} className={className} />
);

const date_format = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const HistoryPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

const HistoryFilter = props => (
  <Filter {...props}>
    <SearchInput source="name" alwaysOn />
    <SelectInput
      source="action"
      alwaysOn
      allowEmpty
      emptyText="Tous les états"
      label="État"
      choices={[
        { id: "CREATE", name: "Créé" },
        { id: "DEACTIVATE", name: "Désactivé" },
        { id: "REACTIVATE", name: "Réactivé" },
        { id: "DELETE", name: "Supprimé" },
      ]}
    />
  </Filter>
);

export const AccountHistoryList = props => {
  const classes = useStyles();

  return (
    <List
      {...props}
      filters={<HistoryFilter />}
      sort={{ field: "timestamp", order: "DESC" }}
      pagination={<HistoryPagination />}
      bulkActionButtons={false}
      title="Historique des comptes"
    >
      <Datagrid>
        <AvatarField
          source="avatar_src"
          sortable={false}
          className={classes.small}
          label="Avatar"
        />

        <TextField source="user_id" sortable={false} label="Identifiant" />

        <TextField
          source="display_name"
          sortable={false}
          label="Nom d'affichage"
        />

        <FunctionField
          source="action"
          sortable={false}
          label="État"
          render={record => {
            const style = ACTION_COLORS[record.action] || {
              background: "#f5f5f5",
              color: "#616161",
            };
            return (
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  whiteSpace: "nowrap",
                  background: style.background,
                  color: style.color,
                }}
              >
                {ACTION_LABELS[record.action] || record.action}
              </span>
            );
          }}
        />

        <DateField
          source="timestamp"
          showTime
          options={date_format}
          sortable={true}
          label="Date et heure"
        />
      </Datagrid>
    </List>
  );
};

// Avant d'afficher la liste (qui passe par le dataProvider react-admin et
// déclencherait un toast d'erreur en cas d'échec), on sonde l'endpoint. S'il
// répond en erreur (module absent du serveur), on affiche un message dédié.
const AccountHistory = props => {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const homeserver = localStorage.getItem("base_url");
    const token = localStorage.getItem("access_token");

    if (!homeserver) {
      setStatus("not-installed");
      return;
    }

    let cancelled = false;
    fetch(`${homeserver}/_synapse/admin/v1/watcha_user_audit_log`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(resp => {
        if (cancelled) return;
        setStatus(resp.ok ? "ok" : "not-installed");
      })
      .catch(() => {
        if (!cancelled) setStatus("not-installed");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading")
    return <div style={{ padding: "20px" }}>Chargement...</div>;

  if (status === "not-installed")
    return <ModuleNotInstalled title="Historique des comptes" />;

  return <AccountHistoryList {...props} />;
};

export default AccountHistory;

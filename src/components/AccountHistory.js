import React from "react";
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
  CREATE: "Création",
  DEACTIVATE: "Désactivation",
  REACTIVATE: "Réactivation",
  DELETE: "Suppression",
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
      emptyText="Toutes les actions"
      label="Action"
      choices={[
        { id: "CREATE", name: "Création" },
        { id: "DEACTIVATE", name: "Désactivation" },
        { id: "REACTIVATE", name: "Réactivation" },
        { id: "DELETE", name: "Suppression" },
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
          label="Action"
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

export default AccountHistoryList;

import React, {
  cloneElement,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import { connect } from "react-redux";
import {
  BooleanField,
  BulkDeleteButton,
  DateField,
  Datagrid,
  DeleteButton,
  ExportButton,
  Filter,
  List,
  NumberField,
  Pagination,
  ReferenceField,
  ReferenceManyField,
  SearchInput,
  SelectField,
  Show,
  Tab,
  TabbedShowLayout,
  TextField,
  TopToolbar,
  downloadCSV,
  sanitizeListRestProps,
  useDataProvider,
  useRecordContext,
  useTranslate,
} from "react-admin";
import jsonExport from "jsonexport/dist";
import get from "lodash/get";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Tooltip, Typography, Chip } from "@material-ui/core";
import FastForwardIcon from "@material-ui/icons/FastForward";
import HttpsIcon from "@material-ui/icons/Https";
import NoEncryptionIcon from "@material-ui/icons/NoEncryption";
import PageviewIcon from "@material-ui/icons/Pageview";
import UserIcon from "@material-ui/icons/Group";
import ViewListIcon from "@material-ui/icons/ViewList";
import VisibilityIcon from "@material-ui/icons/Visibility";
import EventIcon from "@material-ui/icons/Event";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import {
  RoomDirectoryJoinButton,
  RoomDirectoryBulkDeleteButton,
  RoomDirectoryBulkSaveButton,
  RoomDirectoryDeleteButton,
  RoomDirectorySaveButton,
} from "./RoomDirectory";

const date_format = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

const useStyles = makeStyles(theme => ({
  helper_forward_extremities: {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
    margin: "0.5em",
  },
}));

const RoomPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[10, 25, 50, 100, 500, 1000]} />
);

const EncryptionField = ({ source, record = {}, emptyText }) => {
  const translate = useTranslate();
  const value = get(record, source);
  let ariaLabel = value === false ? "ra.boolean.false" : "ra.boolean.true";

  if (value === false || value === true) {
    return (
      <Typography component="span" variant="body2">
        <Tooltip title={translate(ariaLabel, { _: ariaLabel })}>
          {value === true ? (
            <HttpsIcon data-testid="true" htmlColor="limegreen" />
          ) : (
            <NoEncryptionIcon data-testid="false" color="error" />
          )}
        </Tooltip>
      </Typography>
    );
  }

  return (
    <Typography component="span" variant="body2">
      {emptyText}
    </Typography>
  );
};

// Provides the room's `m.room.power_levels` content to the members datagrid so
// that each member row can tell whether the user is a room administrator.
const RoomPowerLevelsContext = React.createContext(null);

const RoomMembers = props => {
  const record = useRecordContext(props);
  const roomId = record && record.id;
  const dataProvider = useDataProvider();
  const [powerLevels, setPowerLevels] = useState(null);

  useEffect(() => {
    if (!roomId) return;
    let active = true;
    dataProvider
      .getManyReference("room_state", {
        target: "room_id",
        id: roomId,
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "type", order: "ASC" },
        filter: {},
      })
      .then(({ data }) => {
        if (!active) return;
        const event = data.find(e => e.type === "m.room.power_levels");
        setPowerLevels(event ? event.content : null);
      })
      .catch(() => {
        if (active) setPowerLevels(null);
      });
    return () => {
      active = false;
    };
  }, [roomId, dataProvider]);

  return (
    <RoomPowerLevelsContext.Provider value={powerLevels}>
      <ReferenceManyField
        reference="room_members"
        target="room_id"
        addLabel={false}
      >
        <Datagrid
          style={{ width: "100%" }}
          rowClick={(id, basePath, record) => "/users/" + id}
        >
          <TextField
            source="id"
            sortable={false}
            label="resources.users.fields.id"
          />
          <ReferenceField
            label="resources.users.fields.displayname"
            source="id"
            reference="users"
            sortable={false}
            link=""
          >
            <TextField source="displayname" sortable={false} />
          </ReferenceField>
          <RoomAdminField
            label="resources.rooms.fields.is_room_admin"
            sortable={false}
          />
        </Datagrid>
      </ReferenceManyField>
    </RoomPowerLevelsContext.Provider>
  );
};

// A member is considered a room administrator when their power level reaches
// 100 (the default power level required to administer a Matrix room).
const RoomAdminField = ({ record = {} }) => {
  const translate = useTranslate();
  const powerLevels = useContext(RoomPowerLevelsContext);

  if (!powerLevels) {
    return null;
  }

  const users = powerLevels.users || {};
  const defaultLevel =
    powerLevels.users_default !== undefined ? powerLevels.users_default : 0;
  const level = users[record.id] !== undefined ? users[record.id] : defaultLevel;
  const isAdmin = level >= 100;
  const ariaLabel = isAdmin ? "ra.boolean.true" : "ra.boolean.false";

  return (
    <Typography component="span" variant="body2">
      <Tooltip title={translate(ariaLabel, { _: ariaLabel })}>
        {isAdmin ? (
          <CheckIcon data-testid="true" htmlColor="limegreen" />
        ) : (
          <ClearIcon data-testid="false" color="error" />
        )}
      </Tooltip>
    </Typography>
  );
};

const RoomTitle = ({ record }) => {
  const translate = useTranslate();
  var name = "";
  if (record) {
    name = record.name !== "" ? record.name : record.id;
  }

  return (
    <span>
      {translate("resources.rooms.name", 1)} {name}
    </span>
  );
};

const RoomShowActions = ({ basePath, data, resource }) => {
  var roomDirectoryStatus = "";
  if (data) {
    roomDirectoryStatus = data.public;
  }

  return (
    <TopToolbar>
      <RoomDirectoryJoinButton record={data}/>
      {roomDirectoryStatus === false && (
        <RoomDirectorySaveButton record={data} />
      )}
      {roomDirectoryStatus === true && (
        <RoomDirectoryDeleteButton record={data} />
      )}
      <DeleteButton
        basePath={basePath}
        record={data}
        resource={resource}
        mutationMode="pessimistic"
        confirmTitle="resources.rooms.action.erase.title"
        confirmContent="resources.rooms.action.erase.content"
      />
    </TopToolbar>
  );
};

export const RoomShow = props => {
  const classes = useStyles({ props });
  const translate = useTranslate();
  return (
    <Show {...props} actions={<RoomShowActions />} title={<RoomTitle />}>
      <TabbedShowLayout>
        <Tab label="synapseadmin.rooms.tabs.basic" icon={<ViewListIcon />}>
          <TextField source="room_id" />
          <TextField source="name" />
          <TextField source="canonical_alias" />
          <ReferenceField source="creator" reference="users">
            <TextField source="id" />
          </ReferenceField>
        </Tab>

        <Tab
          label="synapseadmin.rooms.tabs.detail"
          icon={<PageviewIcon />}
          path="detail"
        >
          <TextField source="joined_members" />
          <TextField source="joined_local_members" />
          <TextField source="joined_local_devices" />
          <TextField source="state_events" />
          <TextField source="version" />
          <TextField
            source="encryption"
            emptyText={translate("resources.rooms.enums.unencrypted")}
          />
        </Tab>

        <Tab
          label="synapseadmin.rooms.tabs.members"
          icon={<UserIcon />}
          path="members"
        >
          <RoomMembers />
        </Tab>

        <Tab
          label="synapseadmin.rooms.tabs.permission"
          icon={<VisibilityIcon />}
          path="permission"
        >
          <BooleanField source="federatable" />
          <BooleanField source="public" />
          <SelectField
            source="join_rules"
            choices={[
              { id: "public", name: "resources.rooms.enums.join_rules.public" },
              { id: "knock", name: "resources.rooms.enums.join_rules.knock" },
              { id: "invite", name: "resources.rooms.enums.join_rules.invite" },
              {
                id: "private",
                name: "resources.rooms.enums.join_rules.private",
              },
            ]}
          />
          <SelectField
            source="guest_access"
            choices={[
              {
                id: "can_join",
                name: "resources.rooms.enums.guest_access.can_join",
              },
              {
                id: "forbidden",
                name: "resources.rooms.enums.guest_access.forbidden",
              },
            ]}
          />
          <SelectField
            source="history_visibility"
            choices={[
              {
                id: "invited",
                name: "resources.rooms.enums.history_visibility.invited",
              },
              {
                id: "joined",
                name: "resources.rooms.enums.history_visibility.joined",
              },
              {
                id: "shared",
                name: "resources.rooms.enums.history_visibility.shared",
              },
              {
                id: "world_readable",
                name: "resources.rooms.enums.history_visibility.world_readable",
              },
            ]}
          />
        </Tab>

        <Tab
          label={translate("resources.room_state.name", { smart_count: 2 })}
          icon={<EventIcon />}
          path="state"
        >
          <ReferenceManyField
            reference="room_state"
            target="room_id"
            addLabel={false}
          >
            <Datagrid style={{ width: "100%" }}>
              <TextField source="type" sortable={false} />
              <DateField
                source="origin_server_ts"
                showTime
                options={date_format}
                sortable={false}
              />
              <TextField source="content" sortable={false} />
              <ReferenceField
                source="sender"
                reference="users"
                sortable={false}
              >
                <TextField source="id" />
              </ReferenceField>
            </Datagrid>
          </ReferenceManyField>
        </Tab>

        <Tab
          label="resources.forward_extremities.name"
          icon={<FastForwardIcon />}
          path="forward_extremities"
        >
          <div className={classes.helper_forward_extremities}>
            {translate("resources.rooms.helper.forward_extremities")}
          </div>
          <ReferenceManyField
            reference="forward_extremities"
            target="room_id"
            addLabel={false}
          >
            <Datagrid style={{ width: "100%" }}>
              <TextField source="id" sortable={false} />
              <DateField
                source="received_ts"
                showTime
                options={date_format}
                sortable={false}
              />
              <NumberField source="depth" sortable={false} />
              <TextField source="state_group" sortable={false} />
            </Datagrid>
          </ReferenceManyField>
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

// Exporteur custom des salons. Le bouton d'export de react-admin est limité
// par défaut à 1000 enregistrements ; on le remplace donc par un ExportButton
// dont le `maxResults` est relevé (voir RoomListActions) afin d'exporter la
// totalité des salons. On en profite pour retirer les champs dérivés / dupliqués
// du dataProvider (alias, members) et pour figer l'ordre des colonnes du CSV.
const exporter = rooms => {
  const roomsForExport = rooms.map(room => {
    const { alias, members, ...roomForExport } = room;
    return roomForExport;
  });

  jsonExport(
    roomsForExport,
    {
      headers: [
        "id",
        "name",
        "canonical_alias",
        "creator",
        "joined_members",
        "joined_local_members",
        "joined_local_devices",
        "state_events",
        "version",
        "encryption",
        "is_encrypted",
        "federatable",
        "public",
        "join_rules",
        "guest_access",
        "history_visibility",
      ],
    },
    (err, csv) => {
      downloadCSV(csv, "rooms");
    }
  );
};

// Actions de la liste des salons. On redéfinit la barre d'outils uniquement
// pour pouvoir passer un `maxResults` élevé à l'ExportButton et ainsi exporter
// tous les salons (et pas seulement les 1000 premiers). Même approche que pour
// la liste des utilisateurs.
const RoomListActions = ({
  currentSort,
  className,
  resource,
  filters,
  displayedFilters,
  exporter,
  filterValues,
  permanentFilter,
  basePath,
  selectedIds,
  onUnselectItems,
  showFilter,
  maxResults,
  total,
  ...rest
}) => {
  return (
    <TopToolbar className={className} {...sanitizeListRestProps(rest)}>
      {filters &&
        cloneElement(filters, {
          resource,
          showFilter,
          displayedFilters,
          filterValues,
          context: "button",
        })}
      <ExportButton
        disabled={total === 0}
        resource={resource}
        sort={currentSort}
        filter={{ ...filterValues, ...permanentFilter }}
        exporter={exporter}
        maxResults={maxResults}
      />
    </TopToolbar>
  );
};

RoomListActions.defaultProps = {
  selectedIds: [],
  onUnselectItems: () => null,
};

const RoomBulkActionButtons = props => (
  <Fragment>
    <RoomDirectoryBulkSaveButton {...props} />
    <RoomDirectoryBulkDeleteButton {...props} />
    <BulkDeleteButton
      {...props}
      confirmTitle="resources.rooms.action.erase.title"
      confirmContent="resources.rooms.action.erase.content"
      mutationMode="pessimistic"
    />
  </Fragment>
);

const RoomFilter = ({ ...props }) => {
  const translate = useTranslate();
  return (
    <Filter {...props}>
      <SearchInput source="search_term" alwaysOn />
      <Chip
        label={translate("resources.rooms.fields.joined_local_members")}
        source="joined_local_members"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.state_events")}
        source="state_events"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.version")}
        source="version"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.federatable")}
        source="federatable"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
    </Filter>
  );
};

const RoomNameField = props => {
  const { source } = props;
  const record = useRecordContext(props);
  return (
    <span>{record[source] || record["canonical_alias"] || record["id"]}</span>
  );
};

RoomNameField.propTypes = {
  label: PropTypes.string,
  record: PropTypes.object,
  source: PropTypes.string.isRequired,
};

const FilterableRoomList = ({ roomFilters, dispatch, ...props }) => {
  const filter = roomFilters;
  const localMembersFilter =
    filter && filter.joined_local_members ? true : false;
  const stateEventsFilter = filter && filter.state_events ? true : false;
  const versionFilter = filter && filter.version ? true : false;
  const federateableFilter = filter && filter.federatable ? true : false;

  return (
    <List
      {...props}
      pagination={<RoomPagination />}
      sort={{ field: "name", order: "ASC" }}
      filters={<RoomFilter />}
      actions={<RoomListActions maxResults={100000} />}
      exporter={exporter}
      bulkActionButtons={<RoomBulkActionButtons />}
    >
      <Datagrid rowClick="show">
        <EncryptionField
          source="is_encrypted"
          sortBy="encryption"
          label={<HttpsIcon />}
        />
        <RoomNameField source="name" />
        <TextField source="joined_members" />
        {localMembersFilter && <TextField source="joined_local_members" />}
        {stateEventsFilter && <TextField source="state_events" />}
        {versionFilter && <TextField source="version" />}
        {federateableFilter && <BooleanField source="federatable" />}
        <BooleanField source="public" />
      </Datagrid>
    </List>
  );
};

function mapStateToProps(state) {
  return {
    roomFilters: state.admin.resources.rooms.list.params.displayedFilters,
  };
}

export const RoomList = connect(mapStateToProps)(FilterableRoomList);

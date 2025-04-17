import React, { Fragment, useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import { Chip } from "@material-ui/core";
import { connect } from "react-redux";
import FolderSharedIcon from "@material-ui/icons/FolderShared";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import { makeStyles } from "@material-ui/core/styles";
import {
  BooleanField,
  BulkDeleteButton,
  Button,
  Datagrid,
  DeleteButton,
  Filter,
  List,
  NumberField,
  Pagination,
  TextField,
  useCreate,
  useDataProvider,
  useMutation,
  useNotify,
  useTranslate,
  useRefresh,
  useUnselectAll,
} from "react-admin";
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  TextField as MuiTextField,
  Button as MuiButton,
  Autocomplete as MuiAutocomplete,
} from "@mui/material";


const useStyles = makeStyles({
  small: {
    height: "40px",
    width: "40px",
  },
});

const RoomDirectoryPagination = props => (
  <Pagination {...props} rowsPerPageOptions={[100, 500, 1000, 2000]} />
);

export const RoomDirectoryDeleteButton = props => {
  const translate = useTranslate();

  return (
    <DeleteButton
      {...props}
      label="resources.room_directory.action.erase"
      redirect={false}
      mutationMode="pessimistic"
      confirmTitle={translate("resources.room_directory.action.title", {
        smart_count: 1,
      })}
      confirmContent={translate("resources.room_directory.action.content", {
        smart_count: 1,
      })}
      resource="room_directory"
      icon={<FolderSharedIcon />}
    />
  );
};

export const RoomDirectoryBulkDeleteButton = props => (
  <BulkDeleteButton
    {...props}
    label="resources.room_directory.action.erase"
    mutationMode="pessimistic"
    confirmTitle="resources.room_directory.action.title"
    confirmContent="resources.room_directory.action.content"
    resource="room_directory"
    icon={<FolderSharedIcon />}
  />
);

export const RoomDirectoryBulkSaveButton = ({ selectedIds }) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll();
  const [createMany, { loading }] = useMutation();

  const handleSend = values => {
    createMany(
      {
        type: "createMany",
        resource: "room_directory",
        payload: { ids: selectedIds, data: {} },
      },
      {
        onSuccess: ({ data }) => {
          notify("resources.room_directory.action.send_success");
          unselectAll("rooms");
          refresh();
        },
        onFailure: error =>
          notify("resources.room_directory.action.send_failure", "error"),
      }
    );
  };

  return (
    <Button
      label="resources.room_directory.action.create"
      onClick={handleSend}
      disabled={loading}
    >
      <FolderSharedIcon />
    </Button>
  );
};

export const RoomDirectorySaveButton = ({ record }) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const [create, { loading }] = useCreate("room_directory");

  const handleSend = values => {
    create(
      {
        payload: { data: { id: record.id } },
      },
      {
        onSuccess: ({ data }) => {
          notify("resources.room_directory.action.send_success");
          refresh();
        },
        onFailure: error =>
          notify("resources.room_directory.action.send_failure", "error"),
      }
    );
  };

  return (
    <Button
      label="resources.room_directory.action.create"
      onClick={handleSend}
      disabled={loading}
    >
      <FolderSharedIcon />
    </Button>
  );
};


export const RoomDirectoryJoinButton = ({ record }) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const [create, { isLoading }] = useCreate("join_room");

  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setUsersLoading(true);
    dataProvider
      .getList("users", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "name", order: "ASC" },
        filter: {},
      })
      .then(({ data }) => {
        setUsers(data);
        setUsersLoading(false);
      })
      .catch(() => {
        notify("Erreur lors du chargement des utilisateurs", "error");
        setUsersLoading(false);
      });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  const handleConfirm = () => {
    if (!selectedUser) return;
    create(
      {
        payload: {
          data: {
            id: record.id,
            user_id: selectedUser.id,
          },
        },
      },
      {
        onSuccess: () => {
          notify("Utilisateur ajouté au salon !");
          refresh();
          handleClose();
        },
        onFailure: () => {
          notify("Erreur lors de l'ajout", "error");
        },
      }
    );
  };

  return (
    <>
      <MuiButton
        onClick={handleOpen}
        startIcon={<MeetingRoomIcon />}
        disabled={isLoading}
      >
        Rejoindre
      </MuiButton>

      <MuiDialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <MuiDialogTitle>Ajouter un utilisateur au salon</MuiDialogTitle>
        <MuiDialogContent>
          <MuiAutocomplete
            fullWidth
            options={users}
            loading={usersLoading}
            getOptionLabel={(option) => option.id}
            value={selectedUser}
            onChange={(event, newValue) => setSelectedUser(newValue)}
            renderInput={(params) => (
              <MuiTextField
                {...params}
                label="Utilisateur"
                variant="standard"
              />
            )}
          />
        </MuiDialogContent>
        <MuiDialogActions>
          <MuiButton onClick={handleClose}>Annuler</MuiButton>
          <MuiButton
            onClick={handleConfirm}
            disabled={isLoading || !selectedUser}
          >
            Confirmer
          </MuiButton>
        </MuiDialogActions>
      </MuiDialog>
    </>
  );
};

const RoomDirectoryBulkActionButtons = props => (
  <Fragment>
    <RoomDirectoryBulkDeleteButton {...props} />
  </Fragment>
);

const AvatarField = ({ source, className, record = {} }) => (
  <Avatar src={record[source]} className={className} />
);

const RoomDirectoryFilter = ({ ...props }) => {
  const translate = useTranslate();
  return (
    <Filter {...props}>
      <Chip
        label={translate("resources.rooms.fields.room_id")}
        source="room_id"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.topic")}
        source="topic"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
      <Chip
        label={translate("resources.rooms.fields.canonical_alias")}
        source="canonical_alias"
        defaultValue={false}
        style={{ marginBottom: 8 }}
      />
    </Filter>
  );
};

export const FilterableRoomDirectoryList = ({
  roomDirectoryFilters,
  dispatch,
  ...props
}) => {
  const classes = useStyles();
  const translate = useTranslate();
  const filter = roomDirectoryFilters;
  const roomIdFilter = filter && filter.room_id ? true : false;
  const topicFilter = filter && filter.topic ? true : false;
  const canonicalAliasFilter = filter && filter.canonical_alias ? true : false;

  return (
    <List
      {...props}
      pagination={<RoomDirectoryPagination />}
      bulkActionButtons={<RoomDirectoryBulkActionButtons />}
      filters={<RoomDirectoryFilter />}
      perPage={100}
    >
      <Datagrid rowClick={(id, basePath, record) => "/rooms/" + id + "/show"}>
        <AvatarField
          source="avatar_src"
          sortable={false}
          className={classes.small}
          label={translate("resources.rooms.fields.avatar")}
        />
        <TextField
          source="name"
          sortable={false}
          label={translate("resources.rooms.fields.name")}
        />
        {roomIdFilter && (
          <TextField
            source="room_id"
            sortable={false}
            label={translate("resources.rooms.fields.room_id")}
          />
        )}
        {canonicalAliasFilter && (
          <TextField
            source="canonical_alias"
            sortable={false}
            label={translate("resources.rooms.fields.canonical_alias")}
          />
        )}
        {topicFilter && (
          <TextField
            source="topic"
            sortable={false}
            label={translate("resources.rooms.fields.topic")}
          />
        )}
        <NumberField
          source="num_joined_members"
          sortable={false}
          label={translate("resources.rooms.fields.joined_members")}
        />
        <BooleanField
          source="world_readable"
          sortable={false}
          label={translate("resources.room_directory.fields.world_readable")}
        />
        <BooleanField
          source="guest_can_join"
          sortable={false}
          label={translate("resources.room_directory.fields.guest_can_join")}
        />
      </Datagrid>
    </List>
  );
};

function mapStateToProps(state) {
  return {
    roomDirectoryFilters:
      state.admin.resources.room_directory.list.params.displayedFilters,
  };
}

export const RoomDirectoryList = connect(mapStateToProps)(
  FilterableRoomDirectoryList
);

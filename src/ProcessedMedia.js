import React, {useEffect, useState} from "react";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import MediaTable from "./MediaTable";

function ProcessedMedia(props) {

    const [media, setMedia] = useState({items: []})
    const [selection, setSelection] = useState([])

    const [failed, setFailed] = useState(null);
    const [loading, setLoading] = useState(true);

    const headers = [
        {id: 'file_name', numeric: false, disablePadding: false, label: 'File Name'},
    ];

    const getMedia = async () => {
        const resp = await fetch("/api/conv/processed");
        const parsed = await resp.json();
        setMedia(parsed);
        setLoading(false);
    }

    useEffect(() => {
        getMedia()
        const i = setInterval(getMedia, 10000)
        return () => clearInterval(i)
    }, [])

    const handleDelete = async () => {

    }


    const actions = [
        () => (
            <Tooltip key={2} title="Delete">
                <IconButton onClick={handleDelete} aria-label="delete">
                    <DeleteIcon/>
                </IconButton>
            </Tooltip>
        )
    ]

    return (
        <div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                open={!!failed}
                autoHideDuration={6000}
                onClose={() => setFailed(null)}
            >
                <Alert variant="filled" onClose={() => setFailed(null)} elevation={6} severity="error">
                    {failed}
                </Alert>
            </Snackbar>
            <MediaTable
                actions={actions}
                headCells={headers}
                rows={media.items}
                title={"Processed Media"}
                onSelectionChange={setSelection}
                loading={loading}
            />
        </div>
    )
}

export default ProcessedMedia;
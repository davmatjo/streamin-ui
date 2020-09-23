import React, {useEffect, useState} from 'react';
import MediaTable from "./MediaTable";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import Tooltip from "@material-ui/core/Tooltip";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Paper from "@material-ui/core/Paper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: "10px",
    },
    consoleText: {
        whiteSpace: "pre-wrap",
        fontFamily: "monospace"
    },
    consoleBack: {
        backgroundColor: "black",
        borderRadius: "2px",
        maxHeight: "50vh",
        overflow: "auto",
        padding: "5px 10px"
    },
    title: {
        padding: "10px 0 10px 0"
    },
    progress: {
        position: "fixed"
    }
}));

function Detail(props) {
    const {classes, data} = props;

    return <Paper className={classes.paper}>

        {!!data.detail && <>
            <Typography className={classes.title} variant="h6" id="tableTitle"
                        component="div">
                Detail
            </Typography>
            <div style={{display: "flex", justifyContent: "space-around"}}>
                <table>
                    <tbody>
                    <tr>
                        <td>Frame:</td>
                        <td>{data.detail.frame}</td>
                    </tr>
                    <tr>
                        <td>FPS:</td>
                        <td>{data.detail.fps}</td>
                    </tr>
                    <tr>
                        <td>Current Time:</td>
                        <td>{data.detail.time.secs}s</td>
                    </tr>
                    </tbody>
                </table>
                <table>
                    <tbody>
                    <tr>
                        <td>Bitrate:</td>
                        <td>{data.detail.bitrate}kbit/s</td>
                    </tr>
                    <tr>
                        <td>Total Size:</td>
                        <td>{(data.detail.total_size / 1000000).toFixed(2)}MB</td>
                    </tr>
                    <tr>
                        <td>Length:</td>
                        <td>{(data.detail.length.secs)}s</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </>}
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
            STDOUT
        </Typography>
        <div className={classes.consoleBack}>
            <pre className={classes.consoleText}>{data.logs.stdout.join("\n")}</pre>
        </div>
        <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
            STDERR
        </Typography>
        <div className={classes.consoleBack}>
            <pre className={classes.consoleText}>{data.logs.stderr.join("\n")}</pre>
        </div>
    </Paper>;
}

function UnprocessedMedia(props) {
    const classes = useStyles();

    const [unprocessed, setUnprocessed] = useState({items: []})
    const [unprocessedSelection, setUnprocessedSelection] = useState([])

    const [sessions, setSessions] = useState({items: []})
    const [sessionsSelection, setSessionsSelection] = useState([]);

    const [failed, setFailed] = useState(null);
    const [loading, setLoading] = useState(true);

    const unprocessedHeaders = [
        {id: 'file_title', numeric: false, disablePadding: false, label: 'File Name'},
        {id: 'meta_title', numeric: false, disablePadding: false, label: 'Metadata Name'},
        {id: 'video_codec', numeric: false, disablePadding: false, label: 'Video Codec'},
        {id: 'audio_codec', numeric: false, disablePadding: false, label: 'Audio Codec'},
    ];
    const sessionHeaders = [
        {id: 'file_name', numeric: false, disablePadding: false, label: 'File Name'},
        {id: 'stage', numeric: false, disablePadding: false, label: 'Current Stage'},
        {id: 'max_stages', numeric: false, disablePadding: false, label: 'Total Stages'},
        {id: 'percent_complete', numeric: false, disablePadding: false, label: 'Progress'},
    ]

    const getMedia = async (notify) => {
        const unprocessedP = fetch("/api/conv/unprocessed");
        const sessionsP = fetch("/api/conv/session");

        const unprocessed = await unprocessedP;
        const parsedUnprocessed = await unprocessed.json();
        setUnprocessed(parsedUnprocessed);

        const sessions = await sessionsP;
        const parsedSessions = await sessions.json();
        const checkedParsedSessions = {
            items: parsedSessions.items.map(s => {
                if (s.failed) {
                    s.percent_complete = "ERROR"
                    if (notify) {
                        setFailed(`Job ${s.file_name} failed, check details for more information`)
                    }
                }
                return s;
            })
        }

        setSessions(checkedParsedSessions);
        setLoading(false);
    }

    useEffect(() => {
        getMedia(true)
        const i = setInterval(getMedia, 10000)
        return () => clearInterval(i)
    }, [])

    const handleProcessSession = async () => {
        for (let s of unprocessedSelection) {
            console.log({
                id: s.id,
                dash: true,
            })

            const res = await fetch("/api/conv/process", {
                method: "POST",
                body: JSON.stringify({
                    id: s.id,
                    dash: true,
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (!res.ok) {
                setFailed(`Request to convert ${s['file_title']} failed`)
            } else {
                await getMedia(true);
            }
        }

    }

    let moreInfo;
    if (sessionsSelection[0]) {
        const moreInfoIdx = sessions.items.findIndex(item => {
            return item.id === sessionsSelection[0].id
        })
        moreInfo = sessions.items[moreInfoIdx];
    }


    const actions = [
        () => (
            <Tooltip key={1} title="Delete">
                <IconButton onClick={() => console.log(sessionsSelection)} aria-label="delete">
                    <DeleteIcon/>
                </IconButton>
            </Tooltip>
        ),
        () => (
            <Tooltip key={2} title="Convert">
                <IconButton onClick={handleProcessSession} aria-label="convert">
                    <PlayArrowIcon/>
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
                headCells={unprocessedHeaders}
                rows={unprocessed.items}
                title={"Unprocessed Media"}
                onSelectionChange={setUnprocessedSelection}
                loading={loading}
            />
            <MediaTable
                actions={[]}
                headCells={sessionHeaders}
                rows={sessions.items}
                title={"Processing"}
                singleSelect
                onSelectionChange={setSessionsSelection}
                loading={loading}
            />
            {!!moreInfo && <Detail classes={classes} data={moreInfo}/>}
        </div>
    )
}

export default UnprocessedMedia;
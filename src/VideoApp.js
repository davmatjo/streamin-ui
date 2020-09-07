import React, {useEffect, useRef, useState} from 'react';
import {useParams} from "react-router-dom"
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Paper from "@material-ui/core/Paper";
import Chat from "./Chat";
import RxPlayer from "rx-player";
import VideoController from "./VideoController";
import Communicator from "./Communicator";
import UserInput from "./SetUser";
import Alert from '@material-ui/lab/Alert';
import Snackbar from "@material-ui/core/Snackbar";


const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing(2)
    },
    paper: {
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    fill: {
        height: "100%",
        width: "100%"
    },
    fillWidth: {
        width: "100%"
    },
    videoCont: {
        height: "91vh"
    },
    video: {
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        padding: "0"
    }
}));

const initVid = (vid) => {
    const player = new RxPlayer({
        videoElement: vid.current
    });
    player.addEventListener("error", (err) => {
        console.log("the content stopped with the following error", err);
    });

    return player
}

const VideoApp = () => {
    const classes = useStyles();
    const vid = useRef(null);
    const [update, setUpdate] = useState(false);
    const [player, setPlayer] = useState(null);
    const [leader, setLeader] = useState(false);
    const [viewers, setViewers] = useState(0);
    const [messages, setMessages] = useState([]);
    const [conn, setConn] = useState(null);
    const [username, setUsername] = useState("");
    const [failed, setFailed] = useState(null);

    // UseParams is for accessing named parts of the URL from react-router-dom
    let {id} = useParams();

    // Sets up the initial player with render refresh whenever the player state changes
    useEffect(() => {
        const player = initVid(vid);
        setPlayer(player)
        player.addEventListener("playerStateChange", () => {
            setUpdate(!update)
        })
    }, [vid]);

    // Handles closing the websocket connection on component unmount. Additionally removes the reconnect fn from onclose
    useEffect(() => {
        return () => {
            console.log("destroying conn")
            if (conn) {
                console.log("destroying conn fo real")
                conn.onclose = () => {
                }
                conn.close()
            }
        }
    }, [conn])

    // Sets up the websocket on component mount and sends initial protocol messages
    useEffect(() => {
        let retryTimeout;
        const doStart = async () => {
            console.log("Creating new connection")

            let sessionExists;
            try {
                sessionExists = await fetch(`/api/sessions/${id}`)
            } catch (e) {
                throw "Failed to connect to server. Retrying..."
            }
            if (sessionExists.status === 404) {
                throw "Session does not exist"
            }
            if (sessionExists.status !== 200) {
                throw "Unknown error"
            }


            let proto = "";
            if (window.location.protocol === "https:") {
                proto += "wss://"
            } else {
                proto += "ws://"
            }

            const conn = new WebSocket(`${proto}${document.location.host}/api/sessions/${id}/join`);
            conn.onclose = () => {
                retryTimeout = setTimeout(start, 5000);
                setFailed("Socket closed. Attempting to reconnect...");
            };

            conn.addEventListener("open", () => {
                conn.send(JSON.stringify({Type: "i", Action: "media", Data: ""}))
                createUser(localStorage.getItem("username"), conn)
                setFailed(null)
            })
            setConn(conn);
        }
        const start = () => {
            doStart().catch(e => {
                    retryTimeout = setTimeout(start, 5000);
                    setFailed(e.toString());
                }
            );
        }
        start();
        return () => {
            clearTimeout(retryTimeout)
        }
    }, [])

    const createUser = (u, connection) => {
        // We take the optional parameter for connection for the cases where the state might not have yet been set
        const conn = connection ? connection : conn
        conn.send(JSON.stringify({Type: "i", Action: "name", Data: u}))
        localStorage.setItem("username", u)
        setUsername(u);
    }

    return (
        <div className={classes.root}>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                open={failed}
            >
                <Alert variant="filled" elevation={6} severity="error">
                    {failed}
                </Alert>
            </Snackbar>
            <UserInput open={!username && !failed} onSetUsername={createUser}/>
            <div className={classes.fillWidth}>
                <Communicator
                    player={player}
                    conn={conn}
                    leader={leader}
                    onLeaderElection={() => setLeader(true)}
                    onMessage={(m) => setMessages([...messages, m])}
                    onViewers={(v) => setViewers(v)}
                />
                <Grid container spacing={2}>
                    <Grid item xs={10} className={classes.videoCont}>
                        <video controls={leader} className={classes.video} ref={vid}/>
                    </Grid>
                    <Grid item xs={2} className={classes.videoCont} style={{padding: "10px 8px 10px 8px"}}>
                        <Paper className={`${classes.paper} ${classes.fill}`}>
                            <Chat
                                viewers={viewers}
                                messages={messages}
                                leader={leader}
                                onSubmitMessage={(m) => conn.send(JSON.stringify({Type: "m", Data: m}))}
                                onSelectMedia={(m) => {
                                    conn.send(JSON.stringify({Type: "i", Action: "media", Data: m}));
                                    player.loadVideo({
                                        url: `/media/${m}/manifest.mpd`,
                                        transport: "dash",
                                        autoPlay: true
                                    });
                                }}
                            />
                        </Paper>
                    </Grid>
                </Grid>
                <Grid container style={{marginTop: "4px"}} spacing={2}>
                    <Grid item xs={12}>
                        <Paper className={classes.paper}>
                            <VideoController player={player} leader={leader}/>
                        </Paper>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
}

export default VideoApp;

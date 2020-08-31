import React, {useEffect, useRef, useState} from 'react';
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Paper from "@material-ui/core/Paper";
import Chat from "./Chat";
import RxPlayer from "rx-player";
import VideoController from "./VideoController";
import Communicator from "./Communicator";
import UserInput from "./SetUser";


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

const App = () => {
    const classes = useStyles();
    const vid = useRef(null);
    const [update, setUpdate] = useState(false);
    const [player, setPlayer] = useState(null);
    const [leader, setLeader] = useState(false);
    const [viewers, setViewers] = useState(0);
    const [messages, setMessages] = useState([]);
    const [conn, setConn] = useState(null);
    const [username, setUsername] = useState("");

    useEffect(() => {
        const player = initVid(vid);
        setPlayer(player)
        player.addEventListener("playerStateChange", () => {
            setUpdate(!update)
        })
    }, [vid]);

    useEffect(() => {
        const start = (reconnect) => {
            console.log("Creating new connection")
            const conn = new WebSocket("ws://" + document.location.host + "/ws");
            conn.onclose = () => {
                alert("connection closed");
                setTimeout(() => start(true), 5000)
            };

            setConn(conn);
            if (reconnect) {
                conn.addEventListener("open", () => {
                    if (username !== "") {
                        createUser(username)
                    }
                    alert("reconnected")
                })
            }
        }
        start(false);
    }, [])

    const createUser = (u) => {
        conn.send(JSON.stringify({Type: "i", Action: "name", Data: u}))
        setUsername(u);
    }

    return (
        <div className={classes.root}>
            <UserInput open={username === ""} onSetUsername={createUser}/>
            <div className={classes.fillWidth}>
                <Communicator
                    player={player}
                    conn={conn}
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
                                onSelectMedia={(m) => conn.send(JSON.stringify({Type: "c", Action: "media", Data: m}))}
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

export default App;

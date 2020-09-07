import React, {useEffect, useState} from "react";
import {useHistory} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Grid} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import ButtonBase from "@material-ui/core/ButtonBase";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from '@material-ui/icons/Close';
import VisibilityIcon from "@material-ui/icons/Visibility";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing(4)
    },
    paper: {
        padding: "8px 20px",
        textAlign: 'center',
        color: theme.palette.text.secondary,
        width: "100%",
        height: "30vh"
    },
    fab: {
        position: 'fixed',
        bottom: theme.spacing(5),
        right: theme.spacing(5),
    },
    close: {
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1)
    },
    thumb: {
        height: "70%",
        width: "100%",
    },
    userPaper: {
        padding: theme.spacing(2),
        position: "fixed",
        bottom: theme.spacing(3),
        left: theme.spacing(3),
        width: "40vw"
    },
    fill: {
        width: "100%",
        height: "100%"
    }
}));

const Home = () => {
    const classes = useStyles();
    const history = useHistory();

    const [panels, setPanels] = useState([]);
    const [username, setUsername] = useState(null);

    const onSessionCreate = async () => {
        const resp = await fetch("/api/sessions/create", {method: "POST"})
        console.log(resp.status)
        getSessions()
    }

    const onSessionDelete = async (id) => {
        const resp = await fetch(`/api/sessions/${id}`, {method: "DELETE"})
        console.log(resp.status)
        getSessions()
    }

    const getSessions = async () => {
        const resp = await fetch("/api/sessions")
        const parsed = await resp.json()
        console.log(parsed)
        setPanels(parsed.Sessions)
    }

    useEffect(() => {
        if (username === null || username === undefined) {
            const loaded = localStorage.getItem("username")
            if (loaded === null || loaded === undefined) {
                setUsername("")
            } else {
                setUsername(loaded)
            }
        } else {
            localStorage.setItem("username", username)
        }
    }, [username])

    useEffect(() => {
        getSessions()
        const i = setInterval(getSessions, 3000)
        return () => {
            console.log("cancelling")
            clearInterval(i)
        }
    }, [])

    return (
        <div className={classes.root}>
            {panels.length === 0 && <div className={classes.root}>
                <h1>No sessions are active.</h1>
            </div>}

            <Grid container spacing={6}>
                {panels.map(p => (
                    <Grid item xs={12} md={4} xl={3}>
                        <ButtonBase
                            className={classes.fill}
                            onClick={() => {
                                history.push(`/watch/${p.Id}`)
                            }}
                        >
                            <Paper className={classes.paper}>
                                <h3>{p.Media ? p.Media : "No Media Playing"}</h3>
                                <IconButton
                                    className={classes.close}
                                    aria-label="delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSessionDelete(p.Id)
                                    }}
                                >
                                    <CloseIcon/>
                                </IconButton>
                                <div style={{height: "60%", width: "100%", backgroundColor: "black"}}/>
                                <p>Room ID: {p.Id}</p>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    color="primary"
                                    disabled
                                    className={classes.button}
                                    startIcon={<VisibilityIcon/>}
                                >
                                    {p.Viewers}
                                </Button>
                            </Paper>
                        </ButtonBase>
                    </Grid>
                ))}
            </Grid>
            <Paper className={classes.userPaper} elevation={5}>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    variant="outlined"
                    label="Username"
                    fullWidth
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </Paper>
            <Fab className={classes.fab} color="primary" aria-label="add" onClick={onSessionCreate}>
                <AddIcon/>
            </Fab>
        </div>
    )
};

export default Home;
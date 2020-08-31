import React, {useEffect, useRef, useState} from "react";
import VisibilityIcon from '@material-ui/icons/Visibility';
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from "@material-ui/core/TextField";
import {Grid} from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";

const useStyles = makeStyles((theme) => ({
    container: {
        height: "100%",
        display: "flex",
        flexFlow: "column",
        padding: theme.spacing(2)
    },
    messageContainer: {
        flex: "1",
        overflowY: "auto",
        overflowWrap: "anywhere",
        margin: theme.spacing(1)
    },
    message: {
        textAlign: "left"
    },
    fillWidth: {
        width: "100%"
    },
    button: {
        height: "100%"
    }
}));

const Chat = (props) => {
    const classes = useStyles();

    const bottom = useRef(null);

    const [input, setInput] = useState("");
    const [availableMedia, setAvailableMedia] = useState([]);
    const [media, setMedia] = useState(null)

    useEffect(() => {
        bottom.current.scrollIntoView({behavior: "smooth"})
    })

    useEffect(() => {
        fetch("/api/media")
            .then(r => r.json()
                .then(r => setAvailableMedia(r["Items"])))
    }, [])

    return (
        <div className={classes.container}>
            <Grid container spacing={2}>
                <Grid item xs={props.leader ? 4 : 12}>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        disabled
                        className={classes.button}
                        startIcon={<VisibilityIcon/>}
                    >
                        {props.viewers}
                    </Button>
                </Grid>
                {props.leader && <Grid item xs={8}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Media Choice</InputLabel>
                        <Select
                            value={media}
                            fullWidth
                            onChange={(e) => {
                                props.onSelectMedia(e.target.value)
                                setMedia(e.target.value)
                            }}
                        >
                            {
                                availableMedia.map((m) => (
                                    <MenuItem key={m}
                                              value={m}>{m}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </Grid>}
            </Grid>

            <div className={classes.messageContainer}>
                {props.messages.map((m) => (

                    <p className={classes.message}><b>{m.Action}</b>: {m.Data}</p>

                ))}
                <div style={{float: "left", clear: "both"}}
                     ref={bottom}>
                </div>
            </div>
            <div className={classes.fillWidth}>
                <form noValidate autoComplete="off" onSubmit={(e) => {
                    if (input) {
                        props.onSubmitMessage(input);
                    }
                    setInput("");
                    e.preventDefault();
                    return false;
                }}>
                    <TextField
                        className={classes.fillWidth}
                        variant="filled"
                        id="standard-basic"
                        label="Chat"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </form>
            </div>
        </div>
    )
        ;
};

export default Chat;
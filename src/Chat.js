import React, {useEffect, useRef, useState} from "react";
import VisibilityIcon from '@material-ui/icons/Visibility';
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import TextField from "@material-ui/core/TextField";

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
    }
}));

const Chat = (props) => {
    const classes = useStyles();

    const bottom = useRef(null);

    const [input, setInput] = useState("");

    useEffect(() => {
        bottom.current.scrollIntoView({behavior: "smooth"})
    })

    return (
        <div className={classes.container}>
            <Button
                variant="outlined"
                color="primary"
                disabled
                className={classes.button}
                startIcon={<VisibilityIcon/>}
            >
                {props.viewers}
            </Button>

            <div className={classes.messageContainer}>
                {props.messages.map((m) => (

                    <p className={classes.message}><b>{m.Action}</b>: {m.Data}</p>

                ))}
                <div style={{ float:"left", clear: "both" }}
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
    );
};

export default Chat;
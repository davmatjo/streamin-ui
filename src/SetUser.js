import React, {useState} from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

const UserInput = (props) => {
    const [username, setUsername] = useState("");

    const handleClose = () => {
        props.onSetUsername(username);
    }

    return (
        <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Sign In</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter the username you would like to chat with
                </DialogContentText>
                <form onSubmit={(e) => {
                    handleClose()
                    e.preventDefault();
                    return false;
                }}>
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
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default UserInput;
import React, {useEffect, useState} from "react";
import {Grid} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import makeStyles from "@material-ui/core/styles/makeStyles";
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {VolumeDown, VolumeUp} from "@material-ui/icons";
import Slider from "@material-ui/core/Slider";


const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    button: {
        margin: theme.spacing(1),
    },
    centreFlex: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    }
}));

const isFullscreen = () => {
    return !!(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    );
}

const enterFullscreen = (player) => {
    if (isFullscreen()) { // see code above
        return;
    }

    const mediaElement = player.getVideoElement();
    if (!mediaElement) {
        throw new Error("No media element");
    }
    if (mediaElement.requestFullscreen) {
        mediaElement.requestFullscreen();
    } else if (mediaElement.msRequestFullscreen) {
        mediaElement.msRequestFullscreen();
    } else if (mediaElement.mozRequestFullScreen) {
        mediaElement.mozRequestFullScreen();
    } else if (mediaElement.webkitRequestFullscreen) {
        mediaElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
}

const VideoController = (props) => {
    const classes = useStyles();

    const [videoTracks, setVideoTracks] = useState(null);
    const [audioTracks, setAudioTracks] = useState(null);
    const [textTracks, setTextTracks] = useState(null);
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        if (!props.player) {
            return
        }

        props.player.addEventListener("availableAudioTracksChange")
        props.player.addEventListener("availableVideoTracksChange")
        props.player.addEventListener("availableTextTracksChange")
        props.player.addEventListener("availableAudioTracksChange", (t) => {
            setAudioTracks(t)
        })
        props.player.addEventListener("availableVideoTracksChange", (t) => {
            setVideoTracks(t)
        })
        props.player.addEventListener("availableTextTracksChange", (t) => setTextTracks(t))

    }, [props.player])

    if (!props.player || !audioTracks || !videoTracks) {
        return null
    }

    const audioTrack = props.player.getAudioTrack()
    const audioTrackId = audioTrack ? audioTrack.id : undefined
    const textTrack = props.player.getTextTrack()
    const textTrackId = textTrack ? textTrack.id : undefined

    return (
        <div>
            <Grid container spacing={3}>
                <Grid item xs={2}>
                    <div className={classes.centreFlex}>
                        Host
                        {props.leader ? <CheckIcon/> : <ClearIcon/>}
                    </div>
                </Grid>
                <Grid item xs={2}>
                    <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel>Audio Track</InputLabel>
                        <Select
                            value={audioTrackId}
                            onChange={(e) => {
                                props.player.setAudioTrack(e.target.value)
                                setRefresh(!refresh)
                            }}
                        >
                            {
                                audioTracks.map((t) => (
                                    <MenuItem key={t.id}
                                              value={t.id}>{`${t.id} ${t.language ? `(${t.language})` : ``}`}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={4}>
                    <div className={classes.centreFlex}>
                        <div style={{width: "70%"}}>
                            <Typography id="continuous-slider" gutterBottom>
                                Volume
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item>
                                    <VolumeDown/>
                                </Grid>
                                <Grid item xs>
                                    <Slider value={props.player.getVolume()} step={0.01} max={1} onChange={(e, v) => {
                                        props.player.setVolume(v);
                                        setRefresh(!refresh);
                                    }} aria-labelledby="continuous-slider"/>
                                </Grid>
                                <Grid item>
                                    <VolumeUp/>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                </Grid>
                <Grid item xs={2}>
                    <FormControl variant="outlined" className={classes.formControl}>
                        <InputLabel>Text Track</InputLabel>
                        <Select
                            value={textTrackId}
                            onChange={(e) => {
                                if (!e.target.value) {
                                    props.player.disableTextTrack()
                                } else {
                                    props.player.setTextTrack(e.target.value)
                                }
                                setRefresh(!refresh)
                            }}
                        >
                            <MenuItem key={"none"} value={undefined}>None</MenuItem>
                            {
                                textTracks.map((t) => (
                                    <MenuItem key={t.id}
                                              value={t.id}>{`${t.id} ${t.language ? `(${t.language})` : ``}`}</MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <div className={classes.centreFlex}>
                        <Button
                            variant="contained"
                            color="primary"
                            className={classes.button}
                            startIcon={<FullscreenIcon/>}
                            onClick={() => enterFullscreen(props.player)}
                        >
                            Fullscreen
                        </Button>
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}

export default VideoController;
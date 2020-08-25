import React, {useEffect} from "react";

const onControlMessage = (m, player) => {
    if (!player || !player.play) {
        console.log("could not perform control message")
        return
    }

    switch (m.Action) {
        case "pause":
            player.pause();
            break;
        case "play":
            player.play();
            break;
        case "seek":
            const p = player.getPosition();
            if (m.Data > p + 5 || m.Data < p - 5) {
                player.seekTo({position: m.Data})
            }
            break;
    }
}

const onInfoMessage = (m, props, conn) => {
    switch (m.Action) {
        case "leader":
            console.log("Elected as leader")
            setInterval(() => {
                if (!props.player || !props.player.getPosition) {
                    return
                }

                conn.send(JSON.stringify({
                    type: "c",
                    action: "seek",
                    data: props.player.getPosition()
                }));


                conn.send(JSON.stringify({
                    type: "c",
                    action: props.player.getPlayerState() === "PLAYING" ? "play" : "pause",
                }));
            }, 3000)


            props.player.addEventListener("playerStateChange", (e) => {
                switch (e) {
                    case "PLAYING":
                        conn.send(JSON.stringify({Type: "c", Action: "play"}));
                        break;
                    case "SEEKING":
                        conn.send(JSON.stringify({Type: "c", Action: "seek", Data: props.player.getPosition()}))
                        break;
                    case "PAUSED":
                        conn.send(JSON.stringify({Type: "c", Action: "pause"}))
                        break;
                }
            })
            props.onLeaderElection(m);
            break;
        case "users":
            break;
    }
}

const Communicator = (props) => {

    useEffect(() => {
        if (!props.conn) {
            console.log("waiting for connection")
            return
        }

        console.log("Connection ok... Setting up event pipeline")

        props.conn.onmessage = (evt) => {
            const messages = evt.data.split('\n');
            messages.forEach((m) => {
                const parsed = JSON.parse(m)
                switch (parsed.Type) {
                    case "c":
                        onControlMessage(parsed, props.player);
                        break;
                    case "i":
                        onInfoMessage(parsed, props, props.conn);
                        break;
                    case "m":
                        props.onMessage(parsed);
                        break;
                    case "v":
                        props.onViewers(parsed.Data);
                        break;
                    default:
                        console.log("Unknown message type")
                }
            })
        };
    }, [props])

    return null;
};

export default Communicator;
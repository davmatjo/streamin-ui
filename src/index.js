import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {createMuiTheme, ThemeProvider} from "@material-ui/core/styles";
import CssBaseline from '@material-ui/core/CssBaseline';
import {deepPurple} from "@material-ui/core/colors";

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: deepPurple["300"]
        }
    },
});

ReactDOM.render(
    <ThemeProvider theme={darkTheme}>
        <CssBaseline/>
        <App/>
    </ThemeProvider>,
    document.getElementById('root')
);

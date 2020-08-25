import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {createMuiTheme, ThemeProvider} from "@material-ui/core/styles";
import CssBaseline from '@material-ui/core/CssBaseline';
import pink from "@material-ui/core/colors/pink";

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
        primary: {
            main: pink["300"]
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

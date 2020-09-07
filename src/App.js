import React from 'react';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import VideoApp from "./VideoApp";
import Home from "./Home";

const App = () => {
    return (
        <BrowserRouter>
            <div>
                <Switch>
                    <Route path="/watch/:id">
                        <VideoApp/>
                    </Route>
                    <Route path="/">
                        <Home/>
                    </Route>
                </Switch>
            </div>
        </BrowserRouter>
    );
}

export default App;

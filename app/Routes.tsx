import * as React from 'react';
import { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router';
const routes = require('./constants/routes.json');
import App from './containers/App';
import HomePage from './containers/HomePage';
import DataStore from './classes/DataStore';
import DigitalOceanService from './classes/DigitalOceanService';

export default class Routes extends Component {
    private dataStore: DataStore = new DataStore();
    private doClient: any = new DigitalOceanService();

    render() {
        return (
            <App>
                <Switch>
                    <Route
                        path={routes.HOME}
                        component={() => <HomePage dataStore={this.dataStore} doClient={this.doClient} />}
                    />
                    {/* <Route
                        path={routes.KEY}
                        component={() => <KeyPage dataStore={this.dataStore} doClient={this.doClient} />}
                    /> */}
                    <Redirect from="/" to="/home" />
                </Switch>
            </App>
        );
    }
}

import * as React from 'react';
import { Component } from 'react';
import { Switch, Route } from 'react-router';
const routes = require('./constants/routes.json');
import App from './containers/App';
import HomePage from './containers/HomePage';
import DataStore from './classes/DataStore';

export default class Routes extends Component {
    private dataStore: DataStore = new DataStore();

    render() {
        return (
            <App>
                <Switch>
                    <Route
                        path={routes.HOME}
                        component={() => (
                            <HomePage dataStore={this.dataStore} />
                        )}
                    />
                </Switch>
            </App>
        );
    }
}

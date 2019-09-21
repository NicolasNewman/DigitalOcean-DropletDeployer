import * as React from 'react';
import { Component } from 'react';
import { Tabs } from 'antd';
import { RouteComponentProps } from 'react-router';
import DataStore from 'app/classes/DataStore';

import Info from '../Info/Info';
import Startup from '../Startup/Startup';
import Shutdown from '../Shutdown/Shutdown';

const { TabPane } = Tabs;

interface IProps extends RouteComponentProps<any> {
    increment: () => void;
    incrementIfOdd: () => void;
    incrementAsync: () => void;
    decrement: () => void;
    counter: number;
    dataStore: DataStore;
}

const tabKeys = {
    INFO: 'info',
    STARTUP: 'startup',
    SHUTDOWN: 'shutdown'
};

export default class Home extends Component<IProps> {
    props: IProps;

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Tabs defaultActiveKey="1">
                    <TabPane tab="Info" key={tabKeys.INFO}>
                        <Info />
                    </TabPane>
                    <TabPane tab="Startup" key={tabKeys.STARTUP}>
                        <Startup />
                    </TabPane>
                    <TabPane tab="Shutdown" key={tabKeys.SHUTDOWN}>
                        <Shutdown />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

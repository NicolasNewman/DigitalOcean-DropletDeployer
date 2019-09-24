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
    dataStore: DataStore;
    doClient: any;
    startupTabState: boolean;
    shutdownTabState: boolean;
    setStartupTabState: (state: boolean) => void;
    setShutdownTabState: (state: boolean) => void;
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
                <Tabs defaultActiveKey={tabKeys.INFO}>
                    <TabPane tab="Info" key={tabKeys.INFO}>
                        <Info
                            doClient={this.props.doClient}
                            dataStore={this.props.dataStore}
                            setStartupTabState={this.props.setStartupTabState}
                            setShutdownTabState={this.props.setShutdownTabState}
                        />
                    </TabPane>
                    <TabPane tab="Startup" key={tabKeys.STARTUP} disabled={this.props.startupTabState}>
                        <Startup doClient={this.props.doClient} dataStore={this.props.dataStore} />
                    </TabPane>
                    <TabPane tab="Shutdown" key={tabKeys.SHUTDOWN} disabled={this.props.shutdownTabState}>
                        <Shutdown />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

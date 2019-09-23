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
    counter: number;
    dataStore: DataStore;
    doClient: any;
    snapshots: Array<string>;
    regions: Array<string>;
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
        console.log(this.props.snapshots);
        return (
            <div>
                <Tabs defaultActiveKey={tabKeys.INFO}>
                    <TabPane tab="Info" key={tabKeys.INFO}>
                        <Info
                            doClient={this.props.doClient}
                            dataStore={this.props.dataStore}
                            snapshots={this.props.snapshots}
                            regions={this.props.regions}
                        />
                    </TabPane>
                    <TabPane tab="Startup" key={tabKeys.STARTUP} disabled={true}>
                        <Startup />
                    </TabPane>
                    <TabPane tab="Shutdown" key={tabKeys.SHUTDOWN} disabled={true}>
                        <Shutdown />
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

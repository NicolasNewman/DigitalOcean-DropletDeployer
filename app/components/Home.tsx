import * as React from 'react';
import { Component } from 'react';
import { Tabs } from 'antd';
import { RouteComponentProps } from 'react-router';
import DataStore from 'app/classes/DataStore';

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
                <Tabs defaultActiveKey="1" onChange={callback}>
                    <TabPane tab="Info" key={tabKeys.INFO}>
                        Content of Tab Pane 1
                    </TabPane>
                    <TabPane tab="Startup" key={tabKeys.STARTUP}>
                        Content of Tab Pane 2
                    </TabPane>
                    <TabPane tab="Shutdown" key={tabKeys.SHUTDOWN}>
                        Content of Tab Pane 3
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

import * as React from 'react';
import { Component } from 'react';
import { Button, Input } from 'antd';
import DataStore from '../../classes/DataStore';
import DigitalOceanService from '../../classes/DigitalOceanService';

const { TextArea } = Input;

interface IProps {
    dataStore: DataStore;
    doClient: DigitalOceanService;
}

interface IState {
    logText: string;
}

export default class Startup extends Component<IProps, IState> {
    state: IState = {
        logText: ''
    };
    constructor(props: IProps) {
        super(props);
    }

    fromStore(key: string): any {
        return this.props.dataStore.get(key);
    }

    writeToLog(line: string) {
        const newText = this.state.logText !== '' ? this.state.logText + '\n' + line : line;
        this.setState({
            logText: newText
        });
    }

    async waitForFlag(flagFunc, func, timeout) {
        const res = await flagFunc();
        if (res) {
            func();
        } else {
            setTimeout(() => this.waitForFlag(flagFunc, func, timeout), timeout);
        }
    }

    start = async () => {
        // 1) Create the droplet
        this.writeToLog('Creating droplet...');
        const id = await this.props.doClient.createDroplet();
        this.writeToLog(`Created droplet with ID ${id}`);

        // 2) Wait for the droplet to be active
        const timeout = 15000;
        this.writeToLog(`Checking if the droplet is active every ${timeout / 1000} seconds...`);
        this.waitForFlag(
            async () => {
                const status = await this.props.doClient.getDropletStatus(id);
                this.writeToLog(`The current droplet status is ${status}`);
                return status === 'active' ? true : false;
            },
            () => {
                this.writeToLog('The droplet is now active');
            },
            timeout
        );
    };

    render() {
        return (
            <div className="form">
                <Button type="primary" onClick={this.start}>
                    Start
                </Button>
                <TextArea rows={14} className="log" value={this.state.logText} disabled={true}></TextArea>
            </div>
        );
    }
}

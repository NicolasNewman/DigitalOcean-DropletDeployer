import * as React from 'react';
import { Component } from 'react';
import { Button, Input } from 'antd';
import DataStore from '../../classes/DataStore';
import DigitalOceanService from '../../classes/DigitalOceanService';

const isReachable = require('is-reachable');

const { TextArea } = Input;

interface IProps {
    dataStore: DataStore;
    doClient: DigitalOceanService;
}

interface IState {
    logText: string;
}

export default class Shutdown extends Component<IProps, IState> {
    state: IState = {
        logText: ''
    };

    constructor(props: IProps) {
        super(props);
    }

    stop = async () => {
        // verify the server is actually on and the game server is off!
        this.writeToLog('Checking if droplet exists...');
        const dropletExists = await this.props.doClient.doesDropletExist();
        if (dropletExists) {
            this.writeToLog('Droplet found');
            this.writeToLog('Checking if the mc server is off...');
            const isServerOnline = await isReachable('mc.quantumpie.net:25565');
            if (!isServerOnline) {
                this.writeToLog('The server is offline');
                this.writeToLog('Turning off droplet...');
                await this.props.doClient.shutdownDroplet();
                let timeout = 5000;
                this.writeToLog(`Checking if the droplet is offline every ${timeout / 1000} seconds...`);
                this.waitForFlag
                    async () => {
                        const status = await this.props.doClient.getActionStatus();
                        this.writeToLog(`The current status is ${status}`);
                        return status;
                    },
                    async () => {
                        this.writeToLog('The droplet is now offline');
                        this.writeToLog('Creating snapshot of droplet...');
                        await this.props.doClient.snapshotDroplet();
                        timeout = 10000;
                        this.writeToLog(`Checking if the snapshot is complete every ${timeout / 1000} seconds...`);
                        this.waitForFlag(
                            async () => {
                                const status = await this.props.doClient.getActionStatus();
                                this.writeToLog(`The current status is ${status}`);
                                return status;
                            },
                            async () => {
                                this.writeToLog('The snapshot has been created');
                                this.writeToLog('Destroying droplet...');
                            },
                            timeout
                        );
                    },
                    timeout
                );
            }
        } else {
            this.writeToLog('Droplet does not exist. Stopping execution');
        }
    };

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

    render() {
        return (
            <div className="form">
                <Button type="primary" onClick={this.stop}>
                    Start
                </Button>
                <TextArea rows={19} className="log" value={this.state.logText} disabled={true}></TextArea>
            </div>
        );
    }
}

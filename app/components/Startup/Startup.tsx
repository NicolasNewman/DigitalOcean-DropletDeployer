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
        this.writeToLog('Checking if droplet exists...');
        const dropletExists = await this.props.doClient.doesDropletExist();
        if (dropletExists) {
            this.writeToLog('Droplet found');

            this.writeToLog('Turning off droplet...');
            await this.props.doClient.shutdownDroplet();
            let timeout = 5000;
            this.writeToLog(`Checking if the droplet is offline every ${timeout / 1000} seconds...`);
            this.waitForFlag(
                async () => {
                    // 4.1) Check if the action is finished
                    const status = await this.props.doClient.getActionStatus(
                        this.props.doClient.getDefaults().dropletId
                    );
                    this.writeToLog(`The current status is ${status}`);
                    return status === 'completed' ? true : false;
                },
                async () => {
                    this.writeToLog('The droplet is now offline');
                    this.writeToLog('Upscaling droplet...');
                    await this.props.doClient.upscaleDroplet();
                    let timeout = 10000;
                    this.writeToLog(`Checking if the droplet is upscaled every ${timeout / 1000} seconds...`);
                    this.waitForFlag(
                        async () => {
                            // 4.1) Check if the action is finished
                            const status = await this.props.doClient.getActionStatus(
                                this.props.doClient.getDefaults().dropletId
                            );
                            this.writeToLog(`The current status is ${status}`);
                            return status === 'completed' ? true : false;
                        },
                        async () => {
                            this.writeToLog('The droplet has been upscaled');
                            this.writeToLog('Turning the droplet back on...');
                            await this.props.doClient.turnOnDroplet();
                            let timeout = 5000;
                            this.writeToLog(`Checking if the droplet is on every ${timeout / 1000} seconds...`);
                            this.waitForFlag(
                                async () => {
                                    const status = await this.props.doClient.getActionStatus(
                                        this.props.doClient.getDefaults().dropletId
                                    );
                                    this.writeToLog(`The current status is ${status}`);
                                    return status === 'completed' ? true : false;
                                },
                                async () => {
                                    this.writeToLog('The droplet is scaled and online');
                                    this.writeToLog('Please wait for the server to turn on');
                                },
                                timeout
                            );
                        },
                        timeout
                    );
                },
                timeout
            );
        }
    };

    render() {
        return (
            <div className="form">
                <Button type="primary" onClick={this.start}>
                    Start
                </Button>
                <TextArea rows={19} className="log" value={this.state.logText} disabled={true}></TextArea>
            </div>
        );
    }
}

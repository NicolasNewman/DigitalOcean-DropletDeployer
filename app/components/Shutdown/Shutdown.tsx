import * as React from 'react';
import { Component } from 'react';
import { Button, Input } from 'antd';
import DataStore from '../../classes/DataStore';
import DigitalOceanService from '../../classes/DigitalOceanService';

// const isReachable = require('is-reachable');

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
                    this.writeToLog('Downscaling droplet...');
                    await this.props.doClient.downscaleDroplet();
                    let timeout = 10000;
                    this.writeToLog(`Checking if the droplet is downscaled every ${timeout / 1000} seconds...`);
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
                            this.writeToLog('The droplet has been downscaled');
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
        // // 1) Make sure the droplet exists
        // this.writeToLog('Checking if droplet exists...');
        // const dropletExists = await this.props.doClient.doesDropletExist();
        // if (dropletExists) {
        //     // 2) Make sure the server is offline
        //     this.writeToLog('Droplet found');
        //     this.writeToLog('Checking if the mc server is off...');
        //     const isServerOnline = await isReachable('mc.quantumpie.net:25565');
        //     console.log(`isServerOnline is ${isServerOnline}`);
        //     if (!isServerOnline) {
        //         this.writeToLog('The server is offline');
        //         this.writeToLog('Checking if ids are defined');
        //         // 3) Repopulate the ids if they are empty (client was closed in between startup and shutdown)
        //         if (this.props.doClient.getDefaults().dropletId === '') {
        //             this.writeToLog('Ids are empty, repopulating...');
        //             this.props.doClient.repopulateDefaults();
        //         }
        //         // 4) Shutdown the droplet and wait for the action to finish
        //         this.writeToLog('Turning off droplet...');
        //         await this.props.doClient.shutdownDroplet();
        //         let timeout = 5000;
        //         this.writeToLog(`Checking if the droplet is offline every ${timeout / 1000} seconds...`);
        //         this.waitForFlag(
        //             async () => {
        //                 // 4.1) Check if the action is finished
        //                 const status = await this.props.doClient.getActionStatus(
        //                     this.props.doClient.getDefaults().dropletId
        //                 );
        //                 this.writeToLog(`The current status is ${status}`);
        //                 return status === 'completed' ? true : false;
        //             },
        //             async () => {
        //                 // 5) Create the snapshot
        //                 this.writeToLog('The droplet is now offline');
        //                 this.writeToLog('Creating snapshot of droplet...');
        //                 await this.props.doClient.snapshotDroplet();
        //                 timeout = 25000;
        //                 this.writeToLog(`Checking if the snapshot is complete every ${timeout / 1000} seconds...`);
        //                 this.waitForFlag(
        //                     async () => {
        //                         // 5.1) Check if the action is finished
        //                         const status = await this.props.doClient.getActionStatus(
        //                             this.props.doClient.getDefaults().dropletId
        //                         );
        //                         this.writeToLog(`The current status is ${status}`);
        //                         return status === 'completed' ? true : false;
        //                     },
        //                     async () => {
        //                         // 6) Destroy the droplet
        //                         this.writeToLog('The snapshot has been created');
        //                         this.writeToLog('Destroying droplet...');
        //                         await this.props.doClient.destroyDroplet();
        //                         this.writeToLog('Droplet destroyed. It is now safe to exit');
        //                     },
        //                     timeout
        //                 );
        //             },
        //             timeout
        //         );
        //     }
        // } else {
        //     this.writeToLog('Droplet does not exist. Stopping execution');
        // }
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

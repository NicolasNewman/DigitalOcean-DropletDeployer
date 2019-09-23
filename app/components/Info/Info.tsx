import * as React from 'react';
import { Component } from 'react';
import { Form, Button, Row, Checkbox, Select, Icon, Input } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import DataStore from '../../classes/DataStore';
import DigitalOceanService from '../../classes/DigitalOceanService';
import { string } from 'prop-types';

const { Option } = Select;
const { TextArea } = Input;

interface IProps extends FormComponentProps {
    dataStore: DataStore;
    doClient: DigitalOceanService;
    snapshots: Array<string>;
    regions: Array<string>;
}

interface IState {
    logText: string;
}

class Info extends Component<IProps, IState> {
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
        console.log('LOG TEXT ' + this.state.logText);
        this.setState({
            logText: this.state.logText + '\n' + string
        });
    }

    async waitForFlag(flagFunc, func, timeout) {
        const res = await flagFunc();
        if (res) {
            func();
        } else {
            setTimeout(() => this.waitForFlag(flagFunc, func, timeout), timeout);
        }

        // const status = await this.props.doClient.getDropletStatus();
        // this.writeToLog(`The status is ${status}`);
        // if (status === "active") {
        //     console.log("THE SERVER IS ACTIVE");
        //     func();
        // } else {
        //     setTimeout(() => this.waitForFlag(func), 15000);
        // }
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                if (values.remember) {
                    this.props.dataStore.set('name', values.name);
                    this.props.dataStore.set('snapshot', values.snapshot);
                    this.props.dataStore.set('region', values.region);
                }

                // 1) Create the droplet
                this.writeToLog('Creating droplet...');
                const id = await this.props.doClient.createDroplet(values.name, values.region, values.snapshot);
                this.writeToLog(`Created droplet with id ${id}`);
                this.props.dataStore.set('id', id);

                // 2) Wait for it to turn on
                const timeout = 15000;
                this.writeToLog(`Checking if the droplet is active every ${timeout / 1000} seconds...`);
                this.waitForFlag(
                    async () => {
                        const status = await this.props.doClient.getDropletStatus(id);
                        this.writeToLog(`The current droplet status is ${status}`);
                        return status === 'active' ? true : false;
                    },
                    () => {
                        this.writeToLog('Running code after its active');
                    },
                    timeout
                );
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        console.log(this.props.dataStore);
        console.log(this.fromStore('key'));
        return (
            <div className="form">
                <Form layout={'inline'} onSubmit={this.handleSubmit}>
                    <Form.Item>
                        {getFieldDecorator('name', {
                            initialValue: `${this.fromStore('name')}`,
                            rules: [
                                {
                                    required: true,
                                    message: 'Please input a droplet name'
                                }
                            ]
                        })(
                            <Input
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,0.25)' }} />}
                                placeholder="Droplet name"
                            />
                        )}
                    </Form.Item>
                    <Row>
                        <Form.Item>
                            {getFieldDecorator('snapshot', {
                                // initialValue: `${
                                //     this.props.snapshots.includes(this.fromStore('snapshot'))
                                //         ? this.fromStore('snapshot')
                                //         : ''
                                // }`
                            })(
                                <Select style={{ width: 150 }} placeholder="Select a snapshot">
                                    {this.props.snapshots.map(name => {
                                        console.log(name);
                                        return (
                                            <Option key={name} value={name}>
                                                {name}
                                            </Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('region', {})(
                                <Select style={{ width: 150 }} placeholder="Select a region">
                                    {this.props.regions.map(name => {
                                        console.log(name);
                                        return (
                                            <Option key={name} value={name}>
                                                {name}
                                            </Option>
                                        );
                                    })}
                                </Select>
                            )}
                        </Form.Item>
                    </Row>
                    <Row>
                        <Form.Item>
                            {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true
                            })(<Checkbox>Save fields</Checkbox>)}
                        </Form.Item>
                    </Row>
                    <Row>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Row>
                </Form>
                <TextArea rows={14} className="log" value={this.state.logText} disabled={true}></TextArea>
            </div>
        );
    }
}

export default Form.create<IProps>({})(Info);

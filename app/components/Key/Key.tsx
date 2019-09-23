import * as React from 'react';
import { Component } from 'react';
import { Form, Input, Button, Icon, Row, Checkbox } from 'antd';
import { Redirect } from 'react-router';

import { FormComponentProps } from 'antd/lib/form/Form';
import DataStore from '../../classes/DataStore';
import DigitalOceanService from '../../classes/DigitalOceanService';

interface IProps extends FormComponentProps {
    dataStore: DataStore;
    doClient: DigitalOceanService;
    setSnapshot: (snapshots: Array<String>) => void;
}

interface IState {
    toHome: boolean;
    submitDisabled: boolean;
}

class Info extends Component<IProps, IState> {
    state: IState = {
        toHome: false,
        submitDisabled: false
    };

    constructor(props: IProps) {
        super(props);
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({ submitDisabled: true });
                this.setState({ submitDisabled: true });
                if (values.remember) {
                    this.props.dataStore.set('key', values.key);
                }

                // Make sure the given API key is valid and connects to a DO account
                this.props.doClient.authenticate(values.key).then(res => {
                    if (res) {
                        this.props.doClient.getSnapshots().then(res => {
                            let nameArr = [];
                            res.forEach(el => {
                                nameArr.push(el.name);
                            });
                            this.props.setSnapshot(nameArr);
                            this.setState({ toHome: true });
                        });
                    } else {
                        // TODO show error
                        this.setState({ submitDisabled: false });
                    }
                });
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        // console.log(this.props.dataStore);
        // console.log(this.props.dataStore.get('key'));

        if (this.state.toHome) {
            return <Redirect to="/home" />;
        }
        return (
            <div className="form">
                <Form layout={'inline'} onSubmit={this.handleSubmit}>
                    <Form.Item label="API Key">
                        {getFieldDecorator('key', {
                            initialValue: `${this.props.dataStore.get('key')}`,
                            rules: [
                                {
                                    required: true,
                                    message: 'Please input an API key'
                                }
                            ]
                        })(
                            <Input
                                prefix={
                                    <Icon
                                        type="user"
                                        style={{ color: 'rgba(0,0,0,0.25)' }}
                                    />
                                }
                                placeholder="API Key"
                            />
                        )}
                    </Form.Item>
                    <Row>
                        <Form.Item>
                            {getFieldDecorator('remember', {
                                valuePropName: 'checked',
                                initialValue: true
                            })(<Checkbox>Save fields</Checkbox>)}
                        </Form.Item>
                    </Row>
                    <Row>
                        <Button
                            type="primary"
                            htmlType="submit"
                            disabled={this.state.submitDisabled}
                        >
                            Submit
                        </Button>
                    </Row>
                </Form>
            </div>
        );
    }
}

export default Form.create<IProps>({})(Info);

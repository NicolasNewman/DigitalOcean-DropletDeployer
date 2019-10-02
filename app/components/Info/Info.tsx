import * as React from 'react';
import { Component } from 'react';
import { Form, Input, Button, Icon, Row, Checkbox } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import DataStore from '../../classes/DataStore';
import DigitalOceanService from '../../classes/DigitalOceanService';

interface IProps extends FormComponentProps {
    dataStore: DataStore;
    doClient: DigitalOceanService;
    setStartupTabState: (state: boolean) => void;
    setShutdownTabState: (state: boolean) => void;
}

interface IState {
    submitDisabled: boolean;
}

class Info extends Component<IProps, IState> {
    state: IState = {
        submitDisabled: false
    };

    constructor(props: IProps) {
        super(props);
    }

    handleSubmit = async e => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);

                // Disable the submit button
                this.setState({ submitDisabled: true });

                // Save the key if requested
                if (values.remember) {
                    this.props.dataStore.set('key', values.key);
                    this.props.dataStore.set('snapshotName', values.snapshotName);
                }

                // Check if the user's key is valid
                const isAuth = await this.props.doClient.authenticate(values.key, values.snapshotName);
                if (isAuth) {
                    // Enable the selection of the two tabs
                    this.props.setStartupTabState(false);
                    this.props.setShutdownTabState(false);
                } else {
                    // Re-enable the submit button
                    this.setState({ submitDisabled: false });
                }
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <div className="form">
                <Form layout={'inline'} onSubmit={this.handleSubmit}>
                    <Form.Item>
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
                                prefix={<Icon type="key" style={{ color: 'rgba(0,0,0,0.25)' }} />}
                                placeholder="API Key"
                            />
                        )}
                    </Form.Item>
                    <Row>
                        <Form.Item>
                            {getFieldDecorator('snapshotName', {
                                initialValue: `${this.props.dataStore.get('snapshotName')}`,
                                rules: [
                                    {
                                        required: true,
                                        message: 'Please input a name for the snapshot'
                                    }
                                ]
                            })(
                                <Input
                                    prefix={<Icon type="file-signature" style={{ color: 'rgba(0,0,0,0.25)' }} />}
                                    placeholder="Snapshot name"
                                />
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
                        <Button type="primary" htmlType="submit" disabled={this.state.submitDisabled}>
                            Submit
                        </Button>
                    </Row>
                </Form>
            </div>
        );
    }
}

export default Form.create<IProps>({})(Info);

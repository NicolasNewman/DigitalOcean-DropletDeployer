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
        this.setState({ submitDisabled: true });
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({ submitDisabled: true });

                // Save the key if requested
                if (values.remember) {
                    this.props.dataStore.set('key', values.key);
                }

                // Check if the user's key is valid
                const isAuth = await this.props.doClient.authenticate(values.key);
                if (isAuth) {
                    this.props.setStartupTabState(false);
                    this.props.setShutdownTabState(false);
                } else {
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
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,0.25)' }} />}
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

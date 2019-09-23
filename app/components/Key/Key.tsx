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
    setSnapshot: (snapshots: Array<string>) => void;
    setRegion: (regions: Array<string>) => void;
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

    /**
     * Takes an array of objects and returns a new array containing only one of the object's field
     * @param {Array<Object>} arr
     * @param {string} field
     * @return {Array<string>}
     */
    buildFieldArray(arr: Array<Object>, field: string): Array<string> {
        let newArr = [];
        arr.forEach(el => {
            newArr.push(el[field]);
        });
        return newArr;
    }

    handleSubmit = async e => {
        e.preventDefault();
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                this.setState({ submitDisabled: true });
                if (values.remember) {
                    this.props.dataStore.set('key', values.key);
                }

                const isAuth = await this.props.doClient.authenticate(values.key);
                if (isAuth) {
                    const snapshots = await this.props.doClient.getSnapshots();
                    this.props.setSnapshot(this.buildFieldArray(snapshots, 'name'));

                    const regions = await this.props.doClient.getRegions();
                    this.props.setRegion(this.buildFieldArray(regions, 'slug'));

                    this.setState({ toHome: true });
                } else {
                    this.setState({ submitDisabled: false });
                }
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;

        if (this.state.toHome) {
            return <Redirect to="/home" />;
        }
        return (
            <div className="container">
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

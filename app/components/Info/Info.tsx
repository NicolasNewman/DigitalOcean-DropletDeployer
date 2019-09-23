import * as React from 'react';
import { Component } from 'react';
import { Form, Button, Row, Checkbox, Select } from 'antd';
import { FormComponentProps } from 'antd/lib/form/Form';
import DataStore from '../../classes/DataStore';
import DigitalOceanService from '../../classes/DigitalOceanService';

const { Option } = Select;

interface IProps extends FormComponentProps {
    dataStore: DataStore;
    doClient: DigitalOceanService;
    snapshots: Array<string>;
}

class Info extends Component<IProps> {
    constructor(props: IProps) {
        super(props);
    }

    // TODO NEED TO AUTH BEFORE THIS CAN BE DONE
    // getSnapshotNames();

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
                if (values.remember) {
                    // this.props.dataStore.set('key', values.key);
                }
            }
        });
    };

    render() {
        const { getFieldDecorator } = this.props.form;
        console.log(this.props.dataStore);
        console.log(this.props.dataStore.get('key'));
        return (
            <div className="form">
                <Form layout={'inline'} onSubmit={this.handleSubmit}>
                    <Row>
                        <Form.Item>
                            {getFieldDecorator('snapshot', {})(
                                <Select style={{ width: 200 }}>
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
            </div>
        );
    }
}

export default Form.create<IProps>({})(Info);

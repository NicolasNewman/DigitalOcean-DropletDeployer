import * as React from 'react';
import { Component } from 'react';

type IProps = {
    increment: () => void;
    incrementIfOdd: () => void;
    incrementAsync: () => void;
    decrement: () => void;
    counter: number;
};

export default class Home extends Component<IProps> {
    props: IProps;

    render() {
        return (
            <div data-tid="container">
                <h2>Home</h2>
            </div>
        );
    }
}

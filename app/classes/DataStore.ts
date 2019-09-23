import * as Store from 'electron-store';

/**
 * Wrapper for electron-store\'s Store object
 */
export default class DataStore {
    private store;
    private schema;

    /**
     * Creates the data schema and initializes it
     * @constructor
     */
    constructor() {
        this.schema = {
            key: {
                type: 'string',
                description: 'The API key used to authenticate with Digital Ocean'
            },
            name: {
                type: 'string',
                description: 'The name of the droplet that is created'
            },
            snapshot: {
                type: 'string',
                description: 'The backup of the server to load from'
            },
            region: {
                type: 'string',
                description: 'The region that the server is located in'
            },
            id: {
                type: 'number',
                description: 'The id of the droplet that was created'
            }
        };
        this.store = new Store({ schema: this.schema });
    }

    /**
     * Updates the value of the given key in the Store
     * @param {string} key - the key the data is stored under
     * @param {*} value - the new value for the data
     */
    set = (key: string, value: any): void => {
        if (this.schema[key]) {
            console.log('contains key ', key);
            this.store.set(key, value);
        }
    };

    /**
     * @param {string} key - the key the data is stored under
     * @returns {*} the information stored at the given key
     */
    get = (key: string): any => {
        return this.schema[key] ? this.store.get(key) : undefined;
    };
}

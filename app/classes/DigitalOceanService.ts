import axios, { AxiosInstance } from 'axios';
import DataStore from './DataStore';

interface IDefaults {
    downscaled: string;
    upscaled: string;
    targetSshKey: string;
    name: string;
    dropletId: string;
}

export default class DigitalOceanService {
    private client: AxiosInstance;
    private store: DataStore = new DataStore();

    private defaults: IDefaults = {
        downscaled: 's-1vcpu-3gb',
        upscaled: 'c-8',
        targetSshKey: 'Windows Key',
        name: 'droplet-server',
        dropletId: ''
    };

    getDefaults(): IDefaults {
        return this.defaults;
    }

    storeDefaults(): void {
        this.store.set('dropletId', '' + this.defaults.dropletId);
    }

    repopulateDefaults(): void {
        this.defaults.dropletId = '' + this.store.get('dropletId');
    }

    async authenticate(key: string) {
        this.client = axios.create({
            baseURL: 'https://api.digitalocean.com/v2',
            // timeout: 1000,
            headers: {
                Authorization: `Bearer ${key}`
            }
        });
        return await this.verifyKey();
    }

    /**
     * Verifys if an API key is valid by making a request to /account
     */
    async verifyKey() {
        try {
            await this.client.get('/account', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return true;
        } catch (err) {
            return false;
        }
    }

    async getSSHKeys() {
        const res = await this.client.get('/account/keys', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const keys = res.data.ssh_keys;
        console.log(keys);
        let keyObj = {};
        keys.forEach(el => {
            keyObj[el.name] = el.id;
        });
        return keyObj;
    }

    async doesDropletExist() {
        try {
            const res = await this.client.get('/droplets', {
                headers: {
                    'Contnet-Type': 'application/json'
                }
            });
            console.log(res);
            let flag = false;
            res.data.droplets.forEach((droplet, i) => {
                if (droplet.name === this.defaults.name) {
                    flag = true;
                    this.defaults.dropletId = `${res.data.droplets[i].id}`;
                }
            });
            return flag;
        } catch (err) {
            console.log(err.response);
            return false;
        }
    }

    async getDropletStatus(id: string) {
        const res = await this.client.get(`/droplets/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return res.data.droplet.status;
    }

    async upscaleDroplet() {
        try {
            const data = JSON.stringify({
                type: 'resize',
                size: this.defaults.upscaled
            });
            await this.client.post(`/droplets/${this.defaults.dropletId}/actions`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (e) {
            console.log(e.response);
        }
    }

    async downscaleDroplet() {
        try {
            const data = JSON.stringify({
                type: 'resize',
                size: this.defaults.downscaled
            });
            await this.client.post(`/droplets/${this.defaults.dropletId}/actions`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (e) {
            console.log(e.response);
        }
    }

    async shutdownDroplet() {
        try {
            const data = JSON.stringify({
                type: 'shutdown'
            });
            await this.client.post(`/droplets/${this.defaults.dropletId}/actions`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (e) {
            console.log(e.response);
        }
    }

    async turnOnDroplet() {
        try {
            const data = JSON.stringify({
                type: 'turn_on'
            });
            await this.client.post(`/droplets/${this.defaults.dropletId}/actions`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (e) {
            console.log(e.response);
        }
    }

    async getActionStatus(id: string) {
        try {
            const res = await this.client.get(`/droplets/${id}/actions`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log(res);
            return res.data.actions[0].status;
        } catch (err) {
            console.log(err.response);
        }
    }
}

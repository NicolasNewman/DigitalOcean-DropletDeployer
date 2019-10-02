import axios, { AxiosInstance } from 'axios';
import DataStore from './DataStore';

interface IDefaults {
    size: string;
    targetSshKey: string;
    image: string;
    region: string;
    name: string;
    snapshotName: string;
    domain: string;
    aRecordId: string;
    snapshotId: string;
    dropletId: string;
}

export default class DigitalOceanService {
    private client: AxiosInstance;
    private store: DataStore = new DataStore();

    private defaults: IDefaults = {
        size: 'm-2vcpu-16gb',
        // size: 's-1vcpu-1gb',
        targetSshKey: 'Windows Key',
        image: 'ubuntu-18-04-x64',
        region: 'nyc3',
        name: 'mc-server',
        snapshotName: 'update-forge',
        domain: 'quantumpie.net',
        aRecordId: '79536515',
        snapshotId: '',
        dropletId: ''
    };

    getDefaults(): IDefaults {
        return this.defaults;
    }

    storeDefaults(): void {
        this.store.set('dropletId', this.defaults.dropletId);
        this.store.set('snapshotId', this.defaults.snapshotId);
    }

    repopulateDefaults(): void {
        this.defaults.dropletId = this.store.get('dropletId');
        this.defaults.snapshotId = this.store.get('snapshotId');
    }

    async authenticate(key: string, snapshotName: string) {
        this.defaults.snapshotName = snapshotName;

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

    async getSnapshots() {
        const res = await this.client.get('/snapshots', {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return res.data.snapshots;
    }

    private async getSnapshotIdFromName() {
        const res = await this.client.get('/snapshots', {
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                name: this.defaults.snapshotName
            }
        });
        return res.data.snapshots[0].id;
    }

    async deleteDuplicateSnapshots() {
        const res = await this.client.get('/snapshots', {
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                name: this.defaults.snapshotName
            }
        });
        const snapshots = res.data.snapshots;
        const dates = [];

        // Push the date of each snapshot to dates array
        snapshots.forEach((snap, i) => {
            dates.push(new Date(snap.created_at));
        });

        if (dates.length > 1) {
            // Find the most recent date
            let maxIndx = 0;
            let maxDate = dates[0];
            dates.forEach((date, i) => {
                if (date > maxDate) {
                    maxIndx = i;
                    maxDate = dates[i];
                }
            });
            console.log(`Keep date ${maxDate} at index ${maxIndx}`);
            snapshots.forEach(async (snap, i) => {
                if (i !== maxIndx) {
                    console.log('Deleting:');
                    console.log(snap);
                    const status = await this.client.delete(`/snapshots/${snap.id}`, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    console.log(status);
                } else {
                    console.log('Saving: ');
                    console.log(snap);
                }
            });
        }
    }

    async getRegions() {
        const res = await this.client.get('/regions', {
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                sizes: this.defaults.size,
                available: true
            }
        });
        return res.data.regions;
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

    async createDroplet() {
        const sshKeys = await this.getSSHKeys();
        const targetKeyId = sshKeys[this.defaults.targetSshKey];
        const snapshotId = await this.getSnapshotIdFromName();
        this.defaults.snapshotId = snapshotId;

        if (this.defaults.snapshotId !== '') {
            try {
                const data = JSON.stringify({
                    name: this.defaults.name,
                    // region,
                    region: this.defaults.region,
                    // image: this.defaults.image,
                    image: this.defaults.snapshotId,
                    size: this.defaults.size,
                    ssh_keys: [targetKeyId],
                    monitoring: true,
                    backups: false
                });
                const res = await this.client.post('/droplets', data, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log(res);
                const dropletId = res.data.droplet.id;
                this.defaults.dropletId = dropletId;
                return dropletId;
            } catch (e) {
                console.log(e.response);
            }
        } else {
            // TODO throw error
        }
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

    async getDropletIp(id: string) {
        const res = await this.client.get(`/droplets/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(res);
        return res.data.droplet.networks.v4[0].ip_address;
    }

    async shutdownDroplet() {
        if (this.defaults.snapshotId !== '') {
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
        } else {
            // TODO throw error
        }
    }

    async snapshotDroplet() {
        if (this.defaults.snapshotId !== '') {
            try {
                const data = JSON.stringify({
                    type: 'snapshot',
                    name: this.defaults.snapshotName
                });
                const res = await this.client.post(`/droplets/${this.defaults.dropletId}/actions`, data, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log('snapshoted');
                console.log(res);
            } catch (e) {
                console.log(e.response);
            }
        } else {
            // TODO throw error
        }
    }

    async destroyDroplet() {
        if (this.defaults.snapshotId !== '') {
            await this.client.delete(`/droplets/${this.defaults.dropletId}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    }

    async updateRecord(ip: string) {
        try {
            const data = JSON.stringify({
                type: 'A',
                name: `mc`,
                data: ip
            });
            await this.client.put(`/domains/${this.defaults.domain}/records/${this.defaults.aRecordId}`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (err) {
            console.log(err.response);
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

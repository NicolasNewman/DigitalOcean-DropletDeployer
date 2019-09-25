import axios, { AxiosInstance } from 'axios';

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

    private defaults: IDefaults = {
        size: 'm-2vcpu-16gb',
        // size: 's-1vcpu-1gb',
        targetSshKey: 'Windows Key',
        image: 'ubuntu-18-04-x64',
        region: 'nyc3',
        name: 'mc-server',
        snapshotName: 'mc-server-created',
        domain: 'quantumpie.net',
        aRecordId: '79536515',
        snapshotId: '',
        dropletId: ''
    };

    getDefaults(): IDefaults {
        return this.defaults;
    }

    async authenticate(key: String) {
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
            console.log('action status ' + res);
            return res.data.actions.status;
        } catch (err) {
            console.log(err.response);
        }
    }
}

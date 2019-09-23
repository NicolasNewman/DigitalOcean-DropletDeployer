import axios, { AxiosInstance } from 'axios';

export default class DigitalOceanService {
    private client: AxiosInstance;

    private defaults = {
        // size: 'm-2vcpu-16gb',
        size: 's-1vcpu-1gb',
        targetSshKey: 'Windows Key',
        image: 'ubuntu-18-04-x64'
    };

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

    async createDroplet(name: String, region: String, snapshot: String) {
        const sshKeys = await this.getSSHKeys();
        const targetKeyId = sshKeys[this.defaults.targetSshKey];

        console.log(`name: ${name}`);
        console.log(`region: ${region}`);
        console.log(`image: ${snapshot}`);
        console.log(`size: ${this.defaults.size}`);
        try {
            const data = JSON.stringify({
                name,
                region,
                image: this.defaults.image,
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
            return res.data.droplet.id;
        } catch (e) {
            console.log(e.response);
        }
    }

    async getDropletStatus(id: string) {
        const res = await this.client.post(`/droplets/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return res.data.droplet.status;
    }
}

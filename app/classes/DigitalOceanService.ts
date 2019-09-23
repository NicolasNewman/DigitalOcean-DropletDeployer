import axios, { AxiosInstance } from 'axios';

export default class DigitalOceanService {
    private client: AxiosInstance;

    private defaults = {
        size: 's-6vcpu-16gb'
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
}

import { promises as fs } from 'fs';
import path from 'path';

class Storage {
    private storagePath: string;

    constructor(storageFileName: string) {
        this.storagePath = path.join(__dirname, storageFileName);
        this.initStorage();
    }

    private async initStorage() {
        try {
            await fs.access(this.storagePath);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(this.storagePath, '{}', 'utf-8');  // Create a new file if it doesn't exist
            } else {
                throw error;
            } 
        }
    }

    async save(data: object): Promise<void> {
        try {
            const dataString = JSON.stringify(data, null, 2);
            await fs.writeFile(this.storagePath, dataString, 'utf-8');
        } catch (error) {
            console.error('Failed to save data', error);
        }
    }

    async load(): Promise<any> {
        try {
            const dataString = await fs.readFile(this.storagePath, 'utf-8');
            return JSON.parse(dataString);
        } catch (error) {
            console.error('Failed to load data', error);
            return {};  // Return an empty object if there's an error
        }
    }
}

export default Storage;

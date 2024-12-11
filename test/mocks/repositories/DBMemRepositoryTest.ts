/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from 'inversify';
import { IDatabase, IMain } from 'pg-promise';

@injectable()
export class DBMemRepositoryTest {
    private db: IDatabase<IMain>;

    constructor(db: IDatabase<IMain>) {
        this.db = db;
    }

    async executeQuery(query: string): Promise<any> {
        try {
            const result = await this.db.query(query);
            return result;
        } catch (error: any) {
            throw new Error(`Failed to execute query: ${error.message}`);
        }
    }
}

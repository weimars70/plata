import 'reflect-metadata';
import dotenv from 'dotenv';
import 'module-alias/register';
dotenv.config();
import { application } from './Application';
import { createDependencyContainer } from '@configuration';

const start = async () => {
    const port = process.env.PORT || 8080;
    try {
        const server = await application.listen(port, '0.0.0.0');
        application.swagger();
        console.log(application.printRoutes());
        createDependencyContainer();
        console.log(`Application running on ${server}`);
    } catch (error) {
        console.error(error);
        await application.close();
    }
};
start();

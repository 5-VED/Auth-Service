import { IRoutes } from '@/Common/interfaces/IRoutes';
// import { RoutesConfig } from '@common/RoutesConfig';

import  logger  from '../Config/Logger';
import { Application, Router } from 'express';

import UserRoutes from './User.routes';
import RoleRoutes from './Role.routes';


interface RouteLayer {
    path: string;
    methods: { [key: string]: boolean };
}

interface Layer {
    route?: RouteLayer;
    regexp: RegExp;
    name?: string;
    handle: any;
}

export class IndexRoute implements IRoutes {
    public router = Router({ mergeParams: true });
    public path = '/api/v1'; 
    constructor(app: Application) {
        this.initializeRoutes();
        this.logRouteInitialization();
    }

    private initializeRoutes(): void {
        // API Documentation
        this.router.get('/', (_, res) => {
            res.json({
                message: 'API is running',
                version: '1.0.0',
                documentation: '/api-docs'
            });
        });
 
        // Mount feature routes
        this.router.use('/user', UserRoutes); // Using plural form for REST conventions
        this.router.use('/roles', RoleRoutes);
    }

    private logRouteInitialization(): void {
        const routes = this.listRoutes(this.router);
        logger.info(`API Routes initialized at ${this.path}`);
        routes.forEach(route => {
            logger.info(`Route registered: [${route.method}] ${this.path}${route.path}`);
        });
    }

    private listRoutes(router: Router): Array<{ method: string; path: string }> {
        const routes: Array<{ method: string; path: string }> = [];
        const stack = (router as any).stack as Layer[];
        
        stack.forEach(layer => {
            if (layer.route) {
                const route = layer.route;
                const methods = Object.keys(route.methods)
                    .filter(method => route.methods[method])
                    .map(method => method.toUpperCase());
                
                methods.forEach(method => {
                    routes.push({
                        method,
                        path: route.path
                    });
                });
            } else if (layer.name === 'router' && layer.handle?.stack) {
                // Handle nested routers
                const match = layer.regexp.toString().match(/^\/\^((?:\\\/[^\/]*)*)/);
                if (match) {
                    this.listRoutes(layer.handle).forEach(route => {
                        routes.push({
                            method: route.method,
                            path: route.path
                        });
                    });
                }
            }
        });

        return routes;
    }
}

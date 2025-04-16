/**
 * @description Represents dependencies controller.
 */

import { IPath } from './Resolvers';
// @ts-ignore TODO: This module can only be referenced with ECMAScript imports/exports
//             by turning on the 'esModuleInterop' flag and referencing its default export.
import { Deferred } from 'Types/deferred';
// @ts-ignore TODO: This module can only be referenced with ECMAScript imports/exports
//             by turning on the 'esModuleInterop' flag and referencing its default export.
import * as ParallelDeferred from 'Types/ParallelDeferred';

/**
 * Interface for dependencies controller.
 */
export interface IDependenciesController {
    /**
     * Register dependency.
     * @param path {IPath} Dependency path.
     */
    registerDependency(path: IPath): void;

    /**
     * Request all dependencies.
     */
    requestDependencies(): ParallelDeferred<unknown>;
}

/**
 * Implements dependencies controller interface.
 */
class DependenciesController implements IDependenciesController {
    /**
     * Flag - load all dependencies (for JIT only)
     */
    private readonly loadDependencies: boolean;

    /**
     * Dependencies collection.
     */
    private readonly dependencies: Map<string, IPath>;

    /**
     * Dependency requests collection.
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    private readonly dependencyRequests: Deferred<unknown>[];

    /**
     * Initialize new instance of controller.
     * @param loadDependencies {boolean} Load requested dependencies.
     */
    constructor(loadDependencies: boolean) {
        this.loadDependencies = loadDependencies;
        this.dependencies = new Map();
        this.dependencyRequests = [];
    }

    /**
     * Register dependency.
     * @param path {IPath} Dependency path.
     */
    registerDependency(path: IPath): void {
        const fullPath = path.getFullPhysicalPath();
        if (!this.dependencies.has(fullPath)) {
            this.dependencies.set(fullPath, path);
        }
        if (!this.loadDependencies || requirejs.defined(fullPath)) {
            return;
        }
        const deferred = new Deferred();
        this.dependencyRequests.push(deferred);
        if (require.defined(fullPath)) {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            deferred.callback(require(fullPath));
            return;
        }
        require([fullPath], (module) => {
            if (module || module === null) {
                deferred.callback(module);
                return;
            }
            deferred.errback(new Error(`Не удалось загрузить файл "${fullPath}"`));
        }, (error) => {
            deferred.errback(error);
        });
    }

    /**
     * Request all dependencies.
     */
    requestDependencies(): ParallelDeferred<unknown> {
        const parallelDeferred = new ParallelDeferred();
        if (!this.loadDependencies || this.dependencyRequests.length === 0) {
            return parallelDeferred.done().getResult();
        }
        this.dependencyRequests.forEach((deferred) => {
            parallelDeferred.push(deferred);
        });
        return parallelDeferred.done().getResult();
    }
}

/**
 * Create dependencies controller.
 * @param loadDependencies {boolean} Load requested dependencies.
 */
export default function createController(loadDependencies: boolean): IDependenciesController {
    return new DependenciesController(loadDependencies);
}

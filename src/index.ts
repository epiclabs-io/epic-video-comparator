import { Comparator } from './Comparator';
import { IComparatorConfig } from './models';

export function newComparator(config: IComparatorConfig, container: HTMLDivElement) {
    return new Comparator(config, container);
}

export * from './Comparator';
export * from './models';

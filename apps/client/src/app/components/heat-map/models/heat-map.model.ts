import { IRecord } from '../../../models';

export interface IHeatMap {
	key: Date;
	value: IRecord[][];
}

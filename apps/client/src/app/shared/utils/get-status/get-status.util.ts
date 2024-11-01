import { differenceInHours } from 'date-fns';

export function getStatus(leaving: Date, arrival: Date): 'error' | 'warning' | null {
	const diff = differenceInHours(leaving, arrival);

	if (diff < 0) return 'error';
	else if (diff > 120) return 'warning';
	else return null;
}

export interface IRecord {
	uuid: string;
	id: string;
	arrival: Date;
	leaving: Date;
	from: string;
	to: string;
	specialty: Specialty;
	status: 'error' | 'warning' | null;
}

export const SPECIALTIES = [
	'internal',
	'su',
	'internalKV',
	'vascular',
	'general',
	'trauma',
	'internalCoro',
	'internalPVI',
	'suLyse',
	'ent',
	'neuro',
	'psych',
	'internalPM',
	'gyn',
	'interalZVK',
	'interalEPU',
	'interalPFO',
	'suNotcoro',
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

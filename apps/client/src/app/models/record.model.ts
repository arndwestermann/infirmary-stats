export interface IRecord {
	uuid: string;
	id: string;
	arrival: Date;
	leaving: Date;
	from: string;
	to: string;
	specialty: Specialty;
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
	'HNO',
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
// TODO: Ask for duplicate internalPFO

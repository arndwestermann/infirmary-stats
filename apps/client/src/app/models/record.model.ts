export interface IRecord {
	id: string;
	arrival: Date;
	leaving: Date;
	from: string;
	to: string;
	specialty: Specialty;
}

export type Specialty =
	| 'internal'
	| 'su'
	| 'internalKV'
	| 'vascular'
	| 'general'
	| 'trauma'
	| 'internalCoro'
	| 'internalPVI'
	| 'suLyse'
	| 'HNO'
	| 'neuro'
	| 'psych'
	| 'internalPM'
	| 'gyn'
	| 'interalZVK'
	| 'interalEPU'
	| 'interalPFO'
	| 'suNotcoro';
// TODO: Ask for duplicate internalPFO

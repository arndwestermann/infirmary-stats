import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'getCellBackgroundColor',
	standalone: true,
})
export class GetCellBackgroundColorPipe implements PipeTransform {
	transform(length: number): string {
		if (length >= 17) return 'bg-black text-white';
		else if (length >= 15) return 'bg-red-500';
		else if (length >= 13) return 'bg-yellow-500';
		else return 'bg-green-500';
	}
}

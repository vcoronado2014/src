import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'celsius'
})
export class CelsiusPipe implements PipeTransform {
	transform(value: any): string {
		
		value = ((value-32)*5/9).toFixed(0);

		return value + " °c" ;
	}
}
import { Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as moment from 'moment';

@Pipe({ name: 'dateFormat' })
export class MomentPipe implements PipeTransform {
    transform(value: Date | moment.Moment, dateFormat: string): any {
        return moment(value).format(dateFormat);
    }
}
// truncate-words.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateWords',
  standalone: true
})
export class TruncateWordsPipe implements PipeTransform {
  transform(value: string, limit: number = 4): string {
    const words = value.split(' ');
    return words.length > limit 
      ? words.slice(0, limit).join(' ') + '...' 
      : value;
  }
}
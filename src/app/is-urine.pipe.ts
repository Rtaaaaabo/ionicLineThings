import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isUrineName'
})
export class IsUrinePipe implements PipeTransform {

  transform(value: any, ...args: any[]): string {
    alert(value);
    return 'test';
  }

}

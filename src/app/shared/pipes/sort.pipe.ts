import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: "sortBy"})

export class SortPipe implements PipeTransform{

  transform(input: any, key: string) {
    if (!input) return [];

    return input.sort(function(itemA, itemB) {
      if (itemA[key] < itemB[key]) {
        return 1;
      } else if(itemA[key] > itemB[key]) {
        return -1;
      } else {
        return 0;
      }
    });
  }

}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginadorService {

  
  
 data = [];
 num;
 index;
 len;
 tpages;
 constructor(){}
 init (data, perPage = 12) {
  if (!data) throw new Error('I need an Array to work dude!')
  if (!(data instanceof Array)) throw new Error('Invalid data type. Expected an Array')
  // console.log(data);
  this.data = data
  this.num = perPage
  this.tpages = Math.round(this.data.length/this.num);
  this.index = 0
  this.len = this.data.length
}



page (direction) {
  if(this.data.length <= 0){return []}
  this.index = this.index + direction
  let res = []
  for (let i = 0; i < this.num; i++) {
    let aux = this.index + i;
    aux = this.normalize(aux)
    res.push(this.data[aux])
  }
  return res;
}



normalize (i) {
  switch (Math.sign(i % this.len)) {
    case  1:
      return i % this.len
      break
    case -1:
      return this.len + i % this.len
      break
    default:
      return 0
      break
  }
}


initialize () { return this.page(0) }  // Returns page 0
next () { return this.page(1) }
prev () { return this.page(-1) }
goTo (index) { return this.page(this.normalize(index - this.index)) }  // Returns corresponding index page

}

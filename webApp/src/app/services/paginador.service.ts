import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PaginadorService {

  
  
 data = [];
 num = 0;
 index = 0;
 len = 0;
 tpages = 0;
 begin = 0;
 end = 0;
  _totalItems: number;
  _page: number;
  _previousPage: number;
  _showPagination: boolean;
 constructor(){
 }
 init (data, perPage = 12) {
  if (!data) throw new Error('I need an Array to work dude!')
  if (!(data instanceof Array)) throw new Error('Invalid data type. Expected an Array')
  // console.log(data);
  this.data = data
  this.num = perPage
  this.index = 0
  this.begin = this.index;
  this.end = this.data.length;
  this._page = 1;
	this._previousPage = 1;
  this.len = this.data.length
}

numPages(){
  return Math.ceil(this.len/this.num);
}

ver(){
  this.begin = ((this._page - 1) * this.num);
  // this.index = begin;
  this.end = this.begin+this.num > this.len? this.len:this.begin+this.num;
  return this.data.slice(this.begin, this.end);
  
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


initialize () { return this.ver() }  // Returns page 0
next () {
  window.scrollTo(0,0); 
  this._page < this.numPages()?  this._page += 1:1;
  return this.ver() }
prev () {window.scrollTo(0,0); 
  this._page > 1?  this._page -= 1:1; 
  return this.ver() 
}
goTo (index) { return this.page(this.normalize(index - this.index)) }  // Returns corresponding index page

}

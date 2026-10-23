export class DrawingHistory{
 constructor(initial,limit=100){this.limit=limit;this.reset(initial)}
 reset(value){this.states=[JSON.stringify(value)];this.index=0}
 push(value){const next=JSON.stringify(value);if(next===this.states[this.index])return false;this.states.splice(this.index+1);this.states.push(next);if(this.states.length>this.limit)this.states.shift();this.index=this.states.length-1;return true}
 get canUndo(){return this.index>0}
 get canRedo(){return this.index<this.states.length-1}
 undo(){if(this.canUndo)this.index--;return JSON.parse(this.states[this.index])}
 redo(){if(this.canRedo)this.index++;return JSON.parse(this.states[this.index])}
}

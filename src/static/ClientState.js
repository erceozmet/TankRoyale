export class ClientState {
	constructor() {
		this.screen_dims = {width: 640, height: 360};
		this.map_dims =  {width: 1000, height: 1000};
		this.map_view_ratio = {width: 10, height: 10};
		this.view_dims = {width : this.map_dims.width  / this.map_view_ratio.width, 
						  height: this.map_dims.height / this.map_view_ratio.height};
  	}

	add_gameobj(gameobj, key) {
		let sprite = PIXI.Sprite.from(gameobj.imagePath); 
		let index = this.get_index_from_key(key);

		let starting_row = index.row - gameobj.height + 1;
		sprite.y = this.screen_dims.height / this.view_dims.height * (starting_row);
		sprite.x = this.screen_dims.width  / this.view_dims.width  * index.col;
		sprite.height = this.screen_dims.height / this.view_dims.height * gameobj.height;
		sprite.width = this.screen_dims.width / this.view_dims.width * gameobj.width;
		return sprite;
	}

	get_index_from_key(key) {
		let col = Math.floor(key / this.map_dims.height);
		let row = key % this.map_dims.height;
		return {row: row, col: col}
	}

	render_bars() {
		for (let i = 1; i < this.view_dims.width; i++) {
			let g = document.createElement('div');
			g.setAttribute("id", "vbar");
			let left = this.screen_dims.width / this.view_dims.width * i;
			g.style.left = left.toString() + "px";
			g.style.top = "0px";
			document.getElementById("gamebox").appendChild(g);  
		}
		for (let j = 1; j < this.view_dims.height; j++) {
			let g = document.createElement('div');
			g.setAttribute("id", "hbar");
			let top = this.screen_dims.height / this.view_dims.height * j;
			g.style.top = top.toString() + "px";
			g.style.left = "0px";
			document.getElementById("gamebox").appendChild(g);  
			}
		}
	}
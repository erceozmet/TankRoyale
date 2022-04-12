export class ClientState {
	constructor(screen_dims, map_dims, map_view_ratio) {
		this.screen_dims = screen_dims;
		this.map_dims =  map_dims;
		this.change_map_view_ratio(map_view_ratio);
		
		this.view_pos = null;
		this.tank_id = null;
		this.tank_pos = null;
		this.tank_dims = {width: 5, height: 5}; //TODO

		this.objects = new Array(this.map_dims.height);
		for (var i = 0; i < this.map_dims.height; i++) {
		  this.objects[i] = new Array(this.map_dims.width);
		}
  	}

	change_map_view_ratio(new_ratio) {
		this.map_view_ratio = new_ratio;

		// tiles per view
		this.view_dims = {width : this.map_dims.width  / this.map_view_ratio.width, 
						  height: this.map_dims.height / this.map_view_ratio.height};


		// size of 1 tile in the screen
		this.tile_size = {width: this.screen_dims.width / this.view_dims.width,
						  height: this.screen_dims.height / this.view_dims.height};
		
		
		
	}
	set_sprite_coordinates(sprite, index) {
		sprite.y = this.tile_size.height * (index.row - this.view_pos.row);
		sprite.x = this.tile_size.width  * (index.col - this.view_pos.col);
		
	}

	set_tank_id(id, pos) {
		this.tank_id = id;
		this.change_tank_pos({row: pos[1], col: pos[0]});

	}
	change_tank_pos(new_pos) {
		this.tank_pos = new_pos;
		let old_view_pos = this.view_pos;
		this.view_pos = {row: this.tank_pos.row + (this.tank_dims.height / 2) - (this.view_dims.width / 2),
						 col: this.tank_pos.col + (this.tank_dims.width / 2) - (this.view_dims.height / 2)};

		
		this.wrap_view_pos();
		console.log("view_pos", this.view_pos);
		this.render_view();
		this.unrender_view(old_view_pos, this.view_pos);
		
	}

	wrap_view_pos() {
		this.view_pos.row = Math.floor(this.view_pos.row);
		this.view_pos.col = Math.floor(this.view_pos.col);

		if (this.view_pos.row < 0) this.view_pos.row = 0;
		if (this.view_pos.col < 0) this.view_pos.col = 0;

		if (this.view_pos.col + this.view_dims.width > this.map_dims.width) this.view_pos.col = this.map_dims.width - this.view_dims.width;
		if (this.view_pos.row + this.view_dims.height > this.map_dims.height) this.view_pos.row = this.map_dims.height - this.view_dims.height;
		
	}

	// invariant: view_pos + view_dims is never bigger than map dims
	render_view() {
		for (let row = 0; row < this.view_dims.height; row++) {
			let row_index = this.view_pos.row + row;
			for (let col = 0; col < this.view_dims.width; col++) {
				let col_index = this.view_pos.col + col;
				let sprite = this.objects[row_index][col_index];
				
				if (sprite == null) continue;
				sprite.visible = true;
				
				sprite.y = this.tile_size.height * row;
				sprite.x = this.tile_size.width * col; 
				
			}
		}
	}

	// make all objects that were inside the view hidden 
	unrender_view(old_view_pos, new_view_pos) {
		if (old_view_pos == null) return;

		let row_diff = old_view_pos.row - new_view_pos.row;
		for (let row = 0; row < Math.abs(row_diff); row++) {
			let row_index = row_diff > 0 ?  old_view_pos.row + this.view_dims.width - row
										 :  old_view_pos.row + row;
		
			for (let col = 0; col < this.view_dims.width; col++) {
				let col_index = old_view_pos.col + col;
				let sprite = this.objects[row_index][col_index];
				if (sprite == null) continue;	
				sprite.visible = false;	
			}
		}

		let col_diff = old_view_pos.col - new_view_pos.col;
		for (let col = 0; col < Math.abs(col_diff); col++) {
			let col_index = col_diff > 0 ?  old_view_pos.col + this.view_dims.width - col
										 :  old_view_pos.col + col;
		
			for (let row = 0; row < this.view_dims.width; row++) {
				let row_index = old_view_pos.row + row;
				let sprite = this.objects[row_index][col_index];
				if (sprite == null) continue;	
				sprite.visible = false;	
			}
		}
	}

	is_in_view(gameobj, index) {
		if (this.view_pos == null) return false;
		return (index.col + gameobj.width  >= this.view_pos.col   &&
				index.row + gameobj.height >= this.view_pos.row   &&  
				index.col <= this.view_pos.col + this.view_dims.width  &&
				index.row <= this.view_pos.row + this.view_dims.height);
	}

	add_gameobj(gameobj, index) {
		let sprite = PIXI.Sprite.from(gameobj.imagePath);
	
		// set sprite attibutes
		
		sprite.height = this.tile_size.height * gameobj.height;
		sprite.width = this.tile_size.width * gameobj.width;
		this.objects[index.row][index.col] = sprite;

		if (gameobj.id == this.tank_id) {
			this.set_sprite_coordinates(sprite, index);
			this.change_tank_pos(index);
			this.render_view();
		}
		
		else if (this.is_in_view(gameobj, index)) {
			this.set_sprite_coordinates(sprite, index)
		} else {
			sprite.visible = false;
		}
		
		return sprite;
	}

	remove_gameobj(gameobj, index) {

		// this.ob
		// let sprite = this.objects.get(gameobj.id);
		let sprite = this.objects[index.row][index.col];
		// sprite.visible = false;
		// this.objects.delete(gameobj.id);
		this.objects[index.row][index.col] = null;
		// console.log(this.objects);
		return sprite;
	}

	get_index_from_key(key) {
		let row = Math.floor(key / this.map_dims.width);
		let col = key % this.map_dims.width;
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
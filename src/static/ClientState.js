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
		this.projectiles = new Map();

		for (var i = 0; i < this.map_dims.height; i++) {
		  this.objects[i] = new Array(this.map_dims.width);
		}

		
  	}
	// set_barrel_direction() {

	// }

	// add_projectile(gameobj) {

	// }  
	add_gameobj(gameobj, index) {
		console.log("gameobj type", gameobj.imagePath)
		let sprite = PIXI.Sprite.from(gameobj.imagePath);
	
		// set sprite attibutes
		
		sprite.height = this.tile_size.height * gameobj.height;
		sprite.width = this.tile_size.width * gameobj.width;
		this.objects[index.row][index.col] = sprite;

		if (gameobj.id == this.tank_id) {
			[sprite.x, sprite.y] = this.get_screen_coordinates(index);
			this.change_tank_pos(index);
			this.render_view();
			// let barrel_sprite = PIXI.Sprite.from("images/barrel.png");
			// barrel_sprite.height = this.tile_size.height;
			// barrel_sprite.widht = this.tile_size.width;
			// console.log(sprite.height);
			// sprite.addChild(barrel_sprite);
		}
		
		else if (this.is_in_view(gameobj, index)) {
			[sprite.x, sprite.y] = this.get_screen_coordinates(index)
		} else {
			sprite.visible = false;
		}
		
		return sprite;
	}

	remove_gameobj(gameobj, index) {
		let sprite = this.objects[index.row][index.col];
		this.objects[index.row][index.col] = null;
		return sprite;
	}

	add_projectile(projectile) {
		var projectileMoveInterval = null;
		let sprite = PIXI.Sprite.from(projectile.imagePath);
		sprite.height = this.tile_size.height * projectile.height;
		sprite.width  = this.tile_size.width  * projectile.width;
		
		[sprite.x, sprite.y] = this.get_screen_coordinates({row: projectile.row, col: projectile.col});
		const DELTA_TIME = 50;
		// create interval function
		projectileMoveInterval = setInterval( () => {
			let tile_distance = projectile.speed * (DELTA_TIME / 1000) ;
			sprite.x += (Math.cos(projectile.direction) * tile_distance * this.tile_size.height) ;
			sprite.y += (Math.sin(projectile.direction) * tile_distance * this.tile_size.width);
        }, DELTA_TIME);
		this.projectiles.set(projectile.id, {sprite: sprite, interval: projectileMoveInterval});
		
		return sprite;
	}
	// TODO: play explosion animation in the coordinates of projectile
	remove_projectile(projectile) {
		let {sprite: sprite, interval: interval}  = this.projectiles.get(projectile.id);
		clearInterval(interval);
        this.projectiles.delete(projectile.id);
		
        return sprite;
	}
	

	// assign new map view ration
	change_map_view_ratio(new_ratio) {
		this.map_view_ratio = new_ratio;
		// tiles per view
		this.view_dims = {width: Math.floor(this.map_dims.width  / this.map_view_ratio.width),
						  height:  Math.floor(this.map_dims.height / this.map_view_ratio.width)}; 
						  
		// size of 1 tile in the screen
		this.tile_size = {width: this.screen_dims.width / this.view_dims.width,
						  height: this.screen_dims.height / this.view_dims.height};
		// this.view_dims.height =  Math.floor(this.screen_dims.height / this.tile_size.height);
		 
		console.log("tile_size", this.tile_size);
	}



	// changing client tank pos changes all other sprite positions
	change_tank_pos(new_pos) {
		this.tank_pos = new_pos;
		let old_view_pos = this.view_pos;
		// console.log("tank pos", this.tank_pos)
		// console.log("view dims", this.view_dims)
		this.view_pos = {row: this.tank_pos.row + (this.tank_dims.height / 2) - (this.view_dims.width / 2),
						 col: this.tank_pos.col + (this.tank_dims.width / 2) - (this.view_dims.height / 2)};
		// console.log("old view", old_view_pos)
		// console.log("new view", this.view_pos)
		this.wrap_view_pos();
		this.projectiles.forEach(key => {
			let row = old_view_pos.row - this.view_pos.row
			let col = old_view_pos.col - this.view_pos.col
			key.sprite.x += this.tile_size.width * col;
			key.sprite.y += this.tile_size.height * row;			
		});

		
		  
		this.render_view();
		this.unrender_view(old_view_pos, this.view_pos);
		
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

	// is gameobj in the screen
	is_in_view(gameobj, index) {
		if (this.view_pos == null) return false;
		return (index.col + gameobj.width  >= this.view_pos.col   &&
				index.row + gameobj.height >= this.view_pos.row   &&  
				index.col <= this.view_pos.col + this.view_dims.width  &&
				index.row <= this.view_pos.row + this.view_dims.height);
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
	// return on screen coordinates based on index
	get_screen_coordinates(index) {
		let y = this.tile_size.height * (index.row - this.view_pos.row);
		let x = this.tile_size.width  * (index.col - this.view_pos.col);
		return [x, y];
	}

	// set client tank
	set_tank_id(id, pos) {
		this.tank_id = id;
		this.change_tank_pos({row: pos[1], col: pos[0]});

	}
	wrap_view_pos() {
		this.view_pos.row = Math.floor(this.view_pos.row);
		this.view_pos.col = Math.floor(this.view_pos.col);

		if (this.view_pos.row < 0) this.view_pos.row = 0;
		if (this.view_pos.col < 0) this.view_pos.col = 0;

		if (this.view_pos.col + this.view_dims.width > this.map_dims.width) this.view_pos.col = this.map_dims.width - this.view_dims.width;
		if (this.view_pos.row + this.view_dims.height > this.map_dims.height) this.view_pos.row = this.map_dims.height - this.view_dims.height;	
	}
}
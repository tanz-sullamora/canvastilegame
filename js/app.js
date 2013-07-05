$(function() {
	
	var WIDTH = 20;
	var HEIGHT = 20;

	var canvasElement = $('#cnv'),
		context = canvasElement[0].getContext('2d');

	var levels = [
		{
			title		: 'Level 1',
			rockFactor 	: 20,
			treeFactor 	: 70,
			waterFactor : 10,
			map: [
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground'],
				// ['ground', 'rock', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'tree', 'ground', 'water', 'water', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'tree', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'water', 'water', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'water', 'water', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'tree', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'tree', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'tree', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'bridge', 'bridge', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'tree', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'tree', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground', 'ground', 'tree', 'tree', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground', 'water', 'water', 'ground', 'ground', 'ground', 'ground', 'ground', 'ground'],
				// ['rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock', 'water', 'water', 'rock', 'rock', 'rock', 'rock', 'rock', 'rock'],
			]
		}
	];

	var description = {
		ground: 'земля',
		rock: 'скала',
		tree: 'дерево',
		water: 'вода',
		bridge: 'мост',
		blackhole: 'чёрная дыра',
		pit: 'яма'
	};

	var player = {
		coords: [1, 1],
		items: {},
		selectedItem: null
	};

	var placeholder = {
		show: false,
		coords: [1, 1]
	};

	var images = {};

	function drawLevel() {
		var offset = getOffset();

		for (var i = offset[1]; i < offset[1] + HEIGHT; i++) {
			for (var j = offset[0]; j < offset[0] + WIDTH; j++) {
				if (levels[0].map[i] != undefined && levels[0].map[i][j] != undefined) {
					context.drawImage(getBlockSprite(levels[0].map[i][j]), (j - offset[0]) * 30, (i - offset[1]) * 30);
				}
			}
		}
	}

	function generateMap() {
		function generateBlock(blockX, blockY) {
			/* генерим куски 20х20 */
			var newMap = [];
			for (var i = HEIGHT; i--;) {
				newMap[i] = [];
				for (var j = WIDTH; j--;) {
					newMap[i][j] = 'ground';
				}
			}

			var rockFactor = levels[0].rockFactor;
			var treeFactor = levels[0].treeFactor
			//var makeForest = (Math.floor((Math.random() * 10) + 1) == 5 && treeFactor > 50) ? true : false;
			var makeForest = true; // DEV-mode

			/* кампни */
			for (var i = Math.floor(Math.random() * rockFactor); i--;) {
				newMap[Math.floor(Math.random() * HEIGHT)][Math.floor(Math.random() * WIDTH)] = 'rock';
			}

			/* деревья */
			var treeCount = Math.floor(Math.random() * treeFactor);
			for (var i = treeCount; i > 0; i--) {

				if(makeForest) {
					
					// сажаем одно дерево произвольно 
					var randomX = Math.floor(Math.random() * HEIGHT);
					var randomY = Math.floor(Math.random() * WIDTH);

					// сколько деревьев посадим в группе
					var treeGroupCount = Math.floor(Math.random() * i);

					newMap = drawForest(newMap, treeGroupCount, randomX, randomY);

					i -= treeGroupCount;


				} else {
					newMap[Math.floor(Math.random() * HEIGHT)][Math.floor(Math.random() * WIDTH)] = 'tree';
				}
				
			}

			/* реки */
			var waterSources = [];
			for (var i = WIDTH; i--;) {
				if (levels[0].map[blockY - 1] != undefined && levels[0].map[blockY - 1][blockX + i] != undefined && levels[0].map[blockY - 1][blockX + i] == 'water') {
					newMap[0][i] = 'water';
					waterSources.push([i, 0]);
				}
				if (levels[0].map[blockY + HEIGHT - 1] != undefined && levels[0].map[blockY + HEIGHT - 1][blockX + i] != undefined && levels[0].map[blockY + HEIGHT - 1][blockX + i] == 'water') {
					newMap[HEIGHT - 1][i] = 'water';
					waterSources.push([i, HEIGHT - 1]);
				}
			}

			for (var i = HEIGHT; i--;) {
				if (levels[0].map[blockY + i] != undefined && levels[0].map[blockY + i][blockX - 1] != undefined && levels[0].map[blockY + i][blockX - 1] == 'water') {
					newMap[i][0] = 'water';
					waterSources.push([0, i]);
				}
				if (levels[0].map[blockY + i] != undefined && levels[0].map[blockY + i][blockX + WIDTH - 1] != undefined && levels[0].map[blockY + i][blockX + WIDTH - 1] == 'water') {
					newMap[i][WIDTH - 1] = 'water';
					waterSources.push([WIDTH - 1, i]);
				}
			}
			if (waterSources.length == 0) {
				for (var i = Math.floor(Math.random() * 5); i--;) {
					var x = Math.floor(Math.random() * WIDTH),
						y = Math.floor(Math.random() * HEIGHT);

					newMap[y][x] = 'water';
					waterSources.push([x, y]);
				}
			}

			newMap = drawRivers(newMap, waterSources);

			return newMap;
		}

		function drawForest(map, count, startX, startY) {

			for(var i = count; i > 0; i--) {
				var direction = Math.round(Math.random() * 4),
					x = startX,
					y = startY;

				switch (direction) {
					case 0: 
						if (map[y - 1] != undefined) {
							map[y - 1][x] = 'tree';	
							startX = x;
							startY = y - 1;		
						} else {
							i++;
						}
					break;
					case 1: 
						if (map[y][x + 1] != undefined) {
							map[y][x + 1] = 'tree';
							startX = x + 1;
							startY = y;	
							
						} else {
							i++;
						}
					break;
					case 2: 
						if (map[y + 1] != undefined) {
							map[y + 1][x] = 'tree';
							startX = x;
							startY = y + 1;	
							
						} else {
							i++;
						}
					break;
					case 3: 
						if (map[y][x - 1] != undefined) {
							map[y][x - 1] = 'tree';
							startX = x - 1;
							startY = y;	
							
						} else {
							i++;
						}
					break;
				}

			}

			return map;

		}

		function drawRivers(map, sources) {
			for (var i = sources.length; i--;) {
				var direction = Math.round(Math.random() * 4),
					x = sources[i][0],
					y = sources[i][1];

				switch (direction) {
					case 0: 
						if (map[y - 1] != undefined) {
							map[y - 1][x] = 'water';
							sources[i] = [x, y - 1];
						} else {
							sources.splice(i, 1);
						}
					break;
					case 1: 
						if (map[y][x + 1] != undefined) {
							map[y][x + 1] = 'water';
							sources[i] = [x + 1, y];
						} else {
							sources.splice(i, 1);
						}
					break;
					case 2: 
						if (map[y + 1] != undefined) {
							map[y + 1][x] = 'water';
							sources[i] = [x, y + 1];
						} else {
							sources.splice(i, 1);
						}
					break;
					case 3: 
						if (map[y][x - 1] != undefined) {
							map[y][x - 1] = 'water';
							sources[i] = [x - 1, y];
						} else {
							sources.splice(i, 1);
						}
					break;
				}
			}

			if (sources.length > 0) {
				return drawRivers(map, sources);
			} 
			return map;
			
		}

		function addBlock(blockX, blockY) {
			var newMap = generateBlock(blockX * WIDTH, blockY * HEIGHT);
			for (var i = HEIGHT; i--;) {
				levels[0].map[blockY * HEIGHT + i].splice.apply(levels[0].map[blockY * HEIGHT + i], [blockX * WIDTH + i, WIDTH].concat(newMap[i]));
			}
		}

		var blockX = Math.round(player.coords[0] / WIDTH),
			blockY = Math.round(player.coords[1] / HEIGHT);

		if (levels[0].map[blockY * HEIGHT] == undefined) {
			for (var i = HEIGHT; i--;) {
				levels[0].map[blockY * HEIGHT + i] = [];
			}
		}

		if (levels[0].map[blockY * HEIGHT][blockX * WIDTH] == undefined) {
			addBlock(blockX, blockY);
		}
		if (levels[0].map[(blockY - 1) * HEIGHT] != undefined && levels[0].map[(blockY - 1) * HEIGHT][blockX * WIDTH] == undefined) {
			addBlock(blockX, blockY - 1);
		}
	}

	function getBlockSprite(blockType) {
		return images[blockType];
	}

	function getOffset() {
		return [player.coords[0] < Math.floor(WIDTH / 2) ? 0 : player.coords[0] - Math.floor(WIDTH / 2), player.coords[1] < Math.floor(HEIGHT / 2) ? 0 : player.coords[1] - Math.floor(HEIGHT / 2)];
	}

	function drawPlayer() {
		var offset = getOffset();

		context.font = 'bold 16px sans-serif';
		context.fillStyle = '#000';
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		context.fillText('@', (player.coords[0] - offset[0]) * 30 + 15, (player.coords[1] - offset[1]) * 30 + 15);
	}
	
	function redraw() {
		drawLevel();
		drawPlayer();
		showPlaceholder();
		drawStatusbar();
	}

	function canPass(blockX, blockY) {
		var pass = {'ground': true, 'bridge': true};

		if (levels[0].map[blockY] != undefined && levels[0].map[blockY][blockX] != undefined) {
			return pass[levels[0].map[blockY][blockX]] != undefined;
		}
		return false;
	}

	function showPlaceholder() {
		if (placeholder.show) {
			var offset = getOffset();

			context.strokeStyle = '1px dashed #ccc';
			context.strokeRect((placeholder.coords[0] - offset[0]) * 30, (placeholder.coords[1] - offset[1]) * 30, 30, 30);
		}
	}

	function environment() {
		var modified = [];

		for (var i = levels[0].map.length; i--;) {
			for (var j = levels[0].map[i].length; j--;) {

				var neighbourhood = [
					((levels[0].map[i - 1] == undefined || levels[0].map[i - 1][j] == undefined) ? null : levels[0].map[i - 1][j]),
					(levels[0].map[i][j + 1] == undefined ? null : levels[0].map[i][j + 1]),
					((levels[0].map[i + 1] == undefined || levels[0].map[i + 1][j] == undefined) ? null : levels[0].map[i + 1][j]),
					(levels[0].map[i][j - 1] == undefined ? null : levels[0].map[i][j - 1])
				];

				switch (levels[0].map[i][j]) {
					// яма будет залита водой, если рядом есть вода
					case 'pit':
						if (
							(neighbourhood[0] == 'water') ||
							(neighbourhood[1] == 'water') ||
							(neighbourhood[2] == 'water') ||
							(neighbourhood[3] == 'water')
						   ) {
						   	modified.push({coords: [j, i], type: 'water'});
						}
					break;

					// одинокий фрагмент моста посреди воды снесёт в случайном направлении
					case 'bridge':
						if (
							(neighbourhood[0] == 'water') &&
							(neighbourhood[1] == 'water') &&
							(neighbourhood[2] == 'water') &&
							(neighbourhood[3] == 'water')
						   ) {

							modified.push({coords: [j, i], type: 'water'});

							var coords = [];
							switch (Math.floor(Math.random() * 4)) {
								case 0:
									coords = [j, i - 1];
								break;
								case 1:
									coords = [j + 1, i];
								break;
								case 2:
									coords = [j, i + 1];
								break;
								case 3:
									coords = [j - 1, i];
								break;
							}

							modified.push({coords: coords, type: 'bridge'});
						}
					break;

					// дерево посреди воды сначала превратится в фрагмент моста
					case 'tree':
						if (
							(neighbourhood[0] == 'water') &&
							(neighbourhood[1] == 'water') &&
							(neighbourhood[2] == 'water') &&
							(neighbourhood[3] == 'water')
						   ) {
							modified.push({coords: [j, i], type: 'bridge'});
						}
					break;
				}

			}
		}

		for (var i = modified.length; i--;) {
			var block = modified[i];
			levels[0].map[block.coords[1]][block.coords[0]] = block.type;
		}
	}

	function processPlayer(button) {
		switch (button) {
			case 40:
				if (canPass(player.coords[0], player.coords[1] + 1)) {
					player.coords[1]++;
					generateMap();
				}
			break;

			case 39:
				if (canPass(player.coords[0] + 1, player.coords[1])) {
					player.coords[0]++;
					generateMap();
				}
			break;

			case 38:
				if (canPass(player.coords[0], player.coords[1] - 1)) {
					player.coords[1]--;
					generateMap();
				}
			break;

			case 37:
				if (canPass(player.coords[0] - 1, player.coords[1])) {
					player.coords[0]--;
					generateMap();
				}
			break;

			case 88:
				placeholder.show = true;
				placeholder.coords[0] = player.coords[0];
				placeholder.coords[1] = player.coords[1];
			break;

			default:
				console.log(button);
			break;
		}
	}

	function log(message) {
		$('#log').val($('#log').val() + message + "\r\n").scrollTop($('#log')[0].scrollHeight - $('#log').height())
	}

	function processPlaceholder(button) {
		var deltaX = placeholder.coords[0] - player.coords[0],
			deltaY = placeholder.coords[1] - player.coords[1];

		switch (button) {
			case 40:
				if ((deltaY < 1) && (deltaX == 0)) {
					placeholder.coords[1]++;
				}
			break;

			case 39:
				if ((deltaX < 1) && (deltaY == 0)) {
					placeholder.coords[0]++;
				}
			break;

			case 38:
				if ((deltaY > -1) && (deltaX == 0)) {
					placeholder.coords[1]--;
				}
			break;

			case 37:
				if ((deltaX > -1) && (deltaY == 0)) {
					placeholder.coords[0]--;
				}
			break;

			case 88:
				placeholder.show = false;
			break;

			case 13:
				execute();
			break;

			case 80:
				putDown();
			break;

			default:
				console.log(button);
			break;
		}
	}

	function putDown() {
		placeholder.show = false;
		if (player.selectedItem != null) {
			var interactive = {
								'ground': {'rock': 'rock', 'tree': 'tree'},
								'water': {'ground': 'ground', 'tree': 'bridge'},
								'pit': {'ground': 'ground', 'water': 'water'}
							  },
				blockType = levels[0].map[placeholder.coords[1]][placeholder.coords[0]];

			if ((interactive[blockType] != undefined) && (interactive[blockType][player.selectedItem] != undefined)) {
				levels[0].map[placeholder.coords[1]][placeholder.coords[0]] = interactive[blockType][player.selectedItem];

				log(message('put', player.selectedItem, blockType));

				player.items[player.selectedItem]--;
				if (player.items[player.selectedItem] == 0) {
					delete (player.items[player.selectedItem]);
					player.selectedItem = null;
					rotateItems();
				}
			} else {
				log(description[blockType] + ' и ' + description[player.selectedItem] + ' не могут взаимодействовать');
			}
		} else {
			log('Не выбран предмет!');
		}
	}


	function message(actionType, blockType, secondBlock) {
		if (actionType == 'execute') {
			switch (blockType) {
				case 'ground':
					return 'Выкопал ямку';

				case 'rock':
					return 'Добыл немного камня';
				break;

				case 'tree':
					return 'Срубил дерево';
				break;

				case 'water':
					return 'Набрал воды';
				break;

				default:
					return 'Совершил нечто невообразимое';
			}
		}

		if (actionType == 'put') {
			switch (blockType + secondBlock) {
				case 'groundpit':
					return 'Закопал дыру в земле';

				case 'groundwater':
					return 'Засыпал воду';

				case 'rockground':
					return 'Выложил камень';
				break;

				case 'treeground':
					return 'Посадил дерево';
				break;

				case 'treewater':
					return 'Соорудил мост';
				break;

				case 'waterpit':
					return 'Залил яму водой';
				break;

				default:
					return 'Совершил нечто невообразимое';
			}
		}

	}


	function execute() {
		var interactive = {'ground': 'pit', 'rock': 'ground', 'tree': 'ground', 'water': false},
			blockType = levels[0].map[placeholder.coords[1]][placeholder.coords[0]];

		placeholder.show = false;

		if (interactive[blockType] != undefined) {
			
			log(message('execute', blockType));

			if (interactive[blockType] !== false) {
				levels[0].map[placeholder.coords[1]][placeholder.coords[0]] = interactive[blockType];
			}

			pickItem(blockType);

		} else {
			log('Не удалось');
		}
	}

	function drawStatusbar() {
		context.fillStyle = '#000';
		context.fillRect(0, 19 * 30, 600, 30);

		var item = 'Ничего не выбрано'

		if (player.selectedItem != null) {
			context.drawImage(getBlockSprite(player.selectedItem), 10, 19 * 30 + 10, 10, 10);
			item = description[player.selectedItem] + ' (' + player.items[player.selectedItem] + ')';
		}

		context.font = 'normal 11px sans-serif';
		context.fillStyle = '#fff';
		context.textAlign = 'start';
		context.textBaseline = 'middle';
		context.fillText(item, 30, 585);

		context.textAlign = 'end';
		context.fillText('Координаты ' + player.coords[0] + '/' + player.coords[1], 590, 585);
	}

	function rotateItems() {
		var first = null,
			next = false;
  
  		for (var item in player.items) {
    		if (player.items.hasOwnProperty(item)) {
		    	first = first == null ? item : first;
      			if (player.selectedItem == null) {
        			next = true;
        			break;
      			} else {
      		        if (next) {
	          			player.selectedItem = item;
	          			next = false;
	          			break;
        			}
        			if (player.selectedItem == item) {
          				next = true;
        			}
		        }
    		}
  		}
        if (next) {
        	player.selectedItem = first;
      	}
	}

	function pickItem(blockType) {
		player.items[blockType] = player.items[blockType] != undefined ? player.items[blockType] + 1 : 1;
	}

	// var processTimer = 0;
	// function showProcess() {
	// 	context.strokeStyle = '1px dashed #ccc';
	// 	context.strokeRect(placeholder.coords[0] * 30, placeholder.coords[1] * 30, 30, 30);

	// 	processTimer = setInterval(
	// 		function() {

	// 		},
	// 		100
	// 	);


	// }


	function initImages(chain, callback) {
		if (chain.length > 0) {
			var sprite = chain.shift();
			
			images[sprite.type] = new Image();
			images[sprite.type].onload = function() {
				initImages(chain, callback);
			}
			images[sprite.type].src = sprite.source;

		} else {
			callback();
		}
	}

	function startGame() {
		$('body').keydown(function(e) {
			if (placeholder.show) {
				processPlaceholder(e.which);
			} else {
				processPlayer(e.which);
			}

			if (e.which == 73) {
				rotateItems();
			}

			redraw();
		});

		setInterval(
			function() {
				environment();
				redraw();
			},
			1000
		);

		generateMap();
		redraw();
	}

	initImages(
		[
			{type: 'ground', source: 'img/grass.png'},
			{type: 'rock', source: 'img/stone.png'},
			{type: 'tree', source: 'img/tree.png'},
			{type: 'water', source: 'img/water.png'},
			{type: 'bridge', source: 'img/bridge.png'},
			{type: 'blackhole', source: 'img/grass.png'},
			{type: 'pit', source: 'img/pit.png'}
		],
		startGame
	);
});
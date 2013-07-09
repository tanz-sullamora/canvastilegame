$(function() {
	
	var WIDTH = 20,
		HEIGHT = 20;

	var canvasElement = $('#cnv'),
		context = canvasElement[0].getContext('2d');

	var levels = [
		{
			title		: 'Level 1',
			rockFactor 	: 20, // 20% камней
			treeFactor 	: 65, // 70% леса
			waterFactor : 10,
			npcFactor	: 1,
			map 		: [ ],
			npc 		: [ ]
		}
	];

	var description = {
		ground: 'земля',
		rock: 'скала',
		tree: 'дерево',
		water: 'вода',
		bridge: 'мост',
		blackhole: 'чёрная дыра',
		pit: 'яма',
		npc: 'NPC'
	};

	var player = {
		coords: [0, 0],
		items: {},
		selectedItem: null,
		executing: false,
		executingTimer: null
	};

	var placeholder = {
		show: false,
		coords: [0, 0],
		timer: null,
		timerTimeout: null
	};

	var images = {};

	var npcs = [
		{
			type 			: 'npc_green',
			aggressive 		: false,
			coords 			: [0, 0]
		},
		{
			type 			: 'npc_blue',
			aggressive  	: false,
			coords 			: [0, 0]
		},
		{
			type 			: 'npc_red',
			aggressive 		: true,
			coords 			: [0, 0]
		},
		{
			type 			: 'npc_yellow',
			aggressive 		: true,
			coords 			: [0, 0]
		}
	];

	var npcSpeech = [
		{ text: "Я твой дом труба шатал", len: 120 },
		{ text: "Анус себе дерни, пес!", len: 110 },
		{ text: "Да ты хуй простой", len: 90 },
		{ text: "Слышь, семки есть?", len: 100 },
		{ text: "А если найду?", len: 70 },
		{ text: "Все, пизда тебе!!!", len: 90 },
		{ text: "СУКА!!!11 ААА!!!111", len: 90 }
	];

	var drop  = {
		'tree' : [
			{
				'name' : 'hueta1',
				'droprate' : 5,
				'title' : 'Неведомая хуета из дерева' 
			},
			{
				'name' : 'hueta2',
				'droprate' : 10,
				'title' : 'Еще одна неведомая хуета из дерева' 
			}
		]
	}

	function drawLevel() {
		var offset = getOffset();

		for (var i = offset[1]; i < offset[1] + HEIGHT; i++) {
			for (var j = offset[0]; j < offset[0] + WIDTH; j++) {
				if (levels[0].map[i] != undefined && levels[0].map[i][j] != undefined) {
					context.drawImage(getBlockSprite(levels[0].map[i][j]), (j - offset[0]) * 30, (i - offset[1]) * 30);
				} else {
					context.fillStyle = '#000';
					context.fillRect((j - offset[0]) * 30, (i - offset[1]) * 30, 30, 30);
				}
			}
		}

		// рисуем берега
		for (var i = offset[1]; i < offset[1] + HEIGHT; i++) {
			for (var j = offset[0]; j < offset[0] + WIDTH; j++) {
				if (levels[0].map[i] != undefined && levels[0].map[i][j] != undefined) {
					if (levels[0].map[i][j] == 'water') {
						if (levels[0].map[i][j - 1] != undefined && levels[0].map[i][j - 1] != 'water' && levels[0].map[i][j - 1] != 'bridge') {
							context.save();
							context.translate((j - offset[0] + 1) * 30 - 15, (i - offset[1] + 1) * 30 - 15);
							context.rotate(1.56);
							context.drawImage(getBlockSprite('coast'), -15, -15);
							context.restore();
						}
						if (levels[0].map[i][j + 1] != undefined && levels[0].map[i][j + 1] != 'water' && levels[0].map[i][j + 1] != 'bridge') {
							context.save();
							context.translate((j - offset[0] + 1) * 30 - 15, (i - offset[1] + 1) * 30 - 15);
							context.rotate(4.7);
							context.drawImage(getBlockSprite('coast'), -15, -15);
							context.restore();
						}
						if (levels[0].map[i - 1] != undefined && levels[0].map[i - 1][j] != undefined && levels[0].map[i - 1][j] != 'water' && levels[0].map[i - 1][j] != 'bridge') {
							context.save();
							context.translate((j - offset[0] + 1) * 30 - 15, (i - offset[1] + 1) * 30 - 15);
							context.rotate(3.13);
							context.drawImage(getBlockSprite('coast'), -15, -15);
							context.restore();
						}
						if (levels[0].map[i + 1] != undefined && levels[0].map[i + 1][j] != undefined && levels[0].map[i + 1][j] != 'water' && levels[0].map[i + 1][j] != 'bridge') {
							context.save();
							context.drawImage(getBlockSprite('coast'), (j - offset[0]) * 30, (i - offset[1]) * 30);
							context.restore();
						}
					}
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
			var maxItemsCount = HEIGHT * WIDTH;

			var rockFactor = levels[0].rockFactor;
			var treeFactor = levels[0].treeFactor;
			var npcFactor  = levels[0].npcFactor;
			
			var treeCount  =  Math.floor(maxItemsCount * (Math.random() * treeFactor) / 100);
			var rockCount  =  Math.floor((maxItemsCount - treeCount) * (Math.random() * rockFactor) / 100);
			var npcCount   =  Math.floor((maxItemsCount - treeCount - rockCount) * (Math.random() * npcFactor) / 100);

			console.log(npcCount);

			/* камни */
			for (var i = rockCount; i--;) {
				var x = Math.floor(Math.random() * HEIGHT);
				var y = Math.floor(Math.random() * WIDTH);

				if(newMap[x][y] == 'ground') {
					newMap[Math.floor(Math.random() * HEIGHT)][Math.floor(Math.random() * WIDTH)] = 'rock';
				}
			}

			/* деревья */
			for (var i = treeCount; i > 0; i--) {
				var makeForest = (Math.floor((Math.random() * 10)) > 4 && treeFactor > 50) ? true : false;

				if (makeForest) {
			
					// сажаем одно дерево произвольно 
					var randomX = Math.floor(Math.random() * HEIGHT),
						randomY = Math.floor(Math.random() * WIDTH);


					// попытаемся посмотреть, был ли уже лес на верхней и левой границах
					var prevForestCoords = [];
					for (var j = WIDTH; j--;) {
						if (levels[0].map[blockY - 1] != undefined && levels[0].map[blockY - 1][blockX + j] != undefined && levels[0].map[blockY - 1][blockX + j] == 'tree') {
							//newMap[0][i] = 'water';
							prevForestCoords.push([j, 1]);
						}
						if (levels[0].map[blockY + HEIGHT - 1] != undefined && levels[0].map[blockY + HEIGHT - 1][blockX + j] != undefined && levels[0].map[blockY + HEIGHT - 1][blockX + j] == 'tree') {
							//newMap[HEIGHT - 1][i] = 'water';
							prevForestCoords.push([j, HEIGHT + 1]);
						}
					}

					for (var j = HEIGHT; j--;) {
						if (levels[0].map[blockY + j] != undefined && levels[0].map[blockY + j][blockX - 1] != undefined && levels[0].map[blockY + j][blockX - 1] == 'tree') {
							//newMap[i][0] = 'water';
							prevForestCoords.push([1, i]);
						}
						if (levels[0].map[blockY + j] != undefined && levels[0].map[blockY + j][blockX + WIDTH - 1] != undefined && levels[0].map[blockY + j][blockX + WIDTH - 1] == 'tree') {
							//newMap[i][WIDTH - 1] = 'water';
							prevForestCoords.push([WIDTH + 1, j]);
						}
					}

					
					var usePrevForest = (Math.floor((Math.random() * 10)) > 5 && treeFactor > 50) ? true : false;

					if (prevForestCoords.length > 0 && usePrevForest) {
						
						var poo = prevForestCoords[Math.floor(Math.random() * prevForestCoords.length)];
						randomX = poo[0];
						randomY = poo[1];
					}

					// сколько деревьев посадим в группе
					var treeGroupCount = Math.floor(Math.random() * i);
					i -= treeGroupCount;

					newMap = drawForest(newMap, treeGroupCount, randomX, randomY);
				} else {
					var x = Math.floor(Math.random() * HEIGHT);
					var y = Math.floor(Math.random() * WIDTH);

					if(newMap[x][y] == 'ground') {
						newMap[Math.floor(Math.random() * HEIGHT)][Math.floor(Math.random() * WIDTH)] = 'tree';
						i--;
					}
					
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


			// NPC

			for (var i = npcCount; i--;) {
				
				var y = Math.floor(Math.random() * HEIGHT);
				var x = Math.floor(Math.random() * WIDTH)
				
				if(newMap[y][x] == 'ground') {

					// get random npc
					var npcItem = npcs[Math.floor(Math.random() * npcs.length)];	
					
					npcItem.coords = [y, x];
					levels[0].npc.push(npcItem);
					//newMap[y][x] = npcItem.type;
				}
			}


			return newMap;
		}

		

		function drawForest(map, count, x, y) {
			for (var i = count; i--;) {
			  	var direction = Math.round(Math.random() * 4);

				switch (direction) {
				   	case 0: 
				    	y--;
				   		break;
				   	case 1: 
				    	x++;
				   		break;
				   	case 2: 
				   	 	y++;
				   		break;
				    case 3: 
				    	x--;
				   		break;
				}

		 		if (map[y] != undefined && map[y][x] != undefined && map[y][x] == 'ground') {
		   			map[y][x] = 'tree';
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
						y--; 
					break;
					case 1: 
						x++;
					break;
					case 2: 
						y++;
					break;
					case 3: 
						x--;
					break;
				}

				if (map[y] != undefined) {
					map[y][x] = 'water';
					sources[i] = [x, y];
				} else {
					sources.splice(i, 1);
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
				for (var j = WIDTH; j--;) {
					levels[0].map[blockY * HEIGHT + i][blockX * WIDTH + j] = newMap[i][j];
				}
			}
		}
		
		function addRow(blockY) {
			var width = levels[0].map[blockY - 1] == undefined ? WIDTH : levels[0].map[blockY - 1].length;
			for (var i = HEIGHT; i--;) {
				levels[0].map[blockY + i] = [];
			}
		}

		var blockX = Math.floor(player.coords[0] / WIDTH),
			blockY = Math.floor(player.coords[1] / HEIGHT),
			playerBlockX = player.coords[0] - blockX * WIDTH,
			playerBlockY = player.coords[1] - blockY * HEIGHT,
			halfWIDTH = Math.round(WIDTH / 2),
			halfHEIGHT = Math.round(HEIGHT / 2);

		if (levels[0].map[blockY * HEIGHT] == undefined) {
			addRow(blockY * HEIGHT);
		}

		if (blockX == 0 && levels[0].map[blockY * HEIGHT][blockX * WIDTH] == undefined) {
			addBlock(blockX, blockY);
			return;
		}

		if (playerBlockY > halfHEIGHT && levels[0].map[(blockY + 1) * HEIGHT] == undefined) {
			if (levels[0].map[(blockY + 1) * HEIGHT] == undefined) {
				addRow((blockY + 1) * HEIGHT);
			}
		}
		
		if (playerBlockX <= halfWIDTH && blockX > 0 && levels[0].map[blockY * HEIGHT][(blockX - 1) * WIDTH] == undefined) {
			addBlock(blockX - 1, blockY);
		}
		if (playerBlockX <= halfWIDTH && blockX > 0 && playerBlockY <= halfHEIGHT && blockY > 0 && levels[0].map[(blockY - 1) * HEIGHT][(blockX - 1) * WIDTH] == undefined) {
			addBlock(blockX - 1, blockY - 1);
		}
		if (playerBlockX <= halfWIDTH && blockX > 0 && playerBlockY > halfHEIGHT && levels[0].map[(blockY + 1) * HEIGHT][(blockX - 1) * WIDTH] == undefined) {
			addBlock(blockX - 1, blockY + 1);
		}

		if (playerBlockX > halfWIDTH && levels[0].map[blockY * HEIGHT][(blockX + 1) * WIDTH] == undefined) {
			addBlock(blockX + 1, blockY);
		}

		if (playerBlockX > halfWIDTH && playerBlockY <= halfHEIGHT && blockY > 0 && levels[0].map[(blockY - 1) * HEIGHT][(blockX + 1) * WIDTH] == undefined) {
			addBlock(blockX + 1, blockY - 1);
		}
		if (playerBlockX > halfWIDTH && playerBlockY > halfHEIGHT && levels[0].map[(blockY + 1) * HEIGHT][(blockX + 1) * WIDTH] == undefined) {
			addBlock(blockX + 1, blockY + 1);
		}
		
		if (playerBlockY <= halfHEIGHT && blockY > 0 && levels[0].map[(blockY - 1) * HEIGHT][blockX * WIDTH] == undefined) {
			addBlock(blockX, blockY - 1);
		}

		if (playerBlockY > halfHEIGHT && levels[0].map[(blockY + 1) * HEIGHT][blockX * WIDTH] == undefined) {
			addBlock(blockX, blockY + 1);
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

		//context.fillText('@', (player.coords[0] - offset[0]) * 30 + 15, (player.coords[1] - offset[1]) * 30 + 15);
		context.drawImage(getBlockSprite('player'), (player.coords[0] - offset[0]) * 30, (player.coords[1] - offset[1]) * 30);
	}
	
	function redraw() {
		drawLevel();
		drawPlayer();
		showPlaceholder();
		drawStatusbar();
		drawNPC();

		if (player.executing) {
			drawExecutionProgressBar();
		}
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

			context.lineWidth = 0.9;
			context.strokeStyle = '#fff';
			context.strokeRect((placeholder.coords[0] - offset[0]) * 30, (placeholder.coords[1] - offset[1]) * 30, 30, 30);
		}
	}

	function environment() {
		var modified = [];

		var offset = getOffset();

		for (var i = offset[1]; i < offset[1] + HEIGHT; i++) {
			for (var j = offset[0]; j < offset[0] + WIDTH; j++) {

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
					player.executing = false;
					resetExecutingTimer();
					generateMap();
				}
			break;

			case 39:
				if (canPass(player.coords[0] + 1, player.coords[1])) {
					player.coords[0]++;
					player.executing = false;
					resetExecutingTimer();
					generateMap();
				}
			break;

			case 38:
				if (canPass(player.coords[0], player.coords[1] - 1)) {
					player.coords[1]--;
					player.executing = false;
					resetExecutingTimer();
					generateMap();
				}
			break;

			case 37:
				if (canPass(player.coords[0] - 1, player.coords[1])) {
					player.coords[0]--;
					player.executing = false;
					resetExecutingTimer();
					generateMap();
				}
			break;

			case 88:
				placeholder.show = true;
				player.executing = false;
				resetExecutingTimer();
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

		var blockType 			= levels[0].map[placeholder.coords[1]][placeholder.coords[0]],
			blockDefenitions 	= {
									'ground' : {
										'duration' : 2800,
										'animation' : function(){},
										'opposite' : 'pit'
									},
									'tree' : {
										'duration' : 800,
										'animation' : function(){},
										'opposite' : 'ground'
									},
									'rock' : {
										'duration' : 1600,
										'animation' : function(){},
										'opposite' : 'ground'
									},
									'water' : {
										'duration' : 200,
										'animation' : function(){},
										'opposite' : null
									}
			};

		placeholder.show = false;

		if (blockDefenitions[blockType] != undefined) {
			var interactive = blockDefenitions[blockType];

			player.executing = true;

			placeholder.timerTimeout = interactive.duration;
			drawExecutionProgressBar();
			player.executingTimer = window.setTimeout(function(){
				
				placeholder.timerTimeout = null;
				clearInterval(placeholder.timer);
				placeholder.timer = null;

				if (!player.executing) {
					
					return;
				}

				if (interactive.opposite !== null) {
					levels[0].map[placeholder.coords[1]][placeholder.coords[0]] = interactive.opposite;
				}
				pickItem(blockType);
				log(message('execute', blockType));
				player.executing = false;

				//random drop

				if (drop[blockType] !== undefined) {

					var dropped = false;
					for(var i in drop[blockType]) {
						var item = drop[blockType][i];

						var rand = Math.floor(Math.random() * item.droprate + 1);
						var dropItem = (rand == 1) ? true : false;

						if(dropItem) {
							dropped = true;

							log('Воу, воу, воу! Подобрал "'+item.title+'"');
							break;
						}
					}
				}


			}, interactive.duration);

		} else {
			log('Не удалось');
		}
	}

	function drawExecutionProgressBar() {
		var offset = getOffset();

		var x = (player.coords[0] - offset[0]) * 30 - 5;
		var y = (player.coords[1] - offset[1]) * 30 - 10;

		context.fillStyle = '#fff';
		context.fillRect(x, y, 30, 10);

		var item = 'Хуячу';

		context.font = 'normal 9px sans-serif';
		context.fillStyle = '#333';
		context.textAlign = 'start';
		context.textBaseline = 'middle';
		context.fillText(item, x+2, y+5);

		context.textAlign = 'end';
		
		context.strokeStyle = '#fff';
		context.strokeRect((placeholder.coords[0] - offset[0]) * 30, (placeholder.coords[1] - offset[1]) * 30, 30, 30);

		if (placeholder.timer == null) {
			placeholder.timer = setInterval(
				function() {
					if (placeholder.timerTimeout == null) {
						clearInterval(placeholder.timer);
						placeholder.timer = null;
					}
					var width = 28 - (placeholder.timerTimeout / 100);
					context.fillStyle = '#fff';
					context.fillRect((placeholder.coords[0] - offset[0]) * 30 + 1, (placeholder.coords[1] - offset[1]) * 30 + 24, width, 4);
					placeholder.timerTimeout -= 100;
				},
				100
			);
		}
	}


	function drawNpcSpeech(npc) {

		var offset = getOffset();
		var item = npcSpeech[Math.floor(Math.random() * npcSpeech.length)];

		var x = (npc.coords[0] - offset[0]) * 30 - 5;
		var y = (npc.coords[1] - offset[1]) * 30 - 10;

		context.fillStyle = '#fff';
		context.fillRect(x, y, item.len, 10);

		

		context.font = 'normal 9px sans-serif';
		context.fillStyle = '#333';
		context.textAlign = 'start';
		context.textBaseline = 'middle';
		context.fillText(item.text, x+2, y+5);

		context.textAlign = 'end';
		
		context.strokeStyle = '#fff';
		
		
	}


	function resetExecutingTimer() {
		if (player.executingTimer != null) {
			clearTimeout(player.executingTimer);
			clearInterval(placeholder.timer);
			placeholder.timer = null;
		}
	}

	function moveNpc(npc) {

		var x 			= npc.coords[0];
		var y 			= npc.coords[1];
		var direction 	= Math.round(Math.random() * 4);

		switch (direction) {
		   	case 0: 
		    	y--;
		   		break;
		   	case 1: 
		    	x++;
		   		break;
		   	case 2: 
		   	 	y++;
		   		break;
		    case 3: 
		    	x--;
		   		break;
		}


		if (levels[0].map[y] != undefined && levels[0].map[y][x] != undefined && levels[0].map[y][x] == 'ground') {
	   		npc.coords = [x, y];
	 	}

	 	return npc;

	}


	function drawNPC() {
		
		var offset = getOffset();
		for(var i in levels[0].npc) {


			var currentNpc 	= levels[0].npc[i];
			var needMove 	= (Math.floor(Math.random() * 2) + 1 == 1)  ? true : false; 
			if(needMove) {
				currentNpc 	= moveNpc(currentNpc);
			}
			
			var needTalk 	= (Math.floor(Math.random() * 5 + 1) == 1)  ? true : false; 

			if(needTalk) {
				drawNpcSpeech(currentNpc);
			}

			context.drawImage(getBlockSprite(currentNpc.type), (currentNpc.coords[0] - offset[0]) * 30, (currentNpc.coords[1] - offset[1]) * 30);

		}
		
	}

	function drawStatusbar() {
		context.save();
		context.globalAlpha = 0.5;
		context.fillStyle = '#000';
		context.fillRect(0, 19 * 30, 600, 30);
		context.restore();

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

		generateMap();
		redraw();

		setInterval(
			function() {
				environment();
				redraw();
			},
			1000
		);
	}

	initImages(
		[
			{type: 'ground', 		source: 'img/grass.png'					},
			{type: 'rock', 			source: 'img/stone.png'					},
			{type: 'tree', 			source: 'img/tree.png'					},
			{type: 'water', 		source: 'img/water.png'					},
			{type: 'bridge', 		source: 'img/bridge.png'				},
			{type: 'blackhole', 	source: 'img/grass.png'					},
			{type: 'pit', 			source: 'img/pit.png'					},
			{type: 'player', 		source: 'img/player.png'				},
			{type: 'coast', 		source: 'img/coast.png'					},
			{type: 'npc_blue', 		source: 'img/blue_monster.png'			},
			{type: 'npc_green', 	source: 'img/green_monster.png'			},
			{type: 'npc_red', 		source: 'img/red_monster_angry.png'		},
			{type: 'npc_yellow', 	source: 'img/yellow_monster_angry.png'	},
		],
		startGame
	);
});
$(function() {
	
	var WIDTH = 20,
		HEIGHT = 20;

	var canvasElement = $('#cnv'),
		trueContext = canvasElement[0].getContext('2d'),
		placeholderElement = $('<canvas width="30" height="30" style="position: absolute" />').appendTo('body'),
		placeholderContext = placeholderElement[0].getContext('2d'),
		buffer = document.createElement('canvas'),
		context = buffer.getContext('2d');

	buffer.width  = 600;
	buffer.height = 600;

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
		'Пристрелите меня, кто-нибудь',
		'Не подскажете, как пройти до библиотеки?',
		'Да у тебя и зубы золотые!',
		'Бежевый! Я покрашу потолок в бежевый!',
		'Проходит как-то ирландец мимо бара...',
		'Иногда сигара - это просто сигара',
		'Был у меня один кореш, не употреблял ничего',
		'Эх, а вот в наше время...',
		'Всё вокруг кажется мне плоским',
		'На самом деле я доктор honoris causa',
		'Поговорим о нарративе?',
		'Кажется, я отравился печенькой',
		'*Посвистывает*',
		'*Громко стонет*',
		'*Озирается вокруг*',
		'Уважаемый сэр или мадам, подайте голодающему организму',
		'Запость это в твиттер',
		'Отступать некуда, за нами 2D',
		'Позвольте, я почитаю вам Бродского?',
		'Ваши пальцы пахнут ладаном...',
		'*Напевает*',
		'Кажется, я заблудился',
		'Разрешите вас проводить?',
		'Какой длины впп в Испании?',
		'Лошадкаааа!!!',
		'Мы ещё встретимся',
		'В детстве меня звали "Кусок кода"',
		'На днях открыл свой стартап',
		'Java для лохов',
		'Занимайтесь любовью, а не игрой',
	];
	
	var NPCsNames = [
		['Гарольд', 'Кумар', 'Тэнк', 'Стэн', 'Андрюша', 'Хохол', 'Лёха', 'Марик', 'Танз', 'Нэд', 'Фродо', 'Йода', ],
		['Зелёный', 'Непобедимый', 'Грязный', 'Вонючий', 'Большой', 'Трусливый', 'Красноглазый', 'Сумчатый', 'Невыносимый', 'Капитан', 'Железный', 'Плакса', 'Красавчик', ]
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
					var	blockSprite = getBlockSprite(levels[0].map[i][j]),
						sprite = Math.floor((i + j * 1.71) % blockSprite.count);
					context.drawImage(blockSprite, sprite * 30, 0, 30, 30, (j - offset[0]) * 30, (i - offset[1]) * 30, 30, 30);
				} else {
					context.fillStyle = '#000';
					context.fillRect((j - offset[0]) * 30, (i - offset[1]) * 30, 30, 30);
				}
			}
		}

		function drawCoast(translate, rotate, coords) {
			context.save();
			context.translate(translate[0], translate[1]);
			context.rotate(rotate);
			// устойчивый спрайт, зависящий от координат, для того чтобы берег не менялся при перерисовке
			var	coastSprite = getBlockSprite('coast'),
				sprite = Math.floor((coords[0] + coords[1]) % coastSprite.count);

			context.drawImage(coastSprite, sprite * 30, 0, 30, 30, -15, -15, 30, 30);
			context.restore();
		}

		// рисуем берега
		for (var i = offset[1]; i < offset[1] + HEIGHT; i++) {
			for (var j = offset[0]; j < offset[0] + WIDTH; j++) {
				if (levels[0].map[i] != undefined && levels[0].map[i][j] != undefined) {
					if (levels[0].map[i][j] == 'water') {
						var translate = [0, 0],
							rotate = 0,
							coords = [-15, -15];

						if (levels[0].map[i][j - 1] != undefined && levels[0].map[i][j - 1] != 'water' && levels[0].map[i][j - 1] != 'bridge') {
							translate = [(j - offset[0] + 1) * 30 - 15, (i - offset[1] + 1) * 30 - 15];
							rotate = 1.56;
							drawCoast(translate, rotate, [j - 1, i]);
						}
						if (levels[0].map[i][j + 1] != undefined && levels[0].map[i][j + 1] != 'water' && levels[0].map[i][j + 1] != 'bridge') {
							translate = [(j - offset[0] + 1) * 30 - 15, (i - offset[1] + 1) * 30 - 15];
							rotate = 4.7;
							drawCoast(translate, rotate, [j + 1, i]);
						}
						if (levels[0].map[i - 1] != undefined && levels[0].map[i - 1][j] != undefined && levels[0].map[i - 1][j] != 'water' && levels[0].map[i - 1][j] != 'bridge') {
							translate = [(j - offset[0] + 1) * 30 - 15, (i - offset[1] + 1) * 30 - 15];
							rotate = 3.13;
							drawCoast(translate, rotate, [j, i - 1]);
						}
						if (levels[0].map[i + 1] != undefined && levels[0].map[i + 1][j] != undefined && levels[0].map[i + 1][j] != 'water' && levels[0].map[i + 1][j] != 'bridge') {
							translate = [(j - offset[0]) * 30 + 15, (i - offset[1]) * 30 + 15];
							rotate = 0;
							drawCoast(translate, rotate, [j, i + 1]);
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
							prevForestCoords.push([j, 1]);
						}
						if (levels[0].map[blockY + HEIGHT - 1] != undefined && levels[0].map[blockY + HEIGHT - 1][blockX + j] != undefined && levels[0].map[blockY + HEIGHT - 1][blockX + j] == 'tree') {
							prevForestCoords.push([j, HEIGHT + 1]);
						}
					}

					for (var j = HEIGHT; j--;) {
						if (levels[0].map[blockY + j] != undefined && levels[0].map[blockY + j][blockX - 1] != undefined && levels[0].map[blockY + j][blockX - 1] == 'tree') {
							prevForestCoords.push([1, i]);
						}
						if (levels[0].map[blockY + j] != undefined && levels[0].map[blockY + j][blockX + WIDTH - 1] != undefined && levels[0].map[blockY + j][blockX + WIDTH - 1] == 'tree') {
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

					if (newMap[x][y] == 'ground') {
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
			var offset = getOffset();
			for (var i = npcCount; i--;) {
				// чтоб не возникали неожиданно на открытой территории
				var positions = [[0, 0], [19, 0], [19, 19], [0, 19]],
					randomPos = Math.floor(Math.random() * positions.length);
				
				if (newMap[positions[randomPos][1]][positions[randomPos][0]] == 'ground') {
					// get random npc
					var npcItem = npcs[Math.floor(Math.random() * npcs.length)];	
					
					npcItem.name = NPCsNames[1][Math.floor(Math.random() * NPCsNames[1].length)] + ' ' + NPCsNames[0][Math.floor(Math.random() * NPCsNames[0].length)];
					npcItem.coords = [offset[0] + positions[randomPos][0], offset[1] + positions[randomPos][1]];
					levels[0].npc.push(npcItem);
				}
			}
			initNPCs();

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
				var x = sources[i][0],
					y = sources[i][1];

				switch (Math.round(Math.random() * 4)) {
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

		context.drawImage(getBlockSprite('player'), (player.coords[0] - offset[0]) * 30, (player.coords[1] - offset[1]) * 30);

		// context.font = 'bold 16px sans-serif';
		// context.fillStyle = '#000';
		// context.textAlign = 'center';
		// context.textBaseline = 'middle';
		//context.fillText('@', (player.coords[0] - offset[0]) * 30 + 15, (player.coords[1] - offset[1]) * 30 + 15);
	}
	
	function redraw() {
		drawLevel();
		drawPlayer();
		drawStatusbar();
		drawNPC();

		trueContext.drawImage(buffer, 0, 0);
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

			placeholderContext.clearRect(0, 0, 30, 30);
			placeholderContext.lineWidth = 0.9;
			placeholderContext.strokeStyle = '#fff';
			placeholderContext.strokeRect(0, 0, 30, 30);
			placeholderElement.css({left: canvasElement.offset().left + (placeholder.coords[0] - offset[0]) * 30, top: canvasElement.offset().top + (placeholder.coords[1] - offset[1]) * 30})
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
				player.executing = false;
				resetExecutingTimer();
				placeholder.coords[0] = player.coords[0];
				placeholder.coords[1] = player.coords[1];

				placeholder.show = true;
				placeholderElement.show();
				showPlaceholder();
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
			deltaY = placeholder.coords[1] - player.coords[1],
			offset = getOffset();

		if (player.executing) {
			resetExecutingTimer();
		}

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
				placeholderElement.hide();
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
		placeholderElement.css({left: canvasElement.offset().left + (placeholder.coords[0] - offset[0]) * 30, top: canvasElement.offset().top + (placeholder.coords[1] - offset[1]) * 30});
	}

	function putDown() {
		placeholder.show = false;
		placeholderElement.hide();
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
										'opposite' : 'pit'
									}
			};

		placeholder.show = false;

		if (blockDefenitions[blockType] != undefined) {
			var interactive = blockDefenitions[blockType];

			player.executing = true;

			placeholder.timerTimeout = interactive.duration;
			drawExecutionProgressBar();
			player.executingTimer = window.setTimeout(function(){

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
				
				resetExecutingTimer();

				if (!player.executing) {
					return;
				}

			}, interactive.duration);

		} else {
			log('Не удалось');
			placeholder.show = false;
			placeholderElement.hide();
		}
	}

	function drawExecutionProgressBar() {
		var offset = getOffset();

		placeholderContext.clearRect(0, 0, 30, 30);
		placeholderContext.lineWidth = 0.9;
		placeholderContext.strokeStyle = '#fff';
		placeholderContext.strokeRect(0, 0, 30, 30);

		if (placeholder.timer == null) {
			placeholder.timer = setInterval(
				function() {
					if (placeholder.timerTimeout == null) {
						player.executing = false;
						resetExecutingTimer();
					}
					var width = 28 - (placeholder.timerTimeout / 100);
					placeholderContext.fillStyle = '#fff';
					placeholderContext.fillRect(2, 24, width, 4);
					placeholder.timerTimeout -= 100;
				},
				100
			);
		}
	}

	function resetExecutingTimer() {
		if (player.executingTimer != null) {
			player.executing = false;
			clearTimeout(player.executingTimer);
			placeholder.timerTimeout = null;
			clearInterval(placeholder.timer);
			placeholder.timer = null;
			placeholder.show = false;
			placeholderElement.hide();
		}
	}

	function moveNpc(coords) {
		var x = coords[0],
			y = coords[1];

		switch (Math.round(Math.random() * 4)) {
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

		if (levels[0].map[y] != undefined && levels[0].map[y][x] != undefined && (levels[0].map[y][x] == 'ground' || levels[0].map[y][x] == 'bridge')) {
	   		return [x, y];
	 	}

	 	return coords;
	}


	function drawMultiLine(phrase, x, y, maxWidth, lineHeight, reverse) {
		var words = phrase.split(' '),
			top = y,
			line = '',
			width = 0;

		for (var i = 0; i < words.length; i += 1) {
			var testLine = line + words[i] + ' ', 
				testWidth = context.measureText(testLine).width;

			if (testWidth > maxWidth) {
				context.fillText(line, x, top);
				line = words[i] + ' ';
				if (!reverse) {
					top -= lineHeight;
				} else {
					top += lineHeight;
				}
			} else {
				line = testLine;
				width = testWidth > width ? testWidth : width;
			}
		}

		context.fillText(line, x, top);
		return [width, y - top + lineHeight ];
	}

	function drawNPC() {
		var offset = getOffset(),
			textWidth = 110;

		for (var i = levels[0].npc.length; i--; ) {
			var currentNPC = levels[0].npc[i],
				x = (currentNPC.coords[0] - offset[0]) * 30,
				y = (currentNPC.coords[1] - offset[1]) * 30;

			context.drawImage(getBlockSprite(currentNPC.type), x, y);
			context.font = 'normal 9px sans-serif';
			context.fillStyle = '#fff';
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText(currentNPC.name, x + 15, y + 30);
			
			if (currentNPC.needTalk) {
				context.font = 'normal 9px sans-serif';
				context.textAlign = 'start';
				context.textBaseline = 'top';

				context.fillStyle = 'transparent';
				var pos = drawMultiLine(currentNPC.talkPhrase, x + 2, y + 2, textWidth, 9 + 3);
				context.fillStyle = '#fff';
				context.fillRect(x, y - pos[1], pos[0] + 6, pos[1] + 3);

				context.font = 'normal 9px sans-serif';
				context.fillStyle = '#000';
				drawMultiLine(currentNPC.talkPhrase, x + 3, y + 2 - pos[1], textWidth, 9 + 3, true);
			}
		}
	}
	
	function initNPCs() {
		for (var i = levels[0].npc.length; i--;) {
			var currentNPC = levels[0].npc[i];

			if (currentNPC.timer == undefined) {
				currentNPC.timer = function() {
					var self = this,
						speed = Math.floor(Math.random() * (2500 - 500 + 1)) + 500;

					setInterval(
						function() {
							var needMove = Math.random() > 0.5; 
							if (needMove) {
								self.coords = moveNpc(self.coords);
							}
							if (self.talkTimeout == undefined) {
								self.needTalk = Math.random() > 0.7;
								if (self.needTalk) {
									self.talkPhrase = npcSpeech[Math.floor(Math.random() * npcSpeech.length)];
									self.talkTimeout = setTimeout(
										function() {
											self.needTalk = false;
											self.talkTimeout = undefined;
										},
										2000
									);
								}
							}
						},
						speed
					);
				};
				currentNPC.timer();
			}
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
			images[sprite.type].count = sprite.count;

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
		initNPCs();

		// redraw
		setInterval(
			function() {
				redraw();
			},
			99
		);

		// environment
		setInterval(
			function() {
				environment();
			},
			1000
		);
	}

	initImages(
		[
			{type: 'ground', source: 'img/grass.png', count: 5},
			{type: 'rock', source: 'img/stone.png', count: 3},
			{type: 'tree', source: 'img/tree.png', count: 2},
			{type: 'water', source: 'img/water.png', count: 2},
			{type: 'bridge', source: 'img/bridge.png', count: 1},
			{type: 'blackhole', source: 'img/grass.png', count: 1},
			{type: 'pit', source: 'img/pit.png', count: 1},
			{type: 'player', source: 'img/player.png', count: 1},
			{type: 'coast', source: 'img/coast.png', count: 5},
			{type: 'npc_blue', source: 'img/blue_monster.png', count: 1},
			{type: 'npc_green', source: 'img/green_monster.png', count: 1},
			{type: 'npc_red', source: 'img/red_monster_angry.png', count: 1},
			{type: 'npc_yellow', source: 'img/yellow_monster_angry.png', count: 1},
		],
		startGame
	);
});
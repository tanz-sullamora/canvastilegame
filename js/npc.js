function npc(x, y) {
	this._speech = [
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
		'Похоже, я отравился печенькой',
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
		'А вы не видели тут чебурашку?',
		'А он что?',
		'А она что?',
	];
	
	var _names = [
		['Гарольд', 'Кумар', 'Тэнк', 'Стэн', 'Андрюша', 'Хохол', 'Лёха', 'Марик', 'Танз', 'Нэд', 'Фродо', 'Йода', ],
		['Зелёный', 'Непобедимый', 'Грязный', 'Вонючий', 'Большой', 'Трусливый', 'Красноглазый', 'Сумчатый', 'Невыносимый', 'Капитан', 'Железный', 'Плакса', 'Красавчик', ]
	];

	var _types = [
		{
			type 			: 'npc_green',
			aggressive 		: false
		},
		{
			type 			: 'npc_blue',
			aggressive  	: false
		},
		{
			type 			: 'npc_red',
			aggressive 		: true
		},
		{
			type 			: 'npc_yellow',
			aggressive 		: true
		}
	];


	this.name = _names[1][Math.floor(Math.random() * _names[1].length)] + ' ' + _names[0][Math.floor(Math.random() * _names[0].length)];
	this.coords = [x, y];
	this.behaviour = _types[Math.floor(Math.random() * _types.length)]
	this.moving = false;

	console.log('born');
	this.timer();
}


npc.prototype.timer = function() {
	var self = this,
		speed = Math.floor(Math.random() * (2500 - 500 + 1)) + 500;

	setInterval(
		function() {
			var needMove = Math.random() > 0.5;
			if (needMove) {
				if (!self.moving) {
					self.oldCoords = [self.coords[0], self.coords[1]];
					self.pixelOffset = [0, 0];
					self.move();
					self.moving = true;
					self.moveSpeed = Math.floor(Math.random() * (200 + 1)) + 50;
				}
			}
			if (self.talkTimeout == undefined) {
				self.needTalk = Math.random() > 0.7;
				if (self.needTalk) {
					self.talkPhrase = self._speech[Math.floor(Math.random() * self._speech.length)];
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
}

npc.prototype.move = function() {
	var x = this.coords[0],
		y = this.coords[1];

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

	if (this.checkPass(x, y)) {
		this.coords = [x, y];
	}
}

npc.prototype.checkPass = function(x, y) {
	return true;
}
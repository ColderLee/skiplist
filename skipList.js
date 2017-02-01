var should = require('should');

var Node = function (value, next_length) {
	this.value = value;
	this.next = new Array(next_length);
};

var lenArr = [1];
for (var i = 1; i < 29; i++) {
	lenArr[i] = lenArr[i - 1] * 2;
}

var SkipList = function () {
	this.current_height = 0;
	this.head = [];
	this.count = 0;		// node count
	this.max_height = 1;

	function _computeHeight() {
		var level = 1;
		while (Math.random() > 0.5) {
			level++;
		}
		return level;
	}

	this._adjustComputeHeight = function (comp_height) {
		for (var i = this.max_height; i < lenArr.length; i++) {
			if (lenArr[i] >= this.count) {
				this.max_height = i;
				break;
			}
		}
		if (comp_height > this.max_height) {
			comp_height = this.max_height;
		}
		return comp_height;
	}

	/**
	 * only support Integer
	 * @param value
	 */
	this.insert = function (value, level) {
		if (level) {
			var comp_height = level;
		} else {
			var comp_height = _computeHeight();
			comp_height = this._adjustComputeHeight(comp_height);
		}

		// console.info('compute level: ', value, comp_height);
		var node = new Node(value, comp_height);

		//var prev;
		for (var i = comp_height - 1; i >= this.current_height; i--) {
			// console.info('head', i);
			this.head[i] = node;
		}
		var height = this.current_height;
		var cur = this.head[height - 1];
		for (var i = height - 1; i >= 0; i--) {
			if (cur.value > value && cur == this.head[i]) {
				// console.info('down head', i, cur.value);
				if (i < comp_height) {
					node.next[i] = this.head[i];
					this.head[i] = node;
				}
				cur = this.head[i - 1];
				continue;
			}

			// right
			while (cur.next[i] && cur.next[i].value < value) {
				// console.info(cur.value, 'right');
				cur = cur.next[i];
			}

			if (cur.next[i] === undefined) {
				// insert at array end
				// console.info('end', i, cur.value);
				if (i < comp_height) {
					cur.next[i] = node;
				}
				continue;
			} else if (cur.next[i].value > value) {
				//insert node
				// console.info('middle', i, cur.value);
				if (i < comp_height) {
					node.next[i] = cur.next[i];
					cur.next[i] = node;
				}
				continue;
			}

			if (cur.next[i].value == value) {
				// not handle equal situation ┑(￣▽ ￣)┍
				return false;
			}
		}

		this.current_height = comp_height > this.current_height ? comp_height : this.current_height;
		this.count++;
		return true;
	};

	this.get = function (value) {
		var cur = this.head[this.current_height - 1];
		for (var level = this.current_height - 1; level >= 0; level--) {
			// console.info('out value', level, cur.next[level].value);
			// console.info(level, 'down', cur.value, this.head[level].value);
			if (cur.value > value && cur.value == this.head[level].value) {
				// down
				// console.info(level, 'head down');
				cur = this.head[level - 1];
				continue;
			}

			while (cur.value < value && cur.next[level] && cur.next[level].value <= value) {
				// console.info(level, 'right');
				// right
				cur = cur.next[level];
			}

			if (cur.value == value) {
				// console.info('value', level);
				return true;
			}
		}

		return false;
	};

	this.remove = function (value) {
		var cur = this.head[this.current_height - 1];
		for (var level = this.current_height - 1; level >= 0; level--) {
			// console.info('out value', level, cur.next[level].value);
			// console.info(level, 'down', cur.value, this.head[level].value);
			if (cur.value > value && cur.value == this.head[level].value) {
				// down
				// console.info(level, 'head down');
				cur = this.head[level - 1];
				continue;
			}

			// remove head
			if (cur.value === value && cur.value == this.head[level].value) {
				if (this.head[level].next[level]) {
					this.head[level] = this.head[level].next[level];
				} else {
					this.current_height--;
				}
				cur = cur = this.head[level - 1];
				continue;
			}
			while (cur.value < value && cur.next[level] && cur.next[level].value < value) {
				// console.info(level, 'right');
				// right
				cur = cur.next[level];
			}

			// remove right
			if (cur.next[level] && cur.next[level].value == value) {
				cur.next[level] = cur.next[level].next[level];
			}
		}
		this.count--;
	};

	// 8 empty chars
	var empty_str = '        ';
	this.format_print = function () {
		var t_pad, t;
		for (var i = this.current_height - 1; i >= 0; i--) {
			var cur = this.head[i];
			var str = '';
			t = this.head[0];
			while (cur !== undefined) {
				t_pad = '';
				while (t.value !== cur.value) {
					t_pad += empty_str;
					t = t.next[0];
				}

				curValueStr = t_pad + padding(cur.value, 8);
				str += curValueStr;

				t = t.next[0];
				cur = cur.next[i];
			}
			console.info(str);
		}

		console.info('\n')

		function padding(value, len) {
			var str = '' + value;
			while (str.length < len) {
				str = ' ' + str;
			}
			return str;
		}
	};
}

// before
// 10000,  all:  0.385s 	average:  0.0000385s
// 50000,  all:  33.807s 	average:  0.00067614s
// 100000, all:  222.621s 	average:  0.00222621s

// after
// random
// 1000000 22 952590 'all: ' '4.27s' 'average: ' '0.000004270000000000001s'
// adjust
// 1000000 19 952594 'all: ' '4.318s' 'average: ' '0.000004318s'
// fix
// 1000000 21 952485 'all: ' '4.357s' 'average: ' '0.000004357s'

var len = 1000000;
for (var j = 0; j < 10; j++) {
	var sl = new SkipList();
	// var array = [];

	var start = Date.now();
	for (var i = 0; i < len; i++) {
		var item = Math.floor(Math.random() * 10000000);
		sl.insert(item);
		// array.push(item);
		// sl.format_print();
	}
	// sl.get(array[array.length - 1]).should.equal(true);

	var use = Date.now() - start;
	console.info(len, sl.current_height, sl.count, 'all: ', use / 1000 + 's', 'average: ', use / len / 1000 + 's');
}

// sl.insert(9932533,1);
// sl.insert(2235342,1);
// sl.insert(682377,1);
// sl.insert(4277442,4);
// sl.insert(780130,1);
// sl.insert(7390122,2);
// sl.insert(2843773,2);
// sl.insert(5660138,1);
// sl.insert(6430900,1);
// sl.insert(4162296,1);
// sl.insert(4574052,1);
// sl.insert(9093293,2);
// sl.insert(6419464,1);
// sl.insert(4730794,1);
// sl.insert(4037538,1);
// sl.insert(3407180,1);
// sl.insert(3733997,3);
// sl.insert(6207283,3);
// sl.insert(8483591,1);
// sl.insert(1549574,1);
// console.info('current_height', sl.current_height);
// sl.format_print();
// sl.remove(4277442)
// sl.format_print();
// console.info(sl.current_height, sl.count);
// sl.get(4277442).should.equal(false);
process.exit(0);
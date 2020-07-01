function compare (value, operator, target) {
	// equalTo, notEqualTo, greaterThan, lessThan, greaterEqualThan or lessEqualThan
	switch (operator) {
		case 'equalTo':
			return value === target
		case 'notEqualTo':
			return value !== target
		case 'greaterThan':
			return value > target
		case 'lessThan':
			return value < target
		case 'greaterEqualThan':
			return value >= target
		case 'lessEqualThan':
			return value <= target
	}

	return false
}

exports.default = compare

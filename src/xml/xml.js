var XML_CHARACTER_MAP = {
	'&': '&amp;',
	'"': '&quot;',
	"'": '&apos;',
	'<': '&lt;',
	'>': '&gt;',
};

function escapeForXML(string) {
	return string && string.replace
		? string.replace(/([&"<>'])/g, function (str, item) {
				return XML_CHARACTER_MAP[item];
		  })
		: string;
}

var DEFAULT_INDENT = '    ';

function xml(input, indent = DEFAULT_INDENT, declaration = false) {
	var output = '';
	var interrupted = false;

	function append(interrupt, out) {
		if (out !== undefined) {
			output += out;
		}
		if (interrupt && !interrupted) {
			interrupted = true;
		}
		if (interrupt && interrupted) {
			output = '';
		}
	}

	function add(value, last = undefined) {
		format(append, resolve(value, indent, indent ? 1 : 0), last);
	}

	var end = () => null;

	function addXmlDeclaration(declaration) {
		var encoding = declaration.encoding || 'UTF-8',
			attr = { version: '1.0', encoding: encoding };

		if (declaration.standalone) {
			attr.standalone = declaration.standalone;
		}

		add({ '?xml': { _attr: attr } });
		output = output.replace('/>', '?>');
	}

	if (declaration) {
		addXmlDeclaration(declaration);
	}

	if (input && input.forEach) {
		input.forEach(function (value, i) {
			var last;
			if (i + 1 === input.length) last = end;
			add(value, last);
		});
	} else {
		add(input, end);
	}

	return output;
}

function create_indent(character, count) {
	return new Array(count || 0).join(character || '');
}

function resolve(data, indent = undefined, indent_count = undefined) {
	indent_count = indent_count || 0;
	var indent_spaces = create_indent(indent, indent_count);
	var name;
	var values = data;
	var interrupt = false;

	if (typeof data === 'object') {
		var keys = Object.keys(data);
		name = keys[0];
		values = data[name];

		if (values && values._elem) {
			values._elem.name = name;
			values._elem.icount = indent_count;
			values._elem.indent = indent;
			values._elem.indents = indent_spaces;
			values._elem.interrupt = values;
			return values._elem;
		}
	}

	var attributes = [],
		content = [];

	var isStringContent;

	function get_attributes(obj) {
		var keys = Object.keys(obj);
		keys.forEach(function (key) {
			attributes.push(attribute(key, obj[key]));
		});
	}

	switch (typeof values) {
		case 'object':
			if (values === null) break;

			if (values._attr) {
				get_attributes(values._attr);
			}

			if (values._cdata) {
				content.push(
					('<![CDATA[' + values._cdata).replace(
						/\]\]>/g,
						']]]]><![CDATA[>'
					) + ']]>'
				);
			}

			if (values.forEach) {
				isStringContent = false;
				content.push('');
				values.forEach(function (value) {
					if (typeof value == 'object') {
						var _name = Object.keys(value)[0];

						if (_name == '_attr') {
							get_attributes(value._attr);
						} else {
							content.push(
								resolve(value, indent, indent_count + 1)
							);
						}
					} else {
						content.pop();
						isStringContent = true;
						content.push(escapeForXML(value));
					}
				});
				if (!isStringContent) {
					content.push('');
				}
			}
			break;

		default:
			content.push(escapeForXML(values));
	}

	return {
		name: name,
		interrupt: interrupt,
		attributes: attributes,
		content: content,
		icount: indent_count,
		indents: indent_spaces,
		indent: indent,
	};
}

function format(append, elem, end = undefined) {
	if (typeof elem != 'object') {
		return append(false, elem);
	}

	var len = elem.interrupt ? 1 : elem.content.length;

	function proceed() {
		while (elem.content.length) {
			var value = elem.content.shift();

			if (value === undefined) continue;
			if (interrupt(value)) return;

			format(append, value);
		}

		append(
			false,
			(len > 1 ? elem.indents : '') +
				(elem.name ? '</' + elem.name + '>' : '') +
				(elem.indent && !end ? '\n' : '')
		);

		if (end) {
			end();
		}
	}

	function interrupt(value) {
		if (value.interrupt) {
			value.interrupt.append = append;
			value.interrupt.end = proceed;
			value.interrupt = false;
			append(true);
			return true;
		}
		return false;
	}

	append(
		false,
		elem.indents +
			(elem.name ? '<' + elem.name : '') +
			(elem.attributes.length ? ' ' + elem.attributes.join(' ') : '') +
			(len ? (elem.name ? '>' : '') : elem.name ? '/>' : '') +
			(elem.indent && len > 1 ? '\n' : '')
	);

	if (!len) {
		return append(false, elem.indent ? '\n' : '');
	}

	if (!interrupt(elem)) {
		proceed();
	}
}

function attribute(key, value) {
	return key + '=' + '"' + escapeForXML(value) + '"';
}

module.exports = xml;

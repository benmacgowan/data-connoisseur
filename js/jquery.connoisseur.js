/**
 *
 * Connoisseur - Generates HTML based on your Excel data and Handlebars template. Based on Mr. Data Converter (http://shancarter.github.io/mr-data-converter/) 
 *
 * Version: 0.1.0
 *
 */

if (typeof Object.create !== 'function') {
	Object.create = function(obj) {
		function F() {};
		F.prototype = obj;
		return new F();
	};
}

(function($, window, document, undefined) {
	var Connoisseur = {
		init: function(options, elem) {
			var self = this;
			self.elem = elem;
			self.$elem = $(elem);
			self.options = $.extend({}, $.fn.connoisseur.options, options);
			
			self.$dataInput = self.$elem.find(self.options.dataInput);
			self.$templateInput = self.$elem.find(self.options.templateInput).allowTabChar();
			self.$resultOutput = self.$elem.find(self.options.resultOutput);
			
			self.$templateInput.val('{{#each rows}}\n{{/each}}').keyup(function() {
				self.updateTemplate();
			});
			
			self.$templateInput.after('<script id="template" type="text/x-handlebars-template">{{#each rows}}\n{{/each}}</script>');
			
			self.$template = $('script#template');
			
			self.$elem.submit(function(e) {
				self.convertData();
				e.preventDefault();
			});
			
		}, 
		
		updateTemplate: function() {
			var self = this;
			
			self.$template.html(self.$templateInput.val());
		}, 
		
		convertData: function() {
			var self = this;
			
			self.removeFeedback('p.success', self.$resultOutput);
			
			var data = self.$dataInput.val(), 
			output = '', 
			indent = self.options.indent, 
			newLine = self.options.newLine;
			
			if(data.length > 0) {
				if(!self.options.includeWhiteSpace) {
					indent = '';
					newLine = '';
				}
				
				CSVParser.resetLog();
				
				var parseOutput = CSVParser.parse(data, self.options.headersProvided, self.options.delimiter, self.options.downcaseHeaders, self.options.upcaseHeaders), 
				dataGrid = parseOutput.dataGrid, 
				headerNames = parseOutput.headerNames, 
				headerTypes = parseOutput.headerTypes, 
				errors = parseOutput.errors;
				
				output = DataGridRenderer[self.options.outputDataType](dataGrid, headerNames, headerTypes, indent, newLine);	
				
				if(errors != '') {	
					self.displayError(errors, self.$dataInput);			
				}
				else {
					self.removeFeedback('ul.error', self.$dataInput);
					self.generateHTML(output);	
				}
			}
			else {
				self.displayError('<li>Please enter some data and try again</li>', self.$dataInput);
			}		
		}, 
		
		generateHTML: function(data) {
			var self = this;	
			
			var source = self.$template.html().replace('{{#each rows}}\n', '{{#each rows}}').replace('{{#each rows}}\t', '{{#each rows}}').replace('{{/each}}\n', '{{/each}}').replace('{{/each}}\t', '{{/each}}'), 
			template = Handlebars.compile(source), 
			context = {
				rows: JSON.parse(data)
			}, 
			resultHtml = template(context);
			
			self.$resultOutput.val(resultHtml);
			self.displaySuccess('Success! Your HTML was generated below.', self.$resultOutput);
			
		}, 
		
		displayError: function(error, $field) {
			var self = this;
			
			self.removeFeedback('ul.error', $field);
			
			if(self.options.fieldWrapper === false) {
				$field.before('<ul class="error">' + error + '</ul>');
			}
			else {
				$field.parent().before('<ul class="error">' + error + '</ul>');
			}
			
			$('html, body').animate({ scrollTop: $('ul.error').closest('fieldset').offset().top }, 1000);			
		}, 
		
		displaySuccess: function(success, $field) {
			var self = this;
			
			self.removeFeedback('p.success', $field);
			
			if(self.options.fieldWrapper === false) {
				$field.before('<p class="success">' + success + '</p>');
			}
			else {
				$field.parent().before('<p class="success">' + success + '</p>');
			}
			
			$('html, body').animate({ scrollTop: $('p.success').closest('fieldset').offset().top }, 1000);	
		}, 
		
		removeFeedback: function(selector, $field) {
			var self = this;
			
			if(self.options.fieldWrapper === false) {
				$field.prev(selector).remove();
			}
			else {
				$field.parent().prev(selector).remove();
			}
		}

	};

	$.fn.connoisseur = function( options ) {
		return this.each(function() {
			var connoisseur = Object.create(Connoisseur);			
			connoisseur.init(options, this);
			$.data(this, 'connoisseur', connoisseur);
		});
	};

	$.fn.connoisseur.options = {
		dataInput: '#data', 
		templateInput: '#template', 
		resultOutput: '#result',
		outputDataType: 'json', 
		delimiter: 'auto', 
		columnDelimiter: '\t', 
		rowDelimiter: '\n', 
		newLine: '\n', 
		indent: '  ', 
		headersProvided: true, 
		downcaseHeaders: true, 
		upcaseHeaders: false, 
		includeWhiteSpace: true, 
		useTabsForIndent: false, 
		fieldWrapper: false
	};

})(jQuery, window, document);

// Add tab functionality to textarea
(function($) {
    function pasteIntoInput(el, text) {
        el.focus();
        if (typeof el.selectionStart == "number") {
            var val = el.value;
            var selStart = el.selectionStart;
            el.value = val.slice(0, selStart) + text + val.slice(el.selectionEnd);
            el.selectionEnd = el.selectionStart = selStart + text.length;
        } else if (typeof document.selection != "undefined") {
            var textRange = document.selection.createRange();
            textRange.text = text;
            textRange.collapse(false);
            textRange.select();
        }
    }

    function allowTabChar(el) {
        $(el).keydown(function(e) {
            if (e.which == 9) {
                pasteIntoInput(this, "\t");
                return false;
            }
        });

        // For Opera, which only allows suppression of keypress events, not keydown
        $(el).keypress(function(e) {
            if (e.which == 9) {
                return false;
            }
        });
    }

    $.fn.allowTabChar = function() {
        if (this.jquery) {
            this.each(function() {
                if (this.nodeType == 1) {
                    var nodeName = this.nodeName.toLowerCase();
                    if (nodeName == "textarea" || (nodeName == "input" && this.type == "text")) {
                        allowTabChar(this);
                    }
                }
            })
        }
        return this;
    }
})(jQuery);

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});
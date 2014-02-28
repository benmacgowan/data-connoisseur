$(function() {
	var converter = $('form[role=main').connoisseur({
		fieldWrapper: true
	});
	
	$('button#sample').click(function(e) {
		var instance = converter.data('connoisseur');
		instance.$dataInput.val('NAME\tVALUE\tCOLOR\tDATE\nAlan\t12\tblue\tSep. 25, 2009\nShan\t13\t\"green\tblue\"\tSep. 27, 2009\nJohn\t45\torange\tSep. 29, 2009\nMinna\t27\tteal\tSep. 30, 2009');
		instance.$templateInput.val('{{#each rows}}\n{{name}}\n{{/each}}');
		instance.updateTemplate();
		e.preventDefault();
	});
	
	$('button.toggle-settings').click(function(e) {
		var $this = $(this);
		if($this.hasClass('active')) {
			$this.removeClass('active');
			$this.closest('fieldset').removeClass('settings-open');			
		}
		else {
			$this.addClass('active');
			$this.closest('fieldset').addClass('settings-open');
		}
		e.preventDefault();
	});
	
	$('div.settings input').change(function() {
		var options = converter.data('connoisseur').options;
			
		options.delimiter = $('input[name=delimiter]:checked').val();	
		options.headersProvided = $('input#headers-provided').prop('checked');

		if (options.headersProvided) {
			$('input[name=transform]').removeAttr('disabled');
			var transform = $('input[name=transform]:checked').val();
			if (transform === 'downcase') {
				options.downcaseHeaders = true;
				options.upcaseHeaders = false;
			} else if (transform === 'upcase') {
				options.downcaseHeaders = false;
				options.upcaseHeaders = true;
			} else if (transform === 'none') {
				options.downcaseHeaders = false;
				options.upcaseHeaders = false;
			}
		} else {
			$('input[name=transform]').attr('disabled', 'disabled');
		}	
		
	});	
});
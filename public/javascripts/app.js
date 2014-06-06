$(function() {
	$('a.delete').click(function(e) {
		if(confirm('Are you sure to delete this?')) {
			var href = $(this).attr('href')
			$.ajax({
				type: 'DELETE',
				url: href,
				success: function() {
					document.location.reload()
				}
			})
		}
		e.preventDefault();
		return false
	});
	
	
	
	
	$('.add-option-to-select').click(function(e){
		console.log('ici');
		var selectId = $(this).attr('data-target');
		var select = $('#'+selectId);
		if(select.prop("tagName") !== 'SELECT'){ select = $('#'+selectId+' select'); }
		
		if(select.prop("tagName") === 'SELECT' && select.length === 1){
			var optionText = prompt('Element to add :');
			if(optionText){
				select.append('<option value="'+optionText+'">'+optionText+'</option>');
				select.find('option[value="'+optionText+'"]').prop('selected', true);
			}
		}
	});
	
	$('.repeated-field').on('click', '.field-add', function(e){
		var fieldName = 'price';
		var $this = $(this);
		var $root = $this.parents('.repeated-field');
		var $template = $root.find('> .field-template').clone();
		var cpt = parseInt($this.attr('data-field-cpt'));
		console.log('1 -> cpt', cpt);
		if(!cpt){ cpt = $root.find('> .field-elt').length; }
		console.log('2 -> cpt', cpt);
		$this.attr('data-field-cpt', cpt+1);
		
		var htmlTemplate = $template.html();
		var newHtmlTemplate = htmlTemplate
										.replace(new RegExp('_x_', "g"), '_'+cpt+'_')
										.replace(new RegExp('\\[x\\]', "g"), '['+cpt+']');
		$(newHtmlTemplate).insertBefore($this);
		
		$this.blur();
		return false;
	});
	$('.repeated-field').on('click', '.field-remove', function(e){
		$(this).parents('.field-elt').remove();
	});
});

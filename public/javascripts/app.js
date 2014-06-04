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
		var selectId = $(this).attr('data-target');
		var select = $('#'+selectId);
		if(select.prop("tagName") === 'SELECT'){
			var optionText = prompt('Element to add :');
			select.append('<option value="'+optionText+'">'+optionText+'</option>');
			select.find('option[value="'+optionText+'"]').prop('selected', true);
		}
	});
	
	$('.price-forms').on('click', '.price-add', function(e){
		var $this = $(this);
		var $root = $this.parents('.form-inline');
		var $template = $root.find('.price-template').clone();
		var cpt = parseInt($this.attr('data-price-cpt'));
		if(!cpt){ cpt = $root.find('.price').length-1; }
		$this.attr('data-price-cpt', cpt+1);
		
		$template.removeClass('price-template').addClass('price');
		var htmlTemplate = $template.html();
		var newHtmlTemplate = htmlTemplate.replace(new RegExp('_x_', "g"), '_'+cpt+'_').replace(new RegExp('\\[x\\]', "g"), '['+cpt+']');
		var $newTemplate = $(newHtmlTemplate);
		$newTemplate.insertBefore($this);
		
		$this.blur();
		return false;
	});
	$('.price-forms').on('click', '.price-remove', function(e){
		$(this).parents('.price').remove();
	});
});

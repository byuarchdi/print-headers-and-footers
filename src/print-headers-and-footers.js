// One inch printed is 96 pixels in all browsers

var PrintHAF = (function() {

	var o = {};

	var width = 0;
	var height = 0;
	var marginTop = 0;
	var marginBottom = 0;
	var marginLeft = 0;
	var marginRight = 0;
	
	var createHeaderTemplate = function() {};
	var createFooterTemplate = function() {};
	
	var insertPrintStyles = function(width, height) {
		var style = document.createElement('style');
		
		var printQuery = document.createTextNode('@media print { @page { margin: 0; size: ' + width + 'px ' + height + 'px; } html, body { margin: 0; } }');
		
		style.appendChild(printQuery);
		
		document.body.appendChild(style);
	};
	
	o.init = function(options) {	
		if (options.size) {
			
			if (options.size === 'letter') {
				width = 8.5 * 96;
				height = 11 * 96;
			}
			
			if (options.size === 'legal') {
				width = 8.5 * 96;
				height = 14 * 96;
			}
			
			if (options.size === 'tabloid') {
				width = 17 * 96;
				height = 11 * 96;
			}
			
			//TODO these don't seem to work well because of rounding errors
			//if (options.size === 'A3') {
			//	width = 11.69 * 96;
			//	height = 16.53 * 96;
			//}
			
			//if (options.size === 'A4') {
			//	width = 8.27 * 96;
			//	height = 11.69 * 96;
			//}
			
		}
		else {
			options.width && (width = options.width);
			options.height && (height = options.height);
		}
		
		insertPrintStyles(width, height);
		
		options.marginTop && (marginTop = options.marginTop);
		options.marginBottom && (marginBottom = options.marginBottom);
		options.marginLeft && (marginLeft = options.marginLeft);
		options.marginRight && (marginRight = options.marginRight);
		
		options.createHeaderTemplate && (createHeaderTemplate = options.createHeaderTemplate);
		options.createFooterTemplate && (createFooterTemplate = options.createFooterTemplate);
	};
	
	o.print = function() {
		var headerTemplate = createHeaderTemplate();
		var footerTemplate = createFooterTemplate();
		var regionHeight = calculateRegionHeight(calculateRenderedHeight(headerTemplate), calculateRenderedHeight(footerTemplate), marginTop, marginBottom, height);
		
		var regionContainer = document.createElement('div')
		var mainContainer = document.querySelector('.haf-main-container');
		var printContainer = document.querySelector('.haf-print-container');
		
		before(mainContainer, regionContainer, printContainer);
		prepare(mainContainer, regionContainer, headerTemplate, footerTemplate, regionHeight, marginTop, marginBottom, marginLeft, marginRight, width, height).then(function() {
			window.print();
			after(mainContainer, regionContainer, printContainer);
		});
	};
	
	var calculateRenderedHeight = function(template) {
		//TODO Am I sure that this height will be the same as when the template is put into the region, position absolute versus display: block - removed from the flow versus in the flow
		var element = document.createElement('div');
		element.innerHTML = template;
		
		element.style.visibility = 'hidden';
		element.style.position = 'absolute';
		
		document.body.appendChild(element);
		var height = Math.max(element.clientHeight, element.scrollHeight, element.offsetHeight);
		element.parentNode.removeChild(element);
		
		return height;
	};
	
	var calculateRegionHeight = function(headerHeight, footerHeight, marginTop, marginBottom, height) {
		return height - (headerHeight + footerHeight + marginTop + marginBottom);	
	};
	
	var before = function(mainContainer, regionContainer, printContainer) {
		printContainer.classList.add('haf-content');
		mainContainer.classList.add('haf-hide');
		document.body.appendChild(regionContainer);
	};
	
	var prepare = function(mainContainer, regionContainer, headerTemplate, footerTemplate, regionHeight, marginTop, marginBottom, marginLeft, marginRight, width, height) {
		return new Promise(function(resolve, reject) {
			var prepareForRendering = function(templateType, template, marginTop, marginBottom, marginLeft, marginRight, width) {
				
				var element = document.createElement('div');
				element.innerHTML = template;
				
				element.style.boxSizing = 'border-box';
				
				document.body.appendChild(element);
				element.style.height = Math.max(element.clientHeight, element.scrollHeight, element.offsetHeight); //TODO Without this line, why is the height of the template a decimal pixel value? Figure out how to fix that
				element.parentNode.removeChild(element);
				
				if (templateType === 'header') {
					element.style.paddingTop = marginTop + 'px';
				}
				
				if (templateType === 'footer') {
					element.style.paddingBottom = marginBottom + 'px';
				}
				
				element.style.width = width + 'px';
				element.style.paddingLeft = marginLeft + 'px';
				element.style.paddingRight = marginRight + 'px';
				
				return element;
			};
			
			prepareRegions(mainContainer, regionContainer, prepareForRendering('header', headerTemplate, marginTop, marginBottom, marginLeft, marginRight, width), prepareForRendering('footer', footerTemplate, marginTop, marginBottom, marginLeft, marginRight, width), regionHeight, width, height).then(function() {
				resolve();
			});
		});
	};
	
	var prepareRegions = function(mainContainer, regionContainer, header, footer, regionHeight, width, height) {
		return new Promise(function(resolve, reject) {
			var createPage = function(header, footer, marginLeft, marginRight, width, height) {
				
				var createNewPage = function(width, height) {
					var page = document.createElement('div');
					
					page.style.width = width + 'px';
					page.style.height = height + 'px';
					page.style.boxSizing = 'border-box';
					page.classList.add('haf-column');
					
					//page.style.border = 'solid 1px black'
					
					return page;
				};
				
				var createRegion = function(regionHeight, width, marginLeft, marginRight) {
					
					var region = document.createElement('div');
					
					region.style.boxSizing = 'border-box';
					region.style.height = regionHeight + 'px';
					region.style.width = width + 'px';
					region.style.paddingLeft = marginLeft + 'px';
					region.style.paddingRight = marginRight + 'px';
					
					region.classList.add('haf-region');
					
					return region;
				};
				
				var page = createNewPage(width, height);
				
				page.appendChild(header.cloneNode(true));
				page.appendChild(createRegion(regionHeight, width, marginLeft, marginRight));
				page.appendChild(footer.cloneNode(true));
				
				return page;
			};
			
			var setupOversetListener = function(regionContainer, header, footer, marginLeft, marginRight, width, height) {
				document.getNamedFlow('haf-content').addEventListener('regionoversetchange', function(e) {
					
					if (e.target.overset) {
						regionContainer.appendChild(createPage(header, footer, marginLeft, marginRight, width, height));
						return;
					}
					
					resolve();
				});
			};
			
			regionContainer.appendChild(createPage(header, footer, marginLeft, marginRight, width, height));
			setupOversetListener(regionContainer, header, footer, marginLeft, marginRight, width, height);
		});
		
	};
	
	var after = function(mainContainer, regionContainer, printContainer) {
		regionContainer.parentNode.removeChild(regionContainer);
		printContainer.classList.remove('haf-content');
		mainContainer.classList.remove('haf-hide');
	};
	
	return o;
	
})();
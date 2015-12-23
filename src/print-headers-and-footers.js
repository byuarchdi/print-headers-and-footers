//TODO remember that one inch printed is 96 pixels in all browsers

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
	
	o.init = function(options) {
		var insertPrintStyles = function(width, height) {
			var style = document.createElement('style');
			
			var printQuery = document.createTextNode('@media print { @page { margin: 0; size: ' + width + 'px ' + height + 'px; } html, body { margin: 0; } }');
			
			style.appendChild(printQuery);
			
			document.body.appendChild(style);
		};
			
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
		var regionContainer = document.createElement('div')
		var mainContainer = document.querySelector('.haf-main-container');
		var printContainer = document.querySelector('.haf-print-container');
		
		before(mainContainer, regionContainer, printContainer);
		prepareRegions(regionContainer, createHeaderTemplate, createFooterTemplate, marginTop, marginBottom, marginLeft, marginRight, width, height).then(function() {
			window.print();
			after(mainContainer, regionContainer, printContainer);
		});
	};
	
	var before = function(mainContainer, regionContainer, printContainer) {
		printContainer.classList.add('haf-content');
		mainContainer.classList.add('haf-hide');
		document.body.appendChild(regionContainer);
	};
	
	var prepareRegions = function(regionContainer, createHeaderTemplate, createFooterTemplate, marginTop, marginBottom, marginLeft, marginRight, width, height) {
		return new Promise(function(resolve, reject) {
			var createPage = function(createHeaderTemplate, createFooterTemplate, marginTop, marginBottom, marginLeft, marginRight, width, height) {
				
				var createNewPage = function(width, height) {
					var page = document.createElement('div');
					
					page.style.width = width + 'px';
					page.style.height = height + 'px';
					page.style.boxSizing = 'border-box';
					page.style.display = 'flex';
					page.style.flexDirection = 'column';
					
					//page.style.border = 'solid 1px black'
					
					return page;
				};
				
				var prepareTemplate = function(templateType, templateCreator, marginTop, marginBottom, marginLeft, marginRight, width) {
					
					var element = templateCreator();
					
					element.style.boxSizing = 'border-box';
					
					document.body.appendChild(element);
					element.style.height = Math.max(element.clientHeight, element.scrollHeight, element.offsetHeight) + 'px'; //TODO Without this line, why is the height of the template a decimal pixel value? Figure out how to fix that
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
				
				var createRegion = function(preparedHeader, preparedFooter, width, marginLeft, marginRight) {
					
					var calculateRegionHeight = function(headerHeight, footerHeight, marginTop, marginBottom, height) {
						return height - (headerHeight + footerHeight + marginTop + marginBottom);	
					};
					
					var regionHeight = calculateRegionHeight(+preparedHeader.style.height.slice(0, -2), +preparedFooter.style.height.slice(0, -2), marginTop, marginBottom, height);
					
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
				var preparedHeader = prepareTemplate('header', createHeaderTemplate, marginTop, marginBottom, marginLeft, marginRight, width);
				var preparedFooter = prepareTemplate('footer', createFooterTemplate, marginTop, marginBottom, marginLeft, marginRight, width);
				
				page.appendChild(preparedHeader);
				page.appendChild(createRegion(preparedHeader, preparedFooter, width, marginLeft, marginRight));
				page.appendChild(preparedFooter);
				
				return page;
			};
			
			var setupOversetListener = function(regionContainer, createHeaderTemplate, createFooterTemplate, marginTop, marginBottom, marginLeft, marginRight, width, height) {
				document.getNamedFlow('haf-content').addEventListener('regionoversetchange', function(e) {
					
					if (e.target.overset) {
						regionContainer.appendChild(createPage(createHeaderTemplate, createFooterTemplate, marginTop, marginBottom, marginLeft, marginRight, width, height));
						return;
					}
					
					resolve();
				});
			};
			
			regionContainer.appendChild(createPage(createHeaderTemplate, createFooterTemplate, marginTop, marginBottom, marginLeft, marginRight, width, height));
			setupOversetListener(regionContainer, createHeaderTemplate, createFooterTemplate, marginTop, marginBottom, marginLeft, marginRight, width, height);
		});
		
	};
	
	var after = function(mainContainer, regionContainer, printContainer) {
		regionContainer.parentNode.removeChild(regionContainer);
		printContainer.classList.remove('haf-content');
		mainContainer.classList.remove('haf-hide');
	};
	
	return o;
	
})();
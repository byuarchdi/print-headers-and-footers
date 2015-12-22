// One inch printed is 96 pixels in all browsers

var PrintHAF = (function() {

	var o = {};
	
	var headerTemplate = '';
	var footerTemplate = '';
	var regionHeight = 0;
	var regionWidth = 0;
	var marginLeft = 0;
	var marginRight = 0;
	
	o.init = function(options) {
		headerTemplate = options.headerTemplate();
		footerTemplate = options.footerTemplate();
		regionHeight = calculateRegionHeight(calculateRenderedHeight(headerTemplate), calculateRenderedHeight(footerTemplate), options.marginTop, options.marginBottom, options.size);
		regionWidth = calculateRegionWidth(options.size);
		marginLeft = options.marginLeft;
		marginRight = options.marginRight;
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
	
	var calculateRegionHeight = function(headerHeight, footerHeight, marginTop, marginBottom, size) {
		
		if (size === 'letter') {
			return 11 * 96 - (headerHeight + footerHeight + marginTop + marginBottom);
		}		
		
	};
	
	var calculateRegionWidth = function(size) {
		
		if (size === 'letter') {
			return 8.5 * 96;
		}
		
	};
	
	o.print = function() {
		var regionContainer = document.createElement('div')
		var mainContainer = document.querySelector('.haf-main-container');
		var printContainer = document.querySelector('.haf-print-container');
		
		before(mainContainer, regionContainer, printContainer);
		prepare(mainContainer, regionContainer, headerTemplate, footerTemplate, regionHeight, regionWidth, marginLeft, marginRight).then(function() {
			window.print();
			after(mainContainer, regionContainer, printContainer);
		});
	};
	
	var before = function(mainContainer, regionContainer, printContainer) {
		printContainer.classList.add('haf-content');
		mainContainer.classList.add('haf-hide');
		document.body.appendChild(regionContainer);
	};
	
	var prepare = function(mainContainer, regionContainer, headerTemplate, footerTemplate, regionHeight, regionWidth, marginLeft, marginRight) {
		return new Promise(function(resolve, reject) {
			var prepareForRendering = function(template, regionWidth, marginLeft, marginRight) {
				
				var element = document.createElement('div');
				element.innerHTML = template;
				
				element.style.boxSizing = 'border-box';
				element.style.width = regionWidth + 'px';
				element.style.paddingLeft = marginLeft + 'px';
				element.style.paddingRight = marginRight + 'px';
				
				return element;
			};
			
			prepareRegions(mainContainer, regionContainer, prepareForRendering(headerTemplate, regionWidth, marginLeft, marginRight), prepareForRendering(footerTemplate, regionWidth, marginLeft, marginRight), regionHeight, regionWidth).then(function() {
				resolve();
			});
		});
	};
	
	var prepareRegions = function(mainContainer, regionContainer, header, footer, regionHeight, regionWidth) {
		return new Promise(function(resolve, reject) {
			var createPage = function(header, footer, regionWidth, marginLeft, marginRight) {
				
				var createNewPage = function() {
					var page = document.createElement('div');
					
					//TODO fix this based on the options size passed in by the user
					page.style.width = '8.5in';
					page.style.height = '11in';
					page.classList.add('haf-column');
					
					return page;
				};
				
				var createRegion = function(regionHeight, regionWidth, marginLeft, marginRight) {
					
					var region = document.createElement('div');
					
					region.style.boxSizing = 'border-box';
					region.style.height = regionHeight + 'px';
					region.style.width = regionWidth + 'px';
					region.style.paddingLeft = marginLeft + 'px';
					region.style.paddingRight = marginRight + 'px';
					
					region.classList.add('haf-region');
					
					return region;
				};
				
				var page = createNewPage();
				
				page.appendChild(header);
				page.appendChild(createRegion(regionHeight, regionWidth, marginLeft, marginRight));
				page.appendChild(footer);
				
				return page;
			};
			
			var setupOversetListener = function(regionContainer, header, footer, regionWidth, marginLeft, marginRight) {
				document.getNamedFlow('haf-content').addEventListener('regionoversetchange', function(e) {
					
					if (e.target.overset) {
						regionContainer.appendChild(createPage(header, footer, regionWidth, marginLeft, marginRight));
						return;
					}
					
					resolve();
				});
			};
			
			regionContainer.appendChild(createPage(header, footer, regionWidth, marginLeft, marginRight));
			setupOversetListener(regionContainer, header, footer, regionWidth, marginLeft, marginRight);
		});
		
	};
	
	var after = function(mainContainer, regionContainer, printContainer) {
		regionContainer.parentNode.removeChild(regionContainer);
		printContainer.classList.remove('haf-content');
		mainContainer.classList.remove('haf-hide');
	};
	
	return o;
	
})();
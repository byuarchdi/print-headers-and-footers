// One inch printed is 96 pixels in all browsers

var PrintHAF = (function() {

	var o = {};
	
	var headerTemplate = '';
	var footerTemplate = '';
	var pageHeight = 0;
	var pageWidth = 0;
	var marginLeft = 0;
	var marginRight = 0;
	
	o.init = function(options) {
		headerTemplate = options.headerTemplate();
		footerTemplate = options.footerTemplate();
		pageHeight = calculatePageHeight(calculateRenderedHeight(headerTemplate), calculateRenderedHeight(footerTemplate), options.marginTop, options.marginBottom, options.size);
		pageWidth = calculatePageWidth(options.size);
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
	
	var calculatePageHeight = function(headerHeight, footerHeight, marginTop, marginBottom, size) {
		
		if (size === 'letter') {
			return 11 * 96 - (headerHeight + footerHeight + marginTop + marginBottom);
		}		
		
	};
	
	var calculatePageWidth = function(size) {
		
		if (size === 'letter') {
			return 8.5 * 96;
		}
		
	};
	
	o.print = function() {
		var printContainer = document.createElement('div')
		var mainContainer = document.querySelector('.haf-main-container');
		
		before(mainContainer, printContainer);
		prepare(mainContainer, printContainer, headerTemplate, footerTemplate, pageHeight, pageWidth, marginLeft, marginRight);
		window.print();
		after(mainContainer, printContainer);
	};
	
	var before = function(mainContainer, printContainer) {
		mainContainer.classList.add('haf-hide');
		document.body.appendChild(printContainer);
	};
	
	var prepare = function(mainContainer, printContainer, headerTemplate, footerTemplate, pageHeight, pageWidth, marginLeft, marginRight) {
		
		var prepareForRendering = function(template, pageWidth, marginLeft, marginRight) {
			
			var element = document.createElement('div');
			element.innerHTML = headerTemplate;
			
			element.style.boxSizing = 'border-box';
			element.style.width = pageWidth + 'px';
			element.style.paddingLeft = marginLeft + 'px';
			element.style.paddingRight = marginRight + 'px';
			
			return element;
		};
		
		prepareRegions(mainContainer, printContainer, prepareForRendering(headerTemplate, pageWidth, marginLeft, marginRight), prepareForRendering(footerTemplate, pageWidth, marginLeft, marginRight));
		
	};
	
	var prepareRegions = function(mainContainer, printContainer, header, footer) {
		
		var createPage = function(header, footer, pageWidth, marginLeft, marginRight) {
			
			var createNewPage = function() {
				var page = document.createElement('div');
				
				page.style.width = '8.5in';
				page.style.height = '11in';
				//page.classList.add('pdf-column');
				
				return page;
			};
			
			var createRegion = function(pageWidth, marginLeft, marginRight) {
				
				var region = document.createElement('div');
				
				region.style.boxSizing = 'border-box';
				region.style.height = pageHeight + 'px';
				region.style.width = pageWidth + 'px';
				region.style.paddingLeft = marginLeft + 'px';
				region.style.paddingRight = marginRight + 'px';
				
				region.classList.add('haf-region');
				
				return region;
			};
			
			var page = createNewPage();
			
			page.appendChild(header);
			page.appendChild(createRegion(pageWidth, marginLeft, marginRight));
			page.appendChild(footer);
			
			return page;
		};
		
		var setupOversetListener = function(printContainer, header, footer, pageWidth, marginLeft, marginRight) {
			document.getNamedFlow('haf-content').addEventListener('regionoversetchange', function(e) {
				
				if (e.target.overset) {
					printContainer.appendChild(createPage(header, footer, pageWidth, marginLeft, marginRight));
					return;
				}
				
			});
		};
		
		printContainer.appendChild(createPage(header, footer, pageWidth, marginLeft, marginRight));
		setupOversetListener(printContainer, header, footer, pageWidth, marginLeft, marginRight);
		
		//adding this class starts the whole regions magic
		mainContainer.classList.add('haf-content');
		
	};
	
	var after = function(mainContainer, printContainer) {
		printContainer.parentNode.removeChild(printContainer);
		mainContainer.classList.remove('haf-content');
		mainContainer.classList.remove('haf-hide');
	};
	
	return o;
	
})();
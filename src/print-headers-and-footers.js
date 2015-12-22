var PrintHAF = (function() {

	var o = {};
	
	var headerTemplate = '';
	var footerTemplate = '';
	var pageHeight = 0;
	
	o.init = function(options) {
		headerTemplate = options.headerTemplate;
		footerTemplate = options.footerTemplate;
		pageHeight = calculatePageHeight(calculateRenderedHeight(headerTemplate), calculateRenderedHeight(footerTemplate), options.size, options.marginTop, options.marginBottom);
	};
	
	var calculateRenderedHeight = function(template) {
		//TODO Am I sure that this height will be the same as when the header is put into the region, position absolute versus display: block - removed from the flow versus in the flow
		var element = document.createElement('div');
		element.innerHTML = template;
		
		template.style.visibility = 'hidden';
		template.style.position = 'absolute';
		
		document.body.appendChild(template);
		
		var height = Math.max(template.clientHeight, template.scrollHeight, template.offsetHeight);
		
		template.parentNode.removeChild(template);
		
		return Math.max(template.clientHeight, template.scrollHeight, template.offsetHeight);
	};
	
	var calculatePageHeight = function(headerheight, size) {
		
		if (size === 'letter') {
			// One inch printed is 96 pixels in all browsers
			return 11 * 96 - headerHeight;
		}
		
	};
	
	o.print = function() {
		prepare();
		window.print();
		cleanUp();
	};
	
	var prepare = function() {
		
	};
	
	var cleanUp = function() {
		
	};
	
	var preparePageElements = function(part, headerTitle, printContainer) {
			return new Promise(function(resolve, reject) {
				
				var prepareRegions = function(part, header, footer, isPartA) {
					
					var createPage = function(firstTime, part, header, footer, isPartA) {
						
						var createPage = function() {
							var page = document.createElement('div');
							page.style.width = '8.5in';
							page.style.height = '11in';
							page.style.margin = '0 auto';
							page.classList.add('pdf-column');
							
							return page;
						};
						
						var addHeader = function(header, firstTime, isPartA, page) {
							var newHeader = header.cloneNode(true);
							
							if (isPartA && firstTime) {
								newHeader.innerHTML = '';
								newHeader.style.padding = 0;
								newHeader.style.height = '48px';
							}
							
							page.appendChild(newHeader);
						};
						
						var addRegion = function(isPartA, firstTime, part, header, footer, page) {
							var printPageHeight = 1056 - header.style.height.slice(0, -2) - footer.style.height.slice(0, -2);
							
							var region = document.createElement('div');
							
							region.style.width = '8.5in';
							region.style.height = (isPartA && firstTime) ? printPageHeight + 96 + 'px' : printPageHeight + 'px';
							region.style.boxSizing = 'border-box';
							
							part.classList.contains('pdf-part-a') && region.classList.add('pdf-part-a-region');
							part.classList.contains('pdf-part-b') && region.classList.add('pdf-part-b-region');
							part.classList.contains('pdf-part-c') && region.classList.add('pdf-part-c-region');
							part.classList.contains('pdf-part-d') && region.classList.add(part.id + '-region');
							
							page.appendChild(region);
						};
						
						var addFooter = function(footer, page) {
							var newFooter = footer.cloneNode(true);
							page.appendChild(newFooter);
						};
						
						var run = function() {
							var page = createPage();
							
							addHeader(header, firstTime, isPartA, page);
							addRegion(isPartA, firstTime, part, header, footer, page);
							addFooter(footer, page);
							
							return page;
						};
						
						return run();
					};
					
					var run = function() {
						
						var createFirstPage = function(elementToPrint, printContainer) {
							elementToPrint.appendChild(createPage(true, part, header, footer, isPartA));
							printContainer.appendChild(elementToPrint);
						};
						
						var setupOversetListener = function(part, elementToPrint) {
							
							var getFlowName = function(part) {
								
								if (part.classList.contains('pdf-part-a')) {
									return 'pdf-part-a-content';
								}
								
								if (part.classList.contains('pdf-part-b')) {
									return 'pdf-part-b-content';
								}
								
								if (part.classList.contains('pdf-part-c')) {
									return 'pdf-part-c-content';
								}
								
								if (part.classList.contains('pdf-part-d')) {
									return part.id + '-content';
								}
								
								throw 'Not a Part A, B, C, or D';
							};
							
							var temp1 = getFlowName(part);
							var temp2 = ((part.classList[0] === 'pdf-part-d') ? part.classList[1] : part.classList[0]) + '-content';
							
							document.getNamedFlow(((part.classList[0] === 'pdf-part-d') ? part.classList[1] : part.classList[0]) + '-content').addEventListener('regionoversetchange', function(e) {
								
								if (e.target.overset) {
									elementToPrint.appendChild(createPage(false, part, header, footer, isPartA));
									return;
								}
								
								resolve();
							});
						};
						
						var run = function() {
							var elementToPrint = document.createElement('div');
							
							createFirstPage(elementToPrint, printContainer);
							setupOversetListener(part, elementToPrint);
							
							//adding this class starts the whole regions magic
							part.classList.add(((part.classList[0] === 'pdf-part-d') ? part.classList[1] : part.classList[0]) + '-content');
						};
						
						run();
					};
					
					run();
				};
				
				var prepareHeader = function(headerHeight, headerTitle, smithsonianTrinomial, temporarySiteNo) {
					
					var headerTemplate = document.getElementById('pdf-header-template').content;
					var header = document.importNode(headerTemplate, true).querySelector('.temporary-template-id');
					
					header.querySelector('.pdf-header-title').innerHTML = headerTitle;
					
					header.style.boxSizing = 'border-box';
					header.style.width = 816 + 'px';
					header.style.height = headerHeight + 'px';
					header.style.padding = '.5in';
					
					header.querySelector('.pdf-header-smithsonian-trinomial').value = smithsonianTrinomial;
					header.querySelector('.pdf-header-temporary-site-no').value = temporarySiteNo;
					
					return header;
				};
				
				var prepareFooter = function(footerHeight) {
					var footer = document.createElement('div');
					
					footer.style.width = 816 + 'px';
					footer.style.height = footerHeight + 'px';
					
					return footer;
				};
				
				var containsTextToPrint = function(part) {
					
					var allPartInputs = Array.prototype.slice.call(part.querySelectorAll('input,textarea'));
					
					var i;
					for (i = 0; i < allPartInputs.length; i++) {
							
						var input = allPartInputs[i];
						
						if (input.type === 'checkbox') {
							if (input.checked) {
								return true;
							}
						}
						else {
							if (input.value) {
								return true;
							}
						}
						
					}
					
					return false;
					
				};
				
				var run = function() {
				
					var isPartA = (part.classList.contains('pdf-part-a'));
					
					var headerHeight = 144;
					var footerHeight = 48;
					
					var header = prepareHeader(headerHeight, headerTitle, smithsonianTrinomial, temporarySiteNo);
					var footer = prepareFooter(footerHeight);
					
					if (containsTextToPrint(part)) {
						prepareRegions(part, header, footer, isPartA);
					}
					else {
						resolve();
					}
					
				};
				
				run();
			});
		};
	
	return o;
	
})();
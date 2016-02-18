jQuery(document).ready(function($){
	jQuery('#ticker1').rssfeed('https://queryfeed.net/twitter?q=from%3Adavithace&geocode=&omit-direct=on&attach=on',{
		snippet: true
	});
});	


var global_date = [];
var global_media = [];
var global_content = [];
var global_tweet_id = [];
var global_blog_thumb = [];

function blogger_thumbs(json){
	var numposts = 10;
	for(var i=0;i<numposts;i++)
		{var entry=json.feed.entry[i];var posttitle=entry.title.$t;var posturl;if(i==json.feed.entry.length)break;
			for(var k=0;k<entry.link.length;k++){
				if(entry.link[k].rel=='replies'&&entry.link[k].type=='text/html'){
					var commenttext=entry.link[k].title;var commenturl=entry.link[k].href;}
	if(entry.link[k].rel=='alternate'){posturl=entry.link[k].href;break;}}
	var thumburl;
	try{thumburl=entry.media$image.url;}
	catch(error)
	{s=entry.content.$t;a=s.indexOf("<img");b=s.indexOf("src=\"",a);c=s.indexOf("\"",b+5);d=s.substr(b+5,c-b-5);if((a!=-1)&&(b!=-1)&&(c!=-1)&&(d!="")){thumburl=d;}else thumburl='no-image.jpg';}

	var urlChunks = thumburl.split('/');
	var host = urlChunks[urlChunks.length - 7];
	if (host == '2.bp.blogspot.com' || host == '3.bp.blogspot.com' || host == '4.bp.blogspot.com' || host == '1.bp.blogspot.com'){
		global_blog_thumb[i] = 'http://'+host+'/'+urlChunks[urlChunks.length - 6]+'/'+urlChunks[urlChunks.length - 5]+'/'+
						urlChunks[urlChunks.length - 4]+'/'+urlChunks[urlChunks.length - 3]+'/'+'s150'+'/'+urlChunks[urlChunks.length - 1];
	}else{
		global_blog_thumb[i] = thumburl;}
	}
}

	
(function($){

	//--------------------------------	
	$.fn.rssfeed = function(url, opts, fn) {	
	
		// Set plugin defaults
		var defaults = {
			limit: 10,
			offset: 1,
			header: true,
			titletag: 'h4',
			date: true,
			dateformat: 'datetime',
			content: true,
			snippet: true,
			media: true,
			showerror: true,
			errormsg: '',
			key: null,
			ssl: false,
			linktarget: '_self',
			linkredirect: '',
			linkcontent: false,
			sort: '',
			sortasc: true,
			historical: false
		};  
		var opts = $.extend(defaults, opts); 
		
		// Functions
		return this.each(function(i, e) {
			var $e = $(e);
			var s = '';

			// Check for SSL protocol
			if (opts.ssl) s = 's';
			
			// Add feed class to user div
			if (!$e.hasClass('rssFeed')) $e.addClass('rssFeed');
			
			// Check for valid url
			if(url == null) return false;

			// Add start offset to feed length
			if (opts.offset > 0) opts.offset -= 1;
			opts.limit += opts.offset;
			
			// Create Google Feed API address
			var api = "http"+ s +"://ajax.googleapis.com/ajax/services/feed/load?v=1.0&callback=?&q=" + encodeURIComponent(url);
			api += "&num=" + opts.limit;
			if (opts.historical) api += "&scoring=h";
			if (opts.key != null) api += "&key=" + opts.key;
			api += "&output=json_xml"

			// Send request
			$.getJSON(api, function(data){
				
				// Check for error
				if (data.responseStatus == 200) {
	
					// Process the feeds
					_process(e, data.responseData, opts);

					// Optional user callback function
					if ($.isFunction(fn)) fn.call(this,$e);
					
				} else {

					// Handle error if required
					if (opts.showerror)
						if (opts.errormsg != '') {
							var msg = opts.errormsg;
						} else {
							var msg = data.responseDetails;
						};
						$(e).html('<div class="rssError"><p>'+ msg +'</p></div>');
				};
			});				
		});
	};
	
	// Function to create HTML result
	var _process = function(e, data, opts) {

		// Get JSON feed data
		var feeds = data.feed;
		if (!feeds) {
			return false;
		}
		var rowArray = [];

		var rowIndex = 0;
		var html = '';	
		var row = 'odd';
		
		// Get XML data for media (parseXML not used as requires 1.5+)
		if (opts.media) {
			var xml = _getXMLDocument(data.xmlString);
			var xmlEntries = xml.getElementsByTagName('item');
		}
		
		// Add header if required
		if (opts.header)
			html +=	'<div class="rssHeader">' +
				'<a href="'+feeds.link+'" title="'+ feeds.description +'">'+ feeds.title +'</a>' +
				'</div>';
			
		// Add body
		html += '<div class="rssBody">' +
			'<ul>';

		// Add feeds
		for (var i=opts.offset; i<feeds.entries.length; i++) {
			
			rowIndex = i - opts.offset;
			rowArray[rowIndex] = [];

			// Get individual feed
			var entry = feeds.entries[i];
			var pubDate;
			var sort = '';
			var feedLink = entry.link;

			// Apply sort column
			switch (opts.sort) {
				case 'title':
					sort = entry.title;
					break;
				case 'date':
					sort = entry.publishedDate;
					break;
			}
			rowArray[rowIndex]['sort'] = sort;

			// Format published date
			if (entry.publishedDate) {

				var entryDate = new Date(entry.publishedDate);
				var pubDate = entryDate.toLocaleDateString() + ' ' + entryDate.toLocaleTimeString();

				switch (opts.dateformat) {
					case 'datetime':
						break;
					case 'date':
						pubDate = entryDate.toLocaleDateString();
						break;
					case 'time':
						pubDate = entryDate.toLocaleTimeString();
						break;
					case 'timeline':
						pubDate = _getLapsedTime(entryDate);
						break;
					default:
						pubDate = _formatDate(entryDate,opts.dateformat);
						break;
				}
			}
			
			// Add feed row
			if (opts.linkredirect) feedLink = encodeURIComponent(feedLink);{
			var ttitle = '<'+ opts.titletag +'><a href="'+ opts.linkredirect + feedLink +'" title="View details at '+ feeds.title +'">'+ entry.title +'</a></'+ opts.titletag +'>'
			rowArray[rowIndex]['html'] ='';
			global_tweet_id[i] = /[^/]*$/.exec(opts.linkredirect + feedLink)[0];
			}

			if (opts.date && pubDate) 
				global_date[i] = pubDate ;
			if (opts.content) {
			
				// Use feed snippet if available and optioned
				if (opts.snippet && entry.contentSnippet != '') {
					var content = entry.contentSnippet;
				} else {
					var content = entry.content;
				}

				if (opts.linkcontent) {
					content = '<a href="'+ opts.linkredirect + feedLink +'" title="View details at '+ feeds.title +'">'+ content +'</a>'
				}
				
				rowArray[rowIndex]['html'] += '<p>'+ content +'</p>';

				global_content[i] = ttitle + linkify(rowArray[rowIndex]['html']);
			}
			
			// Add any media
			if (opts.media && xmlEntries.length > 0) {
				var xmlMedia = xmlEntries[i].getElementsByTagName('enclosure');
				if (xmlMedia.length > 0) {
					rowArray[rowIndex]['html'] += '<div class="rssMedia"><div>Media files</div><ul>'
					
					for (var m=0; m<xmlMedia.length; m++) {
						var xmlUrl = xmlMedia[m].getAttribute("url");
						var xmlType = xmlMedia[m].getAttribute("type");
						var xmlSize = xmlMedia[m].getAttribute("length");
						rowArray[rowIndex]['html'] += '<li><a href="'+ xmlUrl +'" title="Download this media">'+ xmlUrl.split('/').pop() +'</a> ('+ xmlType +', '+ _formatFilesize(xmlSize) +')</li>';
						global_media[i] = xmlUrl;
						
					}
					rowArray[rowIndex]['html'] += '</ul></div>'
				}
			}
					
		}
		
		// Sort if required
		if (opts.sort) {
			rowArray.sort(function(a,b) {

				// Apply sort direction
				if (opts.sortasc) {
					var c = a['sort'];
					var d = b['sort'];
				} else {
					var c = b['sort'];
					var d = a['sort'];
				}

				if (opts.sort == 'date') {
					return new Date(c) - new Date(d);
				} else {
					c = c.toLowerCase();
					d = d.toLowerCase();
					return (c < d) ? -1 : (c > d) ? 1 : 0;
				}
			});
		}

		// Add rows to output
		$.each(rowArray, function(e) {

			html += '<li class="rssRow '+row+'">' + rowArray[e]['html'] + '</li>';

			// Alternate row classes
			if (row == 'odd') {
				row = 'even';
			} else {
				row = 'odd';
			}			
		});

		html += '</ul>' +
			'</div>'
		//HTML OUT
		//$(e).html(html);

		 //Apply target to links
		//$('a',e).attr('target',opts.linktarget);
	};
	
	var _formatFilesize = function(bytes) {
		var s = ['bytes', 'kb', 'MB', 'GB', 'TB', 'PB'];
		var e = Math.floor(Math.log(bytes)/Math.log(1024));
		return (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+s[e];
	}

	var _formatDate = function(date,mask) {

		// Convert to date and set return to the mask
		var fmtDate = new Date(date);
		date = mask;

		// Replace mask tokens
		date = date.replace('dd', _formatDigit(fmtDate.getDate()));
		date = date.replace('MMMM', _getMonthName(fmtDate.getMonth()));
		date = date.replace('MM', _formatDigit(fmtDate.getMonth()+1));
		date = date.replace('yyyy',fmtDate.getFullYear());
		date = date.replace('hh', _formatDigit(fmtDate.getHours()));
		date = date.replace('mm', _formatDigit(fmtDate.getMinutes()));
		date = date.replace('ss', _formatDigit(fmtDate.getSeconds()));

		return date;
	}

	var _formatDigit = function(digit) {
		digit += '';
		if (digit.length < 2) digit = '0' + digit;
		return digit;
	}

	var _getMonthName = function(month) {
		var name = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		return name[month];
	}

	var _getXMLDocument = function(string) {
		var browser = navigator.appName;
		var xml;
		if (browser == 'Microsoft Internet Explorer') {
			xml = new ActiveXObject('Microsoft.XMLDOM');
			xml.async = 'false';
			xml.loadXML(string);
		} else {
			xml = (new DOMParser()).parseFromString(string, 'text/xml');
		}
		return xml;
	}

	var _getLapsedTime = function(date) {
		
		// Get current date and format date parameter
		var todayDate = new Date();	
		var pastDate = new Date(date);

		// Get lasped time in seconds
		var lapsedTime = Math.round((todayDate.getTime() - pastDate.getTime())/1000)

		// Return lasped time in seconds, minutes, hours, days and weeks
		if (lapsedTime < 60) {
			return '< 1 min';
		} else if (lapsedTime < (60*60)) {
			var t = Math.round(lapsedTime / 60) - 1;
			var u = 'min';
		} else if (lapsedTime < (24*60*60)) {
			var t = Math.round(lapsedTime / 3600) - 1;
			var u = 'hour';
		} else if (lapsedTime < (7*24*60*60)) {
			var t = Math.round(lapsedTime / 86400) - 1;
			var u = 'day';
		} else {
			var t = Math.round(lapsedTime / 604800) - 1;
			var u = 'week';
		}
		
		// Check for plural units
		if (t > 1) u += 's';
		return t + ' ' + u;
	}

//---------------------------------------------------------------------------------------------------------

	SocialStreamObject = function(el, options) {
		this.create(el, options);
	};
	
	$.extend(SocialStreamObject.prototype, {
		
		version   : '1.5.7',
		
		create: function(el, options) {
		
			this.defaults = {
				feeds: {
					facebook: {
						id: '',
						intro: 'Posted',
						out: 'intro,thumb,title,text,user,share',
						text: 'content',
						thumb: true,
						comments: 3,
						image_width: 4, //3 = 600 4 = 480 5 = 320 6 = 180
						icon: 'facebook.png'
					},
					custom_facebook: {
						id: '',
						intro: 'Posted',
						out: 'intro,title,text,share',
						text: 'contentSnippet',
						icon: 'facebook.png'
					},
					twitter: {
						id: '',
						intro: 'Tweeted',
						search: 'Tweeted',
						out: 'intro,thumb,text,share',
						retweets: false,
						replies: false,
						images: '', // large w: 786 h: 346, thumb w: 150 h: 150, medium w: 600 h: 264, small w: 340 h 150
						url: 'twitter.php',
						icon: 'twitter.png'
					},

					custom_twitter: {
						id: '',
						intro: 'Tweeted',
						out: 'intro,title,text',
						text: 'contentSnippet',						
						icon: 'twitter.png'
					},

					custom_google: {
						id: '',
						intro: 'Shared',
						out: 'intro,title,text,share',
						text: 'contentSnippet',
						icon: 'google.png'
					},
					youtube: {
						id: '',
						intro: 'Uploaded,Favorite,New Video',
						search: 'Search',
						out: 'intro,thumb,title,text,user,share',
						feed: 'uploads,favorites,newsubscriptionvideos',
						thumb: 'default',
						icon: 'youtube.png'
					},
					flickr: {
						id: '',
						intro: 'Uploaded',
						out: 'intro,thumb,title,text,share',
						lang: 'en-us',
						icon: 'flickr.png'
					},
					delicious: {
						id: '',
						intro: 'Bookmarked',
						out: 'intro,thumb,title,text,user,share',
						icon: 'delicious.png'
					},
					pinterest: {
						id: '',
						intro: 'Pinned',
						out: 'intro,thumb,text,user,share',
						icon: 'pinterest.png'
					},
					rss: {
						id: '',
						intro: 'Posted',
						out: 'intro,title,text,share',
						text: 'contentSnippet',
						icon: 'rss.png'
					},
					custom_youtube: {
						id: '',
						intro: 'Posted',
						out: 'intro,title,text,share',
						text: 'contentSnippet',
						icon: 'rss.png'
					},
					custom_path: {
						id: '',
						intro: 'Posted',
						out: 'intro,title,text,share',
						text: 'contentSnippet',
						icon: 'rss.png'
					},
					lastfm: {
						id: '',
						intro: 'Listened to,Loved,Replied',
						out: 'intro,thumb,title,text,user,share',
						feed: 'recenttracks,lovedtracks,replytracker',
						icon: 'lastfm.png'
					},
					dribbble: {
						id: '',
						intro: 'Posted,Liked',
						out: 'intro,thumb,title,text,user,share',
						feed: 'shots,likes',
						icon: 'dribbble.png'
					},
					vimeo: {
						id: '',
						intro: 'Liked,Video,Appeared In,Video,Album,Channel,Group',
						out: 'intro,thumb,title,text,user,share',
						feed: 'likes,videos,appears_in,all_videos,albums,channels,groups',
						thumb: 'medium',
						stats: true,
						icon: 'vimeo.png'
					},
					stumbleupon: {
						id: '',
						intro: 'Shared,Reviewed',
						out: 'intro,thumb,title,text,user,share',
						feed: 'favorites,reviews',
						icon: 'stumbleupon.png'
					},
					deviantart: {
						id: '',
						intro: 'Deviation',
						out: 'intro,thumb,title,text,user,share',
						icon: 'deviantart.png'
					},
					tumblr: {
						id: '',
						intro: 'Posted',
						out: 'intro,title,text,user,share',
						thumb: 100,
						video: 250,
						icon: 'tumblr.png'
					},
					custom_instagram: {
						id: '',
						intro: 'Posted',
						out: 'intro,title',
						icon: 'instagram.png'
					}
				},
				remove: '',
				twitterId: '',
				days: 10,
				limit: 50,
				max: 'days',
				external: true,
				speed: 600,
				height: 550,
				wall: false,
				order: 'date',
				filter: true,
				controls: true,
				rotate: {
					direction: 'up',
					delay: 8000
				},
				transition: '0.8s',
				cache: true,
				container: 'dcsns',
				cstream: 'stream',
				content: 'dcsns-content',
				iconPath: '',
				imagePath: '',
				debug: false,
			};
			
			this.o = {}, this.timer_on = 0, this.id = 'dcsns-'+$(el).index(), this.timerId = '', this.o = $.extend(true,this.defaults,options), opt = this.o, $load = $('<div class="dcsns-loading">creating stream ...</div>');
			
			$(el).addClass(this.o.container).append('<div class="'+this.o.content+'"><ul class="'+this.o.cstream+'"></ul></div>');
			
			var $c = $('.'+this.o.content,el), $a = $('.'+this.o.cstream,el), $l = $('li',$a);

			if(opt.height > 0 && opt.wall == false){
				$c.css({height:opt.height+'px'});
			}


			if(this.o.filter == true || this.o.controls == true){
				var x = '<div class="dcsns-toolbar">';
				if(this.o.filter == true){
					x += '<ul id="dcsns-filter" class="option-set filter">';
					x += this.o.wall == true ? '<li><a id="social_all" href="#filter" data-group="dc-filter"  data-filter="*" class="selected link-all iso-active">all</a></li>' : '' ;
					var $f = $('.filter',el);
					$.each(opt.feeds, function(k,v){
						x += v.id != '' ? '<li class="active f-'+k+'"><a href="#filter" rel="'+k+'" data-group="dc-filter" data-filter=".dcsns-'+k+'"><img src="'+opt.imagePath+opt.feeds[k].icon+'" alt="" /></a></li>' : '' ;
					});
					x += '</ul>';
				}
				if(this.o.controls == true && opt.wall == false){
					var play = this.o.rotate.delay <= 0 ? '' : '<li><a href="#" class="play"></a></li>' ;
					x += '<div class="controls"><ul>'+play+'<li><a href="#" class="prev"></a></li><li><a href="#" class="next"></a></li></ul></div>';
				}
				x += '</div>';
				if(opt.wall == false){
					$(el).append(x);
				} else {
					$(el).before(x);
				}
			}
			
			if(this.o.wall == true){
				$('.dcsns-toolbar').append($load);
				this.createwall($a);
			} else {
				$c.append($load);
			}
			
			this.createstream(el,$a,0,opt.days);
			
			this.addevents(el,$a);
			
			if(this.o.rotate.delay > 0){
				this.rotate(el);
			}
			
			$load.remove();
		},
		
		createstream: function(obj,s,f1,f2){
			$.each(opt.feeds, function(k,v){
				if(opt.feeds[k].id != ''){
					var txt = [];
					$.each(opt.feeds[k].intro.split(','), function(i,v){
						v = $.trim(v);
						txt.push(v);
					});
					$.each(opt.feeds[k].id.split(','), function(i,v){
						v = $.trim(v);
						if(opt.feeds[k].feed && v.split('#').length < 2){
							if(k == 'youtube' && v.split('/').length > 1) {
								getFeed(k,v,opt.iconPath,opt.feeds[k],obj,opt,f1,f2,'posted','',i);
							} else {
								$.each(opt.feeds[k].feed.split(','), function(i,feed){
									getFeed(k,v,opt.iconPath,opt.feeds[k],obj,opt,f1,f2,txt[i],feed,i);
								});
							}
						} else {
							intro = v.split('#').length < 2 ? opt.feeds[k].intro : opt.feeds[k].search ;
							getFeed(k,v,opt.iconPath,opt.feeds[k],obj,opt,f1,f2,intro,'',i);
						}
					});
				}
			});
		},
		
		createwall: function(obj){
				obj.isotope({
					itemSelector : 'li.dcsns-li',
					transitionDuration: opt.transition,
					getSortData : {
						postDate : function( itemElem ){
							return parseInt($(itemElem).attr('rel'),10);
						}
					},
					sortBy : 'postDate'
				});
		},
		
		addevents: function(obj,$a){
			var self = this, speed = this.o.speed;
			var $container = $('.stream',obj), filters = {}
			$('.controls',obj).delegate('a','click',function(){
				var x = $(this).attr('class');
				switch(x)
				{
					case 'prev':
					self.pauseTimer();
					ticker($a,'prev',speed);
					break;
					case 'next':
					self.pauseTimer();
					ticker($a,'next',speed);
					break;
					case 'play':
					self.rotate(obj);
					$('.controls .play').removeClass('play').addClass('pause');
					break;
					case 'pause':
					self.pauseTimer();
					break;
				}
				return false;
			});
			$('.filter',obj).delegate('a','click',function(){
				if(opt.wall == false){
					var rel = $(this).attr('rel');
					if($(this).parent().hasClass('active')){
						$('.dcsns-'+rel,$a).slideUp().addClass('inactive');
						$(this).parent().animate({opacity: 0.3},400);
					} else {
						$('.dcsns-'+rel,$a).slideDown().removeClass('inactive');
						$(this).parent().animate({opacity: 1},400);
					}
					$(this).parent().toggleClass('active');
				}
				return false;
			});
			if(this.o.external){
				$a.delegate('a','click',function(){
					if(!$(this).parent().hasClass('section-share')){
						this.target = '_blank';
					}
				});
			}
		},
		rotate: function(a){
			var self = this, stream = $('.'+this.o.cstream,a), speed = this.o.speed, delay = this.o.rotate.delay, r = this.o.rotate.direction == 'up' ? 'prev' : 'next' ;
			this.timer_on = 1;
			$('.controls .play').removeClass('play').addClass('pause');
			this.timerId = setTimeout(function(){
				ticker(stream,r,speed);
				self.rotate(a);
			}, delay);
		},
		pauseTimer: function(){
			clearTimeout(this.timerId);
			this.timer_on = 0;
			$('.controls .pause').removeClass('pause').addClass('play');
		}
	});
	
	$.fn.dcSocialStream = function(options, callback){
		var d = {};
		this.each(function(){
			var s = $(this);
			d = s.data("socialtabs");
			if (!d){
				d = new SocialStreamObject(this, options, callback);
				s.data("socialtabs", d);
			}
		});
		return d;
	};

	function getFeed(type,id,path,o,obj,opt,f1,f2,intro,feed,fn){
	
		var stream = $('.stream',obj), list = [],d = '', px = 300, c = [],data, href, url, n = opt.limit, txt = [], src;
		frl = 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&output=json_xml&num='+n+'&callback=?&q=';
		
		switch (type) {
			
			case 'facebook':
			var cp = id.split('/');
			url = url = cp.length > 1 ? 'https://graph.facebook.com/'+cp[1]+'/photos?fields=id,link,from,name,picture,images,comments&limit='+n : frl + encodeURIComponent('https://www.facebook.com/feeds/page.php?id='+id+'&format=rss20');
			break;
			
			case 'twitter':
			var curl = o.url.replace(/\&#038;/gi, "&");
			var cp = id.split('/'), cq = id.split('#'), cu = o.url.split('?'), replies = o.replies == true ? '&exclude_replies=false' : '&exclude_replies=true' ;
			var param = '&include_entities=true&include_rts='+o.retweets+replies;
			url1 = cu.length > 1 ? curl + '&' : curl + '?';
			url = cp.length > 1 ? url1 + 'url=list&list_id='+cp[1]+'&per_page='+n+param : url1 + 'url=timeline&screen_name='+id+'&count='+n+param;
			if(cq.length > 1){
				var rts = o.retweets == false ? '+exclude:retweets' : '' ;
				url = url1 + 'url=search&q='+encodeURIComponent(cq[1])+'&count='+n;
			}
			break;

			case 'google': 
			n = n > 100 ? 100 : n ;
			href = 'https://plus.google.com/'+id;
			url = 'https://www.googleapis.com/plus/v1/people/'+id+'/activities/public';
			data = {key: o.api_key, maxResults: n, prettyprint: false, fields: "items(id,kind,object(attachments(displayName,fullImage,id,image,objectType,url),id,objectType,plusoners,replies,resharers,url),published,title,url,verb)"};
			break;
			
			case 'youtube': 
			var cp = id.split('/'), cq = id.split('#');
			n = n > 50 ? 50 : n ;
			href = 'https://www.youtube.com/';
			href += cq.length > 1 ? 'results?search_query='+encodeURIComponent(cq[1]) : 'user/'+id;
			href = cp.length > 1 ? 'https://www.youtube.com/playlist?list='+cp[1] : href ;
			url = 'https://gdata.youtube.com/feeds/';
			if(cp.length > 1){
				url += 'api/playlists/'+cp[1]+'?v=2&orderby=published'
			} else {
				url += cq.length > 1 ? 
				'api/videos?alt=rss&orderby=published&max-results='+n+'&racy=include&q='+encodeURIComponent(cq[1]) : 
				'base/users/'+id+'/'+feed+'?alt=rss&v=2&orderby=published&client=ytapi-youtube-profile';
			}
			url = frl + encodeURIComponent(url);
			break;		
			
			case 'flickr':
			var cq = id.split('/'), fd = cq.length > 1 ? 'groups_pool' : 'photos_public' ;
			id = cq.length > 1 ? cq[1] : id ;
			href = 'https://www.flickr.com/photos/'+id;
			url = 'https://api.flickr.com/services/feeds/'+fd+'.gne?id='+id+'&lang='+o.lang+'&format=json&jsoncallback=?';
			break;
			
			case 'delicious':
			href = 'https://www.delicious.com/'+id;
			url = 'http://feeds.delicious.com/v2/json/'+id;
			break;
			
			case 'pinterest':
			var cp = id.split('/');
			url = 'https://www.pinterest.com/'+id+'/';
			url += cp.length > 1 ? 'rss' : 'feed.rss';
			href = 'http://www.pinterest.com/'+id;
			url = frl + encodeURIComponent(url);
			break;
			
			case 'rss':
			href = id;
			url = frl + encodeURIComponent(id);
			break;
			
			case 'custom_facebook':
			href = id;
			url = frl + encodeURIComponent(id);
			break;

			case 'custom_twitter':
			href = id;
			url = frl + encodeURIComponent(id);
			break;

			case 'custom_instagram':
			href = id;
			url = frl + encodeURIComponent(id);
			break;

			case 'custom_google':
			href = id;
			url = frl + encodeURIComponent(id);
			break;

			case 'custom_youtube':
			href = id;
			url = frl + encodeURIComponent(id);
			break;

			case 'custom_path':
			href = id;
			url = frl + encodeURIComponent(id);
			break;

			case 'lastfm':
			href = 'https://www.last.fm/user/'+id;
			var ver = feed == 'lovedtracks' ? '2.0' : '1.0' ;
			url = frl + encodeURIComponent('https://ws.audioscrobbler.com/'+ver+'/user/'+id+'/'+feed+'.rss');
			break;
			
			case 'dribbble':
			href = 'https://www.dribbble.com/'+id;
			url = feed == 'likes' ? 'http://api.dribbble.com/players/'+id+'/shots/likes' : 'http://api.dribbble.com/players/'+id+'/shots' ;
			break;
			
			case 'vimeo':
			href = 'https://www.vimeo.com/'+id;
			url = 'https://vimeo.com/api/v2/'+id+'/'+feed+'.json';
			break;
			
			case 'stumbleupon':
			href = 'https://www.stumbleupon.com/stumbler/'+id;
			url = frl + encodeURIComponent('http://rss.stumbleupon.com/user/'+id+'/'+feed);
			break;
			
			case 'deviantart':
			href = 'https://'+id+'.deviantart.com';
			url = frl + encodeURIComponent('https://backend.deviantart.com/rss.xml?type=deviation&q=by%3A'+id+'+sort%3Atime+meta%3Aall');
			break;
			
			case 'tumblr':
			href = 'http://'+id+'.tumblr.com';
			url = 'http://'+id+'.tumblr.com/api/read/json?callback=?&num='+n;
			break;
			
			case 'instagram':
			href = '#';
			url = 'https://api.instagram.com/v1';
			var cp = id.substr(0,1), cq = id.split(cp), url1 = encodeURIComponent(cq[1]), qs = '', ts = 0;
			switch(cp)
			{
				case '?':
				var p = cq[1].split('/');
				qs = '&lat='+p[0]+'&lng='+p[1]+'&distance='+p[2];
				url += '/media/search';
				break;
				case '#':
				url += '/tags/'+url1+'/media/recent';
				ts = 1;
				break;
				case '!':
				url += '/users/'+url1+'/media/recent';
				break;
				case '@':
				url += '/locations/'+url1+'/media/recent';
				break;
			}
			if(o.accessToken == '' && ts == 0){
				if (location.hash) {
					o.accessToken = location.hash.split('=')[1] ;
				} else {
					location.href="https://instagram.com/oauth/authorize/?client_id="+o.clientId+"&redirect_uri="+o.redirectUrl+"&response_type=token"; 
				}
			}
			url += '?access_token='+o.accessToken+'&client_id='+o.clientId+'&count='+n+qs;
			break;
		}
		var dataType = type == 'twitter' ? 'json' : 'jsonp';
		jQuery.ajax({
			url: url,
			data: data,
			cache: opt.cache,
			dataType: dataType,
			success: function(a){
				var error = '';
				switch(type)
				{
					case 'facebook':
						if(cp.length > 1){
							a = a.data;
						} else {
							if(a.responseStatus == 200){
								a = a.responseData.feed.entries;
							} else {
								error = a.responseDetails;
							}
						}
					break;
					case 'google':
						error = a.error ? a.error : '' ;
						a = a.items;
					break;
					case 'flickr':
						a = a.items;
					break;
					case 'instagram':
						a = a.data;
					break;
					case 'twitter':
						error = a.errors ? a.errors : '' ;
						if(cq.length > 1){a = a.statuses} ;
					break;
					case 'youtube':
						if(a.responseStatus == 200){
							a = a.responseData.feed.entries;
							if(cp.length > 1){var pl = cp[0];}
						} else {
							error = a.responseDetails;
						}
					break;
					case 'dribbble':
						a = a.shots;
					break;
					case 'tumblr':
						a = a.posts;
					break;
					case 'delicious':
					break;
					case 'vimeo':
					break;
					default:
						if(a.responseStatus == 200){
							a = a.responseData.feed.entries;
						} else {
							error = a.responseDetails;
						}
					break;
				}
				if(error == ''){
					var xi = -1;
					$.each(a, function(i,item){
						if(i < n){
							
							var maxLength = 60;
							var trimmedString = item.title.substr(0, maxLength);

							switch(type)
							{
							case 'custom_facebook':
							var thetitle = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))+'... <br></br>';
							break;
							
							case 'custom_instagram_old':
							var thetitle = '<br>'+trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))+'...';
							break;

							default:
							var thetitle = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))+'...';
							break;
							}

							if(type	=='custom_instagram	'){
									var myRegex = /<img[^>]+src="(http:\/\/[^">]+)"/g;
									var test = item.content;
									myRegex.exec(test);
							}else{
									var html = [], q = item.link, u='<a href="'+href+'">'+id+'</a>', w='', x = '<a href="'+q+'">'+thetitle+'</a>', y='', z='', zz='', m='', d = item.publishedDate, sq = q, st = item.title, s = '';
							}
							switch(type)
							{	
								
								case 'rss':
								z = item[o.text];
								break;
								
								case 'rss':
								z = item[o.text];
								break;

								case 'custom_facebook':
								z = item[o.text];
								break;

								case 'custom_twitter':
								z1 = global_content[xi+1];
								z2 = '<span class="section-share"><a href="https://twitter.com/intent/tweet?in_reply_to='+ global_tweet_id[xi+1] +'" class="share-reply"></a>' +
								 	  '<a href="https://twitter.com/intent/retweet?tweet_id='+ global_tweet_id[xi+1] +'" class="share-retweet"></a>' +
								 	  '<a href="https://twitter.com/intent/favorite?tweet_id='+ global_tweet_id[xi+1] +'" class="share-favorite"></a></span>' ;
								z = z1 + z2;
								break;
								
								case 'custom_google':
								z = item[o.text];
								break;

								case 'custom_instagram':
								z = item.content	;
								break;

								case 'custom_youtube':
								var video_id = /[^=]*$/.exec(q)[0];
								z=  '<div class="container">'+
									'<iframe width="100%" height="315" src="https://www.youtube.com/embed/'+video_id+'" frameborder="0" allowfullscreen class="video">'+
									'</iframe>'+
									'</div>';
								break;

								case 'custom_path':
								var path_link = /[^/]*$/.exec(item[o.text])[0];
								path_link = path_link.trim();
								z1 = item[o.text];
								z2 =  '<span class="section-user"><b><a href="https://path.com/p/'+path_link+'">DETAILS</a></b></span>';
								z= z1+z2;
								
								break;
								
							}
							
							icon = '<a href="'+q+'"><img  src="'+path+o.icon+'" alt="" class="icon"/></a>';

							if(type == 'twitter'){
								var intent = 'https://twitter.com/intent/';
								s = '<a href="'+intent+'tweet?in_reply_to='+sq+'&via='+opt.twitterId+'" class="share-reply"></a>';
								s += '<a href="'+intent+'retweet?tweet_id='+sq+'&via='+opt.twitterId+'" class="share-retweet"></a>';
								s += '<a href="'+intent+'favorite?tweet_id='+sq+'" class="share-favorite"></a>';
							} else {
								s = share(st,sq,opt.twitterId);
							}
							xi=xi+1;
							$.each(o.out.split(','), function(i,v){
								zz += v != 'intro' ? '<span class="section-'+v+'">' : '' ;
								switch(v)
								{
									case 'intro':
									if(type == 'twitter'){
										zintro = '<span class="section-'+v+'"><a href="'+q+'">'+decodeURIComponent(intro)+'</a> <span><a href="https://twitter.com/'+un+'/status/'+item.id_str+'">'+nicetime(new Date(d).getTime(),0)+'</a></span></span>';
									} else {
										zintro = '<span class="section-'+v+'"><a href="'+q+'">'+decodeURIComponent(intro)+'</a> <span>'+nicetime(new Date(d).getTime(),0)+'</span></span>';
									}
									break;
									case 'title':
									zz += x;
									break;
									case 'thumb':
									//if(type == 'rss'){
										var src = item.content.indexOf("img") >= 0 ? $('img',item.content).attr('src') : '' ;
										y = src ? '<a href="'+q+'" class="thumb"><img align="middle" height="auto" width="100%" src="'+src+'" alt="" /></a>' : '' ;
									//}
									zz += y;
									break;

									case 'blogger_thumb':
									y = ' <a href="'+q+'" class="thumb"><img align="middle" height="auto" width="100%" src="'+global_blog_thumb[xi]+'" alt="" style="border: 1px solid #ccc;"/></a>' ;
									zz += y;
									break;
									
									case 'fb_thumb':
									var src = item.content.indexOf("img") >= 0 ? $('img',item.content).attr('src') : '' ;
									if (q.indexOf('youtube.com/watch') > -1) {
									var video_id = /[^=]*$/.exec(q)[0];
										y =  '<div class="container">'+
											'<iframe width="100%" height="315" src="https://www.youtube.com/embed/'+video_id+'" frameborder="0" allowfullscreen class="video">'+
											'</iframe>'+
											'</div>';
									} else{
										y = src ? ' <a href="'+q+'" class="thumb"><img height="auto" width="50%" src="'+src+'" alt="" style="border: 1px solid #ccc;"/></a>' : '' ;
									}
									zz += y;
									break;

									case 'thumb_insta':
									//var src = item.content.indexOf("img") >= 1 ? $('img',item.content).attr('src').length : '' ;
									var src = $('img',item.content).map(function() { return this.src; }).get();
									y = src ? '<a href="'+q+'" class="thumb"><img align="middle" height="auto" width="100%" src="'+src+'" alt="" style="border: 1px solid #ccc;"/></a>' : '' ;
									zz += y;
									break;


									case 'thumb_gplus':
									var src = item.content.indexOf("img") >= 0 ? $('img',item.content).attr('src') : '' ;

										var urlChunks = src.split('/');
										var host = urlChunks[urlChunks.length - 7];
										if (host == '2.bp.blogspot.com' || host == '3.bp.blogspot.com' || host == '4.bp.blogspot.com' || host == '1.bp.blogspot.com'){
											gthumb = 'http://'+host+'/'+urlChunks[urlChunks.length - 6]+'/'+urlChunks[urlChunks.length - 5]+'/'+
															urlChunks[urlChunks.length - 4]+'/'+urlChunks[urlChunks.length - 3]+'/'+'s150'+'/'+urlChunks[urlChunks.length - 1];
										}else{
											gthumb = src ;
										}

									y = src ? '<a href="'+q+'" class="thumb"><img align="middle" height="auto" width="100%" src="'+gthumb+'" alt="" style="border: 1px solid #ccc;"/></a>' : '' ;
									zz += y;
									break;


									case 'thumb_enc':
									var src = item.content.indexOf("img") >= 0 ? $('img',item.content).attr('src') : '' ;
									y = src ? '<a href="'+q+'" ><img height="auto" width="10%" src="'+src+'" /></a>' : '' ;
									if(typeof global_media[xi] === 'undefined'){
										yz = '';
										y='';
									}else{
										// :small hanya berlaku utk twitter
									yz = '<a href="'+q+'" class="thumb"><img height="auto" width="70%" src="'+global_media[xi]+':thumb" alt="" style="border: 1px solid #ccc;"/></a>' ;
									}
									yc = '<div><i>'+ global_date[xi] +'</i></div>';
									zz += y+yz+yc;

									break;

									case 'text':
									zz += z;
									break;
									case 'user':
									zz += u;
									break;
									case 'meta':
									zz += m;
									break;
									case 'share':
									zz += s;
									break;
								}
								zz += v != 'intro' ? '</span>' : '' ;
							});
							
							var df = type == 'instagram' ? nicetime(d,1) : nicetime(new Date(d).getTime(),1);
							var ob = df;
							switch(opt.order)
							{
								case 'random':
								ob = randomish(6);
								break;
								case 'none':
								ob = 1;
								break;
							}
							var out = '<li rel="'+ob+'" class="dcsns-li dcsns-'+type+' dcsns-feed-'+fn+'" style="width:100%">'+w+'<div class="inner">'+zz+'<span class="clear"></span></div>'+zintro+'</li>', str = opt.remove;
							
							if( str.indexOf( q ) !== -1 && q != '' ){
								n = n + 1;
							} else {
								if(opt.max == 'days'){
									if(df <= f2 * 86400 && df >= f1 * 86400){
										list.push(out);
									} else if(df > f2 * 86400) {
										return false;
									}
								} else {
									list.push(out);
								}
							}
						}
					});
				} else if(opt.debug == true){
					list.push('<li class="dcsns-li dcsns-error">Error. '+error+'</li>');
				}
			},
			complete: function(){
				var $newItems = $(list.join(''));
				if(opt.wall == true){
					stream.isotope( 'insert', $newItems );					
				} else {
					stream.append($newItems);
					sortstream(stream,'asc');
				}
				if(type == 'facebook' && cp.length < 2){
					fbHrefLink(id,$newItems);
				} else if(type == 'flickr' && cq.length > 1){
					flickrHrefLink(cq[1],$newItems);
				}
			}
			
		});
		return;
	}

	function linkify(text){
		text = text.replace(
			/((https?\:\/\/)|(www\.)|(pic\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi,
			function(url){
				if( url.length >= 30){
				full_urlx = url;
				url = url.substring(0, 30);
				}else{
					var full_urlx = !url.match('^https?:\/\/') ? 'http://' + url : url ;
				}
				return '<a href="' + full_urlx + '">' + url + '</a>';
			}
		);
		text = text.replace(/(^|\s)@(\w+)/g, '$1@<a href="http://www.twitter.com/$2">$2</a>');
		//text = text.replace(/(^|\s)#(\w+)/g, '$1#<a href="http://twitter.com/search/%23$2">$2</a>');
		return text;
	}
	
	function htmlEncode(v){
		return $('<div/>').text(v).html();
	}
	
	function stripHtml(v){
		var $html = $(v);
		return $html.text();
	}

	Date.prototype.setRFC3339 = function(dString){
	   var utcOffset, offsetSplitChar;
	   var offsetMultiplier = 1;
	   var dateTime = dString.split('T');
	   var date = dateTime[0].split('-');
	   var time = dateTime[1].split(':');
	   var offsetField = time[time.length - 1];
	   var offsetString;
	   offsetFieldIdentifier = offsetField.charAt(offsetField.length - 1);
	   if (offsetFieldIdentifier == 'Z') {
		  utcOffset = 0;
		  time[time.length - 1] = offsetField.substr(0, offsetField.length - 2);
	   } else {
		  if (offsetField[offsetField.length - 1].indexOf('+') != -1) {
			 offsetSplitChar = '+';
			 offsetMultiplier = 1;
		  } else {
			 offsetSplitChar = '-';
			 offsetMultiplier = -1;
		  }
		  offsetString = offsetField.split(offsetSplitChar);
		  time[time.length - 1] == offsetString[0];
		  offsetString = offsetString[1].split(':');
		  utcOffset = (offsetString[0] * 60) + offsetString[1];
		  utcOffset = utcOffset * 60 * 1000;
	   }
	   this.setTime(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], time[2]) + (utcOffset * offsetMultiplier ));
	   return this;
	};
	
	Date.prototype.setFbAlbum = function(dString){
	   var utcOffset, offsetSplitChar = '+', offsetMultiplier = 1, dateTime = dString.split('T'), date = dateTime[0].split('-'), time = dateTime[1].split(':'), offsetField = time[time.length - 1], offsetString;
		  if (offsetField[offsetField.length - 1].indexOf('+') != -1) {
			 offsetSplitChar = '-';
			 offsetMultiplier = -1;
		  }
		  offsetTime = offsetField.split(offsetSplitChar);
		  utcOffset = parseInt((offsetTime[1]/100),10) * 60 * 1000;
	   this.setTime(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], offsetTime[0]) + (utcOffset * offsetMultiplier ));
	   return this;
	};
	
	Date.prototype.setVimeo = function(dString){
	   var utcOffset = 0, offsetSplitChar, offsetMultiplier = 1;
	   var dateTime = dString.split(' ');
	   var date = dateTime[0].split('-');
	   var time = dateTime[1].split(':');
	   this.setTime(Date.UTC(date[0], date[1] - 1, date[2], time[0], time[1], time[2]) + (utcOffset * offsetMultiplier ));
	   return this;
	};

	function parseTwitterDate(a){
		var out = !!navigator.userAgent.match(/Trident\/7\./) || navigator.userAgent.indexOf("MSIE")>= 0 ? a.replace(/(\+\S+) (.*)/, '$2 $1') : a ; 
		return out;
	}
	
	function nicetime(a,out){
        var d = Math.round((+new Date - a) / 1000), fuzzy = '', n = 'mins';
        if(out == 1) {
            return d;
        } else if(out == 0) {
            var chunks = new Array();
                    chunks[0] = [60 * 60 * 24 * 365 , 'year', 'years'];
                    chunks[1] = [60 * 60 * 24 * 30 , 'month', 'months'];
                    chunks[2] = [60 * 60 * 24 * 7, 'week', 'weeks'];
                    chunks[3] = [60 * 60 * 24 , 'day', 'days'];
                    chunks[4] = [60 * 60 , 'hr', 'hrs'];
                    chunks[5] = [60 , 'min', 'mins'];
                    var i = 0, j = chunks.length;
                    for (i = 0; i < j; i++) {
                        s = chunks[i][0];
                        if ((xj = Math.floor(d / s)) != 0)
                        {
                            n = xj == 1 ? chunks[i][1] : chunks[i][2] ;
                            break;
                        }
                    }
                    fuzzy += xj == 1 ? '1 '+n : xj+' '+n ;
                    if (i + 1 < j) {
                        s2 = chunks[i + 1][0];
                        if ( ((xj2 = Math.floor((d - (s * xj)) / s2)) != 0) )
                        {
                            n2 = (xj2 == 1) ? chunks[i + 1][1] : chunks[i + 1][2] ;
                            fuzzy += (xj2 == 1) ? ' + 1 '+n2 : ' + '+xj2+' '+n2 ;
                        }
                    }
					fuzzy += ' ago';
            return fuzzy;
            }
        }

		function num(a){
            var b = a;
            if (a > 999999) b = Math.floor(a / 1E6) + "M";
            else if (a > 9999) b = Math.floor(a / 1E3) + "K";
            else if (a > 999) b = Math.floor(a / 1E3) + "," + a % 1E3;
            return b
        }
		
		function parseQ(url){
			var v = [], hash, q = url.split('?')[1];
			if(q != undefined){
				q = q.split('&');
				for(var i = 0; i < q.length; i++){
					hash = q[i].split('=');
					v.push(hash[1]);
					v[hash[0]] = hash[1];
				}
			}
			return v;
		}
		
		function getImg(content){
			var imgArr = new Array(), reg = /<img .*?srcx=["\']([^ ^"^\']*)["\']/gi, check, image;
			while (check = reg.exec(content)){
				imgArr.push(check[1]);
			}
			if(imgArr.length > 0 && imgArr[0].indexOf('sndcdn.com') === -1){
				var image = imgArr[0];
				if(image.indexOf('instagram.com/profiles') !== -1) { image = imgArr[1]; }
				image = image.replace("_m.jpg", ".jpg");
				if(image.indexOf('fbcdn') == -1) {
					image = image.replace("_b.jpg", "_f.jpg");
					image = image.replace("_b.png", "_f.png");
				} else {
					if(image.indexOf('safe_image.php') == -1) {
						var id = image.split("_"), object_id = id[1];
						image = 'http://graph.facebook.com/'+object_id+'/picture?type=normal';
					}
				}
				image = image.replace("_s.jpg", "_b.jpg");
				image = image.replace("_m.png", ".png");
				image = image.replace("_s.png", "_b.png");
				image = image.replace(/\&amp;/g,'&');
				if(image.indexOf('safe_image.php') != -1){
					image = unescape(image.match(/url=([^&]+)/)[1]);
				}
				if(image.indexOf('app_full_proxy.php') != -1){
					image = unescape(image.match(/srcx=([^&]+)/)[1]);
				}
				if(this.prefix == 'https://'){
					var image_tmp = image.replace('http://', 'https://');
					image = image_tmp;
				}
			} else {
				return false
			}
			return image;
		}
		
		function sortstream(obj,d){
			var $l = $('li',obj);
			$l.sort(function(a, b){
				var keyA = parseInt($(a).attr('rel'),10), keyB = parseInt($(b).attr('rel'),10);
				if(d == 'asc'){
					return (keyA > keyB) ? 1 : -1;
				} else {
					return (keyA < keyB) ? 1 : -1;
				}
				return 0;
			});
			$.each($l, function(index, row){
				obj.append(row);
			});
			$('.dcsns-loading').slideUp().remove();
			return;
		}
		
		function randomish(l){
			var i = 0, out = '';
			while(i < l){
				out += Math.floor((Math.random()*10)+1)+'';
				i++;
			}
			return out;
		}
		
		function ticker(s,b,speed){
			var $a = $('li:last',s),$b = $('li:first',s),$gx,bh = $b.outerHeight(true);
			if($('li',s).not('.inactive').length > 2){
				if(b == 'next'){
					$gx = $a.clone().hide();
					$b.before($gx);
					$a.remove();
					if($a.hasClass('inactive')){
						ticker(s,b,speed);
					} else {
						$('.inner',$gx).css({opacity: 0});
						$gx.slideDown(speed,'linear',function(){
							$('.inner',this).animate({opacity: 1},speed);
						});
						return;
					}
				} else {
					$gx = $b.clone();
					if($b.hasClass('inactive')){
						$a.after($gx);
						$b.remove();
						ticker(s,b,speed);
					} else {
						$b.animate({marginTop: -bh+'px'},speed,'linear',function(){
							$a.after($gx);
							$b.remove();
						});
						$('.inner',$b).animate({opacity: 0},speed);
					}
				}
			}
		}

		function fbHrefLink(id,obj){
			jQuery.ajax({
				url: 'https://graph.facebook.com/'+id,
				dataType: 'jsonp',
				success: function(a){
					$('.icon',obj).each(function(){
						$(this).parent().attr('href',a.link);
					});
					$('.section-user a',obj).each(function(){
						$(this).attr('href',a.link);
						$(this).text(a.name);
					});
				}
			});
		}
		
		function flickrHrefLink(id,obj){
			jQuery.ajax({
				url: 'http://api.flickr.com/services/feeds/groups_pool.gne?id='+id+'&format=json&jsoncallback=?',
				dataType: 'jsonp',
				success: function(a){
					$('.icon',obj).each(function(){
						$(this).parent().attr('href',a.link);
					});
				}
			});
		}
		
		function share(st,sq,twitterId){
			var s = '', sq = encodeURIComponent(sq), st = encodeURIComponent(st);
			s = '<a href="http://www.facebook.com/sharer.php?u='+sq+'&t='+st+'" class="share-facebook"></a>';
			s += '<a href="https://twitter.com/share?url='+sq+'&text='+st+'&via='+twitterId+'" class="share-twitter"></a>';
			s += '<a href="https://plus.google.com/share?url='+sq+'" class="share-google"></a>';
			s += '<a href="http://www.linkedin.com/shareArticle?mini=true&url='+sq+'&title='+st+'" class="share-linkedin"></a>';
			return s;
        }       
})(jQuery);

jQuery(window).load(function(){
	jQuery.getScript("//platform.twitter.com/widgets.js", function(){});
	jQuery('.section-share a').click(function(){
		var u = jQuery(this).attr('href');
		window.open(u,'sharer','toolbar=0,status=0,width=626,height=436');
		return false;
	});
	jQuery('.dcsns-facebook .section-text a').each(function(i){
		var txt = jQuery(this).attr('href');
		var href = decodeURIComponent(txt.replace("http://l.facebook.com/l.php?u=", "")).split('&');
		jQuery(this).attr('href',href[0]);
		txt = jQuery(this).attr('href');
		href = decodeURIComponent(txt.replace("https://www.facebook.com/l.php?u=", "")).split('&');
		jQuery(this).attr('href',href[0]);
	});
	jQuery('.dcsns-facebook .section-text a img').each(function(i){
		if(jQuery(this).parent().attr('href').split('http').length < 2){jQuery(this).parent().attr('href','https://facebook.com'+jQuery(this).parent().attr('href'));}
	});

	jQuery('#social-stream').dcSocialStream({
		feeds: {
			custom_twitter: {
				id: 'https://queryfeed.net/twitter?q=from%3Adavithace&geocode=&omit-direct=on&attach=on',
				intro: 'Tweet',
				out: 'intro,text,thumb_enc',
				text: 'contentSnippet',
				icon: 'twitter.png'
			},
			rss: {
				id: 'http://www.davidprasetyo.com/feeds/posts/default?orderby=published',
				intro: 'Posted',
				out: 'intro,blogger_thumb,title,text,share',
				text: 'contentSnippet',
				icon: 'rss.png'
			},
			custom_facebook: {
				id: 'http://fbrss.com/feed/6009f36b4453aff3508cd06c4615daeee8b15f0d.xml?me',
				intro: 'Posted',
				out: 'intro,fb_thumb,title,text,share',
				text: 'contentSnippet',
				icon: 'facebook.png'
			},
			custom_google: {
				id: 'http://gplusrss.com/rss/feed/535ea2b438c297f5dfa7508ba13b7c385453031f101c4',
				intro: 'Posted',
				out: 'intro,thumb_gplus,text,share',
				text: 'contentSnippet',
				icon: 'google.png'
			},

			custom_instagram: {
				id: 'http://widget.websta.me/rss/n/davithace',
				intro: 'Posted',
				out: 'thumb_insta,text',
				text: 'contentSnippet',
				icon: 'instagram.png',
			},

			custom_youtube: {
				id: 'https://www.youtube.com/feeds/videos.xml?user=davidprasetyo19',
				intro: 'Uploaded',
				out: 'intro,thumb,title,text',
				icon: 'youtube.png'
			},

			custom_path: {
				id: 'https://queryfeed.net/twitter?q=path.com+from%3Adavithace&geocode=',
				intro: 'Updated',
				out: 'intro,text',
				icon: 'pinterest.png'
			},
		},
		rotate: {
			delay: 0
		},
		twitterId: 'davithace',
		control: false,
		filter: true,
		wall: true,
		center: true,
		cache: true,
		max: 'limit',
		limit: 10,
		iconPath: 'https://davithace.github.io/davidprasetyo/images/dcsns-dark/',
		imagePath: 'https://davithace.github.io/davidprasetyo/images/dcsns-dark/'
	});
document.getElementById('social_all').click();
});


jQuery(window).load(function(){
setTimeout(
    function() {
     jQuery('#social_all').click();
      //alert("aw");
    }, 5000);

	
});
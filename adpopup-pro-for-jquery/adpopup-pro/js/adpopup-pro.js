
/*
 * adPopup Pro - for jQuery 1.5+
 * http://rikdevos.com
 *
 * Copyright 2012, Rik de Vos
 * You need to buy a license if you want use this script.
 * http://codecanyon.net/wiki/buying/howto-buying/licensing/
 *
 * Version: 1.0 (Aug 28 2012)
 */

(function($){
	$.fn.extend({
		adPopupPro: function() {
			
			var defaults = {
				
				show_type: 'always', //'always', 'first_visit', 'session', 'day', 'month', 'year', 'chance', 'never'
				show_chance: 1,
				mobile: true,
				tablets: true,
				min_screen_size: '0x0', //'0x0', 640x480', '800x600', '960x640', '1024x768', '1280x720', '1920x1080'
				internet_explorer: 'normal',//'normal', only_ie6_below', 'only_ie7_below', 'only_ie8_below', 'only_ie', 'no_ie'
				os: '', //'normal', 'only_windows', 'no_windows', only_mac', 'no_mac', 'only_linux', 'no_linux'
				cookie_id: '1234',

				width: 400,
				height: 300,
				
				show_close_button: true,
				close_button: 'dark', //'dark', 'light'
				popup_color: 'light', //'dark', 'light'
				popup_shadow: true,
				overlay_opacity: 0.5,
				overlay_color: 'light', //'dark', 'light'
				overlay_close: true,
				escape_close: true,
				auto_close_after: false, //in miliseconds

				ads: {},


			};
			
			var attr = arguments[0] || {};
			
			//Set the defaults if the options are undefined
			if(typeof(attr.show_type) === "undefined") { attr.show_type = defaults.show_type; }
			if(typeof(attr.show_chance) === "undefined") { attr.show_chance = defaults.show_chance; }
			if(typeof(attr.mobile) === "undefined") { attr.mobile = defaults.mobile; }
			if(typeof(attr.tablets) === "undefined") { attr.tablets = defaults.tablets; }
			if(typeof(attr.min_screen_size) === "undefined") { attr.min_screen_size = defaults.min_screen_size; }
			if(typeof(attr.internet_explorer) === "undefined") { attr.internet_explorer = defaults.internet_explorer; }
			if(typeof(attr.os) === "undefined") { attr.os = defaults.os; }
			if(typeof(attr.cookie_id) === "undefined") { attr.cookie_id = defaults.cookie_id; }

			if(typeof(attr.width) === "undefined") { attr.width = defaults.width; }
			if(typeof(attr.height) === "undefined") { attr.height = defaults.height; }

			if(typeof(attr.show_close_button) === "undefined") { attr.show_close_button = defaults.show_close_button; }
			if(typeof(attr.close_button) === "undefined") { attr.close_button = defaults.close_button; }
			if(typeof(attr.popup_color) === "undefined") { attr.popup_color = defaults.popup_color; }
			if(typeof(attr.popup_shadow) === "undefined") { attr.popup_shadow = defaults.popup_shadow; }
			if(typeof(attr.overlay_opacity) === "undefined") { attr.overlay_opacity = defaults.overlay_opacity; }
			if(typeof(attr.overlay_color) === "undefined") { attr.overlay_color = defaults.overlay_color; }
			if(typeof(attr.overlay_close) === "undefined") { attr.overlay_close = defaults.overlay_close; }
			if(typeof(attr.escape_close) === "undefined") { attr.escape_close = defaults.escape_close; }
			if(typeof(attr.auto_close_after) === "undefined") { attr.auto_close_after = defaults.auto_close_after; }

			if(typeof(attr.ads) === "undefined") { attr.ads = defaults.ads; }
			
			this.each(function() {

				check_session_cookie(attr);

				if(!allowed_show(attr)) {
					return false;
				}

				var $body = $(this),
					ads = attr.ads,
					ad = random_ad(ads);
					
				var $overlay = $('<div class="adpopup-overlay"></div>');
				var $popup = $('<div class="adpopup"></div>');
				var $popup_close = $('<a href="#" title="Close" class="adpopup-close"></a>');

				$overlay
					.css('opacity', attr.overlay_opacity)
					.addClass('adpopup-style-overlay-'+attr.overlay_color)
					.click(function() {
						if(attr.overlay_close) {
							close_popup($popup, $overlay);
						}
					});

				$popup
					.addClass('adpopup-style-bg-'+attr.popup_color)
					.addClass('adpopup-style-close-'+attr.close_button)
					.css({
						width: attr.width,
						height: attr.height,
						left: ($(window).width()-attr.width-40)/2
					});

					var $popup_html = render_ad(ad, attr);
					$popup_html.appendTo($popup);


				$popup_close
					.click(function() {
						close_popup($popup, $overlay);
						return false;
					});

				if(attr.show_close_button) {
					$popup_close.prependTo($popup);
				}
				

				$(window).resize(function() {
					$popup.css('left', ($(window).width()-attr.width-40)/2);
				});

				if(attr.escape_close) {
					$(document).keyup(function(e) {
						if(e.keyCode === 27) {
							close_popup($popup, $overlay);
						}
					});
				}

				if(attr.auto_close_after !== false) {
					setTimeout(function() {
						close_popup($popup, $overlay);
					}, attr.auto_close_after);
				}


				$popup.prependTo($body);
				$overlay.prependTo($body);


				set_popup_cookie(attr);
				
			});
			
			return this;
		}
		
	});

	function close_popup($popup, $overlay) {
		$popup.fadeOut(500, function() { $popup.remove(); $overlay.fadeOut(500); });
	}

	function set_popup_cookie(attr) {

		$.cookie('adpopup_'+attr.cookie_id, get_time(), { expires: -1, path: '/' }); //remove old cookie

		if(attr.show_type === 'session') {
			$.cookie('adpopup_'+attr.cookie_id, get_time(), { path: '/' });
		}else {
			$.cookie('adpopup_'+attr.cookie_id, get_time(), { expires: 999999, path: '/' });
		}
		
	}

	function check_session_cookie(attr) {

		if(attr.show_type === 'session' && $.cookie('adpopup_'+attr.cookie_id)) {
			set_popup_cookie(attr);
		}

	}

	function allowed_show(attr) {

		var last = (cookie_exists(attr.cookie_id)) ? get_time()-cookie_value(attr.cookie_id) : get_time();

		switch (attr.show_type) {

			case 'always':
				break;

			case 'never':
				return false;
				break;

			case 'first_visit':
				if(cookie_exists(attr.cookie_id)) {
					return false;
				}
				break;

			case 'session':
				if(cookie_exists(attr.cookie_id)) {
					return false;
				}
				break;

			case 'day':
				if(last < 3600*24) {
					return false;
				}
				break;

			case 'week':
				if(last < 3600*24*7) {
					return false;
				}
				break;

			case 'month':
				if(last < 3600*24*30) {
					return false;
				}
				break;

			case 'year':
				if(last < 3600*24*365.25) {
					return false;
				}
				break;

			case 'chance':

				if(randomInt(1,attr.show_chance) !== 1) {
					return false;
				}
				break;

			default:
				return false;
				break;

		}

		if(!attr.mobile) {
			var agent = navigator.userAgent;
			if(agent.match(/iPhone|iPod|iPhone|Android|BlackBerry/)) {
				return false;
			}
		}

		if(!attr.tablets) {
			var agent = navigator.userAgent;
			if(agent.match(/iPad/)) {
				return false;
			}
		}

		var min_screen = attr.min_screen_size.split('x'),
			min_screen_x = parseFloat(min_screen[0]),
			min_screen_y = parseFloat(min_screen[1]),
			screen_x = $(window).width(),
			screen_y = $(window).height();

		if(!(screen_x >= min_screen_x && screen_y >= min_screen_y) && !(screen_x >= min_screen_y && screen_y >= min_screen_x)) {
			return false;
		}

		if(attr.os !== 'normal') {
			var os_windows = (navigator.appVersion.indexOf("Win")!=-1) ? true : false,
				os_mac = (navigator.appVersion.indexOf("Mac")!=-1) ? true : false,
				os_linux = (navigator.appVersion.indexOf("Linux")!=-1) ? true : false;

			switch(attr.os) {

				case 'only_mac':
					if(os_windows || os_linux || !os_mac) {
						return false;
					}
					break;

				case 'no_mac':
					if(os_mac) {
						return false;
					}
					break;

				case 'only_windows':
					if(os_mac || os_linux || !os_windows) {
						return false;
					}
					break;

				case 'no_windows':
					if(os_windows) {
						return false;
					}
					break;

				case 'only_linux':
					if(os_mac || os_windows || !os_linux) {
						return false;
					}
					break;

				case 'no_linux':
					if(os_linux) {
						return false;
					}
					break;

			}
		}

		if(attr.internet_explorer !== 'normal') {

			var version = get_ie_version();

			switch(attr.internet_explorer) {

				case 'no_ie':

					if(version) {
						return false;
					}
					break;

				case 'only_ie':

					if(!version) {
						return false;
					}
					break;

				case 'only_ie6_below':
					if(version > 6) {
						return false;
					}
					break;

				case 'only_ie7_below':
					if(version > 7) {
						return false;
					}
					break;

				case 'only_ie8_below':
					if(version > 8) {
						return false;
					}
					break;

			}

		}

		return true;

	}

	function cookie_value(cookie_id) {
		return $.cookie('adpopup_'+cookie_id);
	}

	function cookie_exists(cookie_id) {
		if($.cookie('adpopup_'+cookie_id)) {
			return true;
		}else {
			return false;
		}
	}

	function random_ad(ads) {
		var num_ads = get_obj_length(ads),
			active_ad_id = randomInt(0, num_ads-1),
			active_ad = {},
			i = 0;

		for(key in ads) {
			if(ads[key]['type'] == 'jquery') {
				ads[key]['elem'].hide();
			}
		}

		for(key in ads) {
			if(i === active_ad_id) {
				ads[key]['name'] = key;
				return ads[key];
			}
			i++;
		}
	}

	function render_ad(ad, attr) {

		var html = '';

		switch (ad.type) {

			case 'html':

				ad.html = (ad.html == undefined) ? '' : ad.html;

				html += ad.html;
				break;

			case 'image':

				ad.src = (ad.src == undefined) ? '' : ad.src;
				ad.link = (ad.link == undefined) ? false : ad.link;

				if(ad.link) {
					html += '<a target="_blank" href="'+ad.link+'">';
				}

				html += '<img src="'+ad.src+'" />';

				if(ad.link) {
					html += '</a>';
				}

				break;

			case 'youtube':

				var video_id = (ad.video == undefined) ? '' : youtube_videoid(ad.video);

				html += '<iframe src="http://www.youtube.com/embed/'+video_id+'" frameborder="0" allowfullscreen width="'+attr.width+'" height="'+attr.height+'"></iframe>';
				
				break;

			case 'iframe':

				ad.src = (ad.src == undefined) ? '' : ad.src;

				html += '<iframe src="'+ad.src+'" frameborder="0" allowfullscreen width="'+attr.width+'" height="'+attr.height+'"></iframe>';

				break;

			case 'jquery':

				var html = $('<div class="adpopup-content adpopup-content-'+ad.type+'"></div>');

				$(ad.elem).appendTo(html).show();

				return html;

				break;
		}

		return $('<div class="adpopup-content adpopup-content-'+ad.type+'">' + html + '</div>');

	}

	function randomInt(min, max) {
		//return 2;
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function youtube_videoid(url) {
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
		var match = url.match(regExp);
		if (match&&match[2].length==11){
		    return match[2];
		}else{
		    return '';
		}
	}

	function get_obj_length(obj) {
		var i = 0;
		for(key in obj) {
			i++;
		}
		return i;
	}

	function get_time() {
		return Math.floor((new Date).getTime()/1000);
	}

	function get_ie_version() {

		  var rv = false; // Return value assumes failure.
		  if (navigator.appName == 'Microsoft Internet Explorer')
		  {
		    var ua = navigator.userAgent;
		    var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		    if (re.exec(ua) != null)
		      rv = parseFloat( RegExp.$1 );
		  }
		  return rv;
	}

})(jQuery);

/**
 * jQuery Cookie plugin
 *
 * Copyright (c) 2010 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
jQuery.cookie = function (key, value, options) {

    // key and at least value given, set cookie...
    if (arguments.length > 1 && String(value) !== "[object Object]") {
        options = jQuery.extend({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};


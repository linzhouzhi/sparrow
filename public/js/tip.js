var $ = jQuery.noConflict();

var body_div = $( '<span class="sparrow_title_msg hide"><p></p></span>' );
var content_span = $( '<span></span>' );
body_div.appendTo( sparrow.body );
content_span.appendTo( body_div );
var current_obj = null;
var pos_offset = 9;
var jq_document = $(document);
var window_w = 0, window_h = 0;
$( window ).bind( 'resize', function(){
	var win = $( window );
	window_w = win.width();
	window_h = win.height();
} ).trigger( 'resize' );
jq_document.bind( 'mousemove', function( eve ){
	var target = eve.target;
	if ( !target || 1 !== target.nodeType )
	{
		return;
	}
	var content = target.getAttribute( 'data-tip' );
	if ( 'string' !== typeof content )
	{
		return;
	}
	if ( current_obj !== target )
	{
		current_obj = target;
		target.setAttribute( 'sparrow_tip', 1 );
		body_div.removeClass( 'hide' );
		content_span.html( content );
		if ( -1 !== content.indexOf( '<img' ) )
		{
			var sparrow_file = require( 'sparrow/file' );
			if ( sparrow_file )
			{
				sparrow_file.lazy_load( pop_content );
			}
		}
		var width = target.getAttribute( 'data-tip-width' );
		if ( !width )
		{
			width = 'auto';
		}
		else
		{
			width = format_width( width );
		}
		body_div.css( {width:width, zIndex:layer.zIndex + 10} );
	}
	var mouse = sparrow.get_mouse( eve );
	var left = mouse.x + pos_offset;
	var top = mouse.y + pos_offset;
	var div_w = body_div.width();
	var div_h = body_div.height();
	var scroll_t = jq_document.scrollTop();
	var scroll_l = jq_document.scrollLeft();
	var over_h = window_h - ( top - scroll_t ) - div_h - pos_offset;
	var over_w = window_w - ( left - scroll_l ) - div_w - pos_offset;
	if ( over_h < 0 )
	{
		top += over_h;
	}
	if ( over_w < 0 )
	{
		left += over_w;
	}
	body_div.css( {left: left + 'px', top: top + 'px'} );
});
//鼠标移出事件
jq_document.bind( 'mouseout', function( eve ){
	var target = eve.target;
	if ( !target || !target.getAttribute( 'sparrow_tip' ) )
	{
		if ( null !== current_obj )
		{
			hide_tipbox();
		}
		return;
	}
	if ( target !== current_obj )
	{
		return;
	}
	hide_tipbox();
} );

/**
 * 隐藏tip
 */
function hide_tipbox()
{
	body_div.addClass( 'hide' );
	current_obj = null;
}

var pop_body_div = $( '<div class="sparrow_pop_msg hide">' );
var pop_arrow = $( '<span class="sparrow_pop_arrow top"><i></i></span>' );
var pop_title = $( '<span></span>' );
var pop_title_div = $( '<div class="sparrow_pop_title"></div>' ).appendTo( pop_body_div );
var pop_content = $( '<div class="sparrow_pop_cont">' );
var current_pop_tip = null;

/**
 * 生成pop_html
 */
function make_pop_html()
{
	pop_body_div.appendTo( sparrow.body );
	pop_arrow.appendTo( pop_body_div );
	var tmp_2 = $( '<div class="sparrow_pop_title_in"></div>' ).appendTo( pop_title_div );
	pop_title.appendTo( tmp_2 );
	var a = $( '<a href="javascript:;"></a>' ).appendTo( tmp_2 );
	pop_content.appendTo( pop_body_div );
	a.bind( 'click', close_pop_tip );
}

/**
 * 宽度清理
 */
function format_width( width )
{
	width = width.replace( 'px', '' );
	width += 'px'
	return width;
}

/**
 * 关闭弹窗
 */
function close_pop_tip()
{
	pop_body_div.addClass( 'hide' );
	current_pop_tip = null;
}
/**
 * 数据parse
 */
function parse_json( json )
{
	if ( 'string' !== typeof json )
	{
		json = '';
	}
	var sparrow_json = require( 'json' );
	json = json.replace( /'/g, '"' );
	var re;
	try
	{
		re = sparrow_json.decode( json );
	}
	catch( e )
	{
		re = {};
	}
	return re;
}
/**
 * 生成pop_tip的html
 */
function make_pop_tip_html( target, tpl )
{
	var smarty = require( 'smarty' );
	/**
	 * 显示
	 */
	function show_pop_tip( html )
	{
		target.setAttribute( 'data-pop-tip', html );
		$( target ).trigger( 'mouseup' );
		if ( 'false' === target.getAttribute( 'data-cache-tip' ) )
		{
			target.setAttribute( 'data-pop-tip', 'jstpl::' + tpl );
		}
	}

	var tpl_url = target.getAttribute( 'data-url' );
	//需要请求服务器
	if ( tpl_url )
	{
		var post_data = target.getAttribute( 'data-post' );
		if ( post_data )
		{
			post_data = parse_json( post_data );
			smarty.post( tpl_url, post_data, tpl, null, show_pop_tip );
		}
		else
		{
			smarty.get( tpl_url, tpl, null, show_pop_tip );
		}
	}
	//不用请求服务器
	else
	{
		var tpl_data_str = target.getAttribute( 'data-tpl-data' );
		var tpl_data = parse_tpl_data( tpl_data_str );
		smarty.html( tpl, tpl_data, null, show_pop_tip );
	}
}

/**
 * 解析模板数据
 */
function parse_tpl_data( tpl_data_str )
{
	if ( !tpl_data_str || 'string' !== typeof tpl_data_str )
	{
		return {};
	}
	if ( 0 === tpl_data_str.indexOf( 'PACK::' ) )
	{
		var base64 = require( 'sparrow_base64' ), msgpack = require( 'msgpack' );
		if ( !base64 || !msgpack )
		{
			sparrow.error( '请加载 base64, msgpack' );
		}
		tpl_data_str = tpl_data_str.substring( 6 );
		return msgpack.decode( base64.toByteArray( tpl_data_str ) );
	}
	else
	{
		return parse_json( tpl_data_str );
	}
}

make_pop_html();
var arrow_h = 7, current_arrow_css = 'top';
jq_document.bind( 'mouseup', function( eve ){
	var target = eve.target;
	var pop_tip = target.getAttribute( 'data-pop-tip' );
	if ( 'string' !== typeof pop_tip )
	{
		return;
	}
	//如果是以js_tpl::开始的字符串
	if ( 0 === pop_tip.indexOf( 'jstpl::' ) )
	{
		target.removeAttribute( 'data-pop-tip' );
		make_pop_tip_html( target, pop_tip.substr( 7 ) );
		return;
	}
	if ( current_pop_tip === target )
	{
		return;
	}
	current_pop_tip = target;
	var title = target.getAttribute( 'data-pop-title' );
	if ( title )
	{
		pop_title.html( title );
		pop_title_div.removeClass( 'hide' );
	}
	else
	{
		pop_title_div.addClass( 'hide' );
	}
	var width = target.getAttribute( 'data-pop-width' );
	if ( width )
	{
		width = format_width( width );
	}
	else
	{
		width = '300px';
	}
	var arrow_css, is_arrow_show = false;
	pop_body_div.removeClass( 'hide' );
	pop_body_div.css( {width:width, zIndex:layer.zIndex + 10} );
	pop_content.html( pop_tip );
	if ( -1 !== pop_tip.indexOf( '<img' ) )
	{
		var sparrow_file = require( 'sparrow/file' );
		if ( sparrow_file )
		{
			sparrow_file.lazy_load( pop_content );
		}
	}
	//pop_body_div.css( {left:mouse.x + 'px', top: mouse.y + 'px', width: width} );
	//弹出框尺寸
	var body_w = pop_body_div.width() + arrow_h, body_h = pop_body_div.height() + arrow_h;
	var obj = $( target );
	//目标的尺寸
	var target_w = obj.width(), target_h = obj.height();
	//目标位置
	var obj_offset = obj.offset();
	//滚动条位置
	var scroll_t = jq_document.scrollTop(), scroll_l = jq_document.scrollLeft();
	//上面的位置
	var top_pos = obj_offset.top - scroll_t;
	//下边的位置
	var bottom_pos = window_h - top_pos - target_h;
	//左边的位置
	var left_pos = obj_offset.left - scroll_l;
	//右边的位置
	var right_pos = window_w - left_pos - target_w;
	var pop_left_px = 0, pop_top_px = 0, arrow_pos = 0, arrow_percent, arrow_css_name;
	//如果上下的高度够放
	if ( bottom_pos > body_h || top_pos > body_h )
	{
		var t_w_m = target_w / 2, b_w_m = body_w / 2, arrow_pos = b_w_m;
		var left_space = left_pos + t_w_m;
		var right_space = right_pos + t_w_m;
		//左边不够放
		if ( left_space < b_w_m )
		{
			arrow_pos -= ( b_w_m - left_space );
			pop_left_px = 0;
		}
		//右边不够放
		else if ( right_space < b_w_m )
		{
			arrow_pos += ( b_w_m - right_space );
			pop_left_px = window_w - body_w;
		}
		else
		{
			pop_left_px = left_space - b_w_m;
		}
		is_arrow_show = true;
		//优先放在下边
		if ( bottom_pos > body_h )
		{
			arrow_css = 'top';
			pop_top_px = top_pos + target_h + arrow_h;
		}
		else
		{
			arrow_css = 'bottom';
			pop_top_px = top_pos - body_h;
		}
		arrow_css_name = 'left';
		arrow_percent = arrow_pos / body_w;
	}
	//只能分布在左右两边
	else
	{
		if ( left_pos < body_w && right_pos < body_w )
		{
			pop_left_px = pop_top_px = 0;
		}
		else
		{
			var t_h_m = target_h / 2, b_h_m = ( body_h - arrow_h ) / 2, arrow_pos = b_h_m;
			var top_space = top_pos + t_h_m;
			var bottom_space = bottom_pos + t_h_m;
			if ( top_space < b_h_m )
			{
				arrow_pos -= ( b_h_m - top_space );
				pop_top_px = 0;
			}
			else if ( bottom_space < b_h_m )
			{
				arrow_pos += ( b_h_m - bottom_space );
				pop_top_px = window_h - body_h;
			}
			else
			{
				pop_top_px = top_space - b_h_m;
			}
			is_arrow_show = true;
			//优先放右边
			if ( right_pos > body_w )
			{
				arrow_css = 'left';
				pop_left_px = left_pos + target_w;
			}
			else
			{
				arrow_css = 'right';
				pop_left_px = left_pos - body_w;
			}
		}
		arrow_css_name = 'top';
		arrow_percent = arrow_pos / body_h;
	}
	pop_left_px += scroll_l;
	pop_top_px += scroll_t;
	pop_body_div.css( {left:pop_left_px + 'px', top:pop_top_px + 'px'} );
	pop_arrow.removeClass( 'hide' );
	if ( is_arrow_show )
	{
		pop_arrow.removeClass( current_arrow_css );
		pop_arrow.addClass( arrow_css );
		pop_arrow.attr( 'style', arrow_css_name + ':' + ( arrow_percent * 100 ) + '%' );
		current_arrow_css = arrow_css;
	}
	else
	{
		pop_arrow.addClass( 'hide' );
	}
} );

jq_document.bind( 'mousedown', function( eve ){
	var target = eve.target;
	if ( null === current_pop_tip || target === current_pop_tip )
	{
		return;
	}
	if ( sparrow.contains( pop_body_div[ 0 ], target ) )
	{
		return;
	}
	if ( 'false' === current_pop_tip.getAttribute( 'data-pop-auto-close' ) )
	{
		return;
	}
	close_pop_tip();
} );
window.sparrow_close_pop_tip = close_pop_tip;
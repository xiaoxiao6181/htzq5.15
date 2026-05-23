var selltime = 0;
option = null;
var order_data = {};
var timer = '';
var resorderlist = {};
var timer_orderlist = '';
var _sell_time = 0;
var _ftime = 0;

function parseOrderMinMap(mapStr) {
    var map = {};
    if (!mapStr) return map;
    String(mapStr).split('|').forEach(function(part) {
        part = part.trim();
        if (!part) return;
        var kv = part.split(':');
        if (kv.length >= 2) {
            var sen = parseInt(kv[0], 10);
            var min = parseFloat(kv[1]);
            if (!isNaN(sen) && !isNaN(min)) {
                map[sen] = min;
            }
        }
    });
    return map;
}

function getAppOrderConfig() {
    if (window.appOrderConfig) return window.appOrderConfig;
    try {
        var raw = localStorage.getItem('config');
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function getOrderMinBySen(orderSen, configData) {
    configData = configData || getAppOrderConfig();
    var defaultMin = parseFloat(configData.order_min);
    if (isNaN(defaultMin)) {
        defaultMin = typeof order_min_price !== 'undefined' ? parseFloat(order_min_price) : 100;
    }
    var map = parseOrderMinMap(configData.order_min_map);
    var sen = parseInt(orderSen, 10);
    if (map[sen] != null && !isNaN(map[sen])) {
        return Math.max(defaultMin, map[sen]);
    }
    return defaultMin;
}

function formatOrderMinTip(orderSen, minAmount) {
    if (typeof I18n !== 'undefined' && I18n.t) {
        return I18n.t('product.amountTooSmallForTime', {
            seconds: orderSen,
            amount: minAmount
        });
    }
    return '当前为' + orderSen + '秒结算，金额不能低于' + minAmount;
}

function applyOrderMinForCurrentSen() {
    order_min_price = getOrderMinBySen(order_sen);
    $('.order_min').text(order_min_price);
    validateCurrentOrderAmount();
}

function validateCurrentOrderAmount() {
    var price = parseFloat(order_price);
    if (isNaN(price)) {
        price = 0;
    }
    $('.no-min').addClass('ng-hide');
    $('.no-max').addClass('ng-hide');
    $('.no-money').addClass('ng-hide');
    if (price > 0 && price < order_min_price) {
        $('.no-min').removeClass('ng-hide');
        $('.button').attr('disabled', 'disabled');
        return false;
    }
    if (price > order_max_price) {
        $('.no-max').removeClass('ng-hide');
        $('.button').attr('disabled', 'disabled');
        return false;
    }
    if (price > my_money) {
        $('.no-money').removeClass('ng-hide');
        $('.button').attr('disabled', 'disabled');
        return false;
    }
    $('.button').removeAttr('disabled');
    return true;
}


function getdata(pid) {
    var url = "/index/index/ajaxpro.html?pid=" + pid;
	AjaxUtil.get('/index/index/getProductPrice?pid='+pid,{loadingHide:true}).then(res=>{
	    try {
	        var old_price = $('#jk').html();
    		//  console.log(old_price);
    		if (old_price * 10 < res.data.Price * 10) {
    		    $('#jk').removeClass('fall');
    		    $('#jk').addClass('rise');
    		} else if (old_price * 10 > res.data.Price * 10) {
    		    $('#jk').addClass('fall');
    		    $('#jk').removeClass('rise');
    		}
    		console.log(res)
    		$('#jk').html(res.data.Price);
    		$(".openPrice").text(res.data.Open)
    		$(".highPrice").text(res.data.High)
    		$(".closePrice").text(res.data.Close)
    		$(".lownPrice").text(res.data.Low)
    		
    		
    		
    		
    		newprice = res.data.Price;
    // 		setTimeout(function(){
    // 			getdata(pid)
    // 		},1000)
	    } catch (e) {
	        alert('异常')
	    }
		
// 		getdata(pid)
	})
    // $.get(url, function(data) {
        
        
    // });
    //$.get('/index/index/product');
   // $.get('/index/index/order');
}




//选择时间



$('.period-widget-view').on('click','.period-widget',function() {

    $('.period-widget').removeClass('active');
    $(this).addClass('active');
    order_sen = $(this).attr('data-sen');
    order_shouyi = $(this).attr('data-shouyi');
    order_kuishun = $(this).attr('data-kuishun');
    applyOrderMinForCurrentSen();
    var yuqi = (((order_shouyi * 0.01 * order_price) * 10 + order_price * 10) / 10).toFixed(2);
    $('#yuqi').html(yuqi)

});
//选择金额
$('.amount-view').on('click','.amount-box',function() {

    $('.amount-box').removeClass('active');
    $('.other-amount').removeClass('active');
    $(this).addClass('active');
    order_price = $(this).attr('data-price');
    $('#money').html(' ' + order_price);
    validateCurrentOrderAmount();
    var yuqi = (((order_shouyi * 0.01 * order_price) * 10 + order_price * 10) / 10).toFixed(2);
    $('#yuqi').html(yuqi)
})
// $('.amount-box').click(function() {

//     $('.amount-box').removeClass('active');
//     $('.other-amount').removeClass('active');
//     $(this).addClass('active');
//     order_price = $(this).attr('data-price');
//     $('#money').html(' ' + order_price);
//     if (my_money < order_price) {
//         $('.no-money').removeClass('ng-hide');
//     } else {
//         $('.no-money').addClass('ng-hide');
//     }
//     $('.no-min').addClass('ng-hide');
//     $('.no-max').addClass('ng-hide');
//     var yuqi = (((order_shouyi * 0.01 * order_price) * 10 + order_price * 10) / 10).toFixed(2);
//     $('#yuqi').html(yuqi)
// });

$('.other-amount').click(function() {
    $('.amount-box').removeClass('active');
    $(this).addClass('active');

});
$('.other-amount input').bind('input propertychange', function() {
    var inputdata = $('.other-amount input').val();
    order_price = inputdata;
    $('#money').html(' ' + order_price);
    validateCurrentOrderAmount();
});

/**
 * 清理残留遮罩/弹层，避免挡住买涨买跌按钮
 */
function resetOrderOverlayState() {
    $('.pro_mengban').removeClass('glass_mask');
    $('.order_mengban').removeClass('glass_mask');
    $('.order-confirm-panel').removeClass('open');
    $('.order-state-panel').hide();
    $('.order_fail').addClass('ng-hide');
    $('.order-state-panel .wait').addClass('ng-hide');
    $('.trade-view').removeClass('order-panel-open');
    var loadingEl = document.querySelector('#ajax-loading');
    if (loadingEl) {
        loadingEl.remove();
    }
    if (window.AjaxUtil && AjaxUtil.loading && typeof AjaxUtil.loading.hide === 'function') {
        AjaxUtil.loading.hide();
    }
}

function clear_stuck_order_masks() {
    resetOrderOverlayState();
}

var toggle_order_confirm_panel = function(type) {
    try {
        resetOrderOverlayState();
        var typename;
        if (type == 'lookup') {
            typename = (typeof I18n !== 'undefined' && I18n.t) ? I18n.t('product.buyUp') : '买涨';
            order_type = 0;
            $('.order_type').removeClass('fall');
            $('.order_type').addClass('rise');
        } else {
            typename = (typeof I18n !== 'undefined' && I18n.t) ? I18n.t('product.buyDown') : '买跌';
            order_type = 1;
            $('.order_type').addClass('fall');
            $('.order_type').removeClass('rise');
        }
        $('.order_type').html(typename);
        $('.trade-view').addClass('order-panel-open');
        $('.pro_mengban').addClass('glass_mask');
        $('.order-confirm-panel').addClass('open');
    } catch (e) {
        console.error('toggle_order_confirm_panel error:', e);
        resetOrderOverlayState();
        if (typeof layer !== 'undefined' && layer.msg) {
            layer.msg('打开下单面板失败，请刷新后重试');
        } else {
            alert('打开下单面板失败，请刷新后重试');
        }
    }
};

/**
 * 下单
 * @author lukui  2017-06-30
 * @return {[type]} [description]
 */
function addorder() {
	var postdata = "order_type=" + order_type + "&order_pid=" + order_pid + "&order_price=" + order_price + "&order_sen=" + order_sen + "&order_shouyi=" + order_shouyi + "&order_kuishun=" + order_kuishun + "&newprice=" + newprice;
	var posturl = "/index/user/addorder?";
	
	toggle_order_close_panel()

	if (order_price > my_money) {
	    resetOrderOverlayState();
	    layer.msg('资金不足，请先充值');
	    return;
	}
	if (order_price < order_min_price) {
	    resetOrderOverlayState();
	    layer.msg(formatOrderMinTip(order_sen, order_min_price));
	    return;
	}
	if (order_price > order_max_price) {
	    resetOrderOverlayState();
	    layer.msg('最大下注金额为' + order_max_price);
	    return;
	}

	$('.trade-view').addClass('order-panel-open');
	$('.order_mengban').addClass('glass_mask');
	$('.paysuccess').hide();
	$('.order-state-panel').show();
	$('.order-state-panel .wait').removeClass('ng-hide');
	
	AjaxUtil.post(posturl+postdata).then(resdata => {
		if(resdata.code==1){
			$('.pay_order_sen').html(resdata.data.endprofit);
			$('.img_circle_right').attr('style', '-webkit-animation: run ' + resdata.data.endprofit + 's linear;')
			$('.img_circle_lift').attr('style', '-webkit-animation: runaway ' + resdata.data.endprofit + 's linear;')
	
			//下方提示
			if (resdata.data.ostyle == 0) {
				$('.pay_order_type').html(I18n.t('product.buyUp'));
				$('.pay_order_type').addClass('rise');
				$('.pay_order_type').removeClass('fall');
			} else {
				$('.pay_order_type').html(I18n.t('product.buyDown'));
				$('.pay_order_type').addClass('fall');
				$('.pay_order_type').removeClass('rise');
			}
			//$('.order-state-panel').hide();
			$('.order-state-panel .wait').addClass('ng-hide');
	
			$('.pay_order_price').html(resdata.data.fee);
			$('.pay_order_buypricee').html(resdata.data.buyprice);
	
			$('.order-state-panel .wait').addClass('ng-hide');
			$('.order-state-panel .paysuccess').removeClass('ng-hide');
			$('.order-state-panel .paysuccess').addClass('success');
			//余额
			$('.pay_mymoney').html(resdata.data.commission);
			//转盘倒计时
	
	
			selltime = resdata.data.selltime;
			order_data = resdata.data;
			$('.paysuccess').show();
			_sell_time = order_data.selltime - order_data.buytime;
			timer = setInterval("endtimes()", 1000);
		}else{
			err_info(resdata.info);
		}
	}).catch(function() {
		resetOrderOverlayState();
		if (typeof layer !== 'undefined' && layer.msg) {
		    layer.msg('下单失败，请稍后重试');
		} else {
		    alert('下单失败，请稍后重试');
		}
	})
    // var postdata = "order_type=" + order_type + "&order_pid=" + order_pid + "&order_price=" + order_price + "&order_sen=" + order_sen + "&order_shouyi=" + order_shouyi + "&order_kuishun=" + order_kuishun + "&newprice=" + newprice;
    // var posturl = "/index/user/addorder";

    // toggle_order_close_panel()

    // $('.order_mengban').addClass('glass_mask');
    // $('.paysuccess').hide();

    // $('.order-state-panel').show();
    // $('.order-state-panel .wait').removeClass('ng-hide');

    // if (order_price > my_money) {
    //     err_info('Balance not enough');
    //     return;
    // }
    // if (order_price < order_min_price) {
    //     err_info('Money should be larger than' + order_min_price);
    //     return;
    // }
    // if (order_price > order_max_price) {
    //     err_info('Money should be less than' + order_max_price);
    //     return;
    // }


    // $.post(posturl, postdata, function(resdata) {

    //     if (resdata.type == 1) {

    //         resdata.data = jQuery.parseJSON(Base64.decode(resdata.data));

    //         //倒计时
    //         $('.pay_order_sen').html(resdata.data.endprofit);
    //         $('.img_circle_right').attr('style', '-webkit-animation: run ' + resdata.data.endprofit + 's linear;')
    //         $('.img_circle_lift').attr('style', '-webkit-animation: runaway ' + resdata.data.endprofit + 's linear;')

    //         //下方提示
    //         if (resdata.data.ostyle == 0) {
    //             $('.pay_order_type').html('Buy');
    //             $('.pay_order_type').addClass('rise');
    //             $('.pay_order_type').removeClass('fall');
    //         } else {
    //             $('.pay_order_type').html('Sell');
    //             $('.pay_order_type').addClass('fall');
    //             $('.pay_order_type').removeClass('rise');
    //         }
    //         //$('.order-state-panel').hide();
    //         $('.order-state-panel .wait').addClass('ng-hide');

    //         $('.pay_order_price').html(resdata.data.fee);
    //         $('.pay_order_buypricee').html(resdata.data.buyprice);

    //         $('.order-state-panel .wait').addClass('ng-hide');
    //         $('.order-state-panel .paysuccess').removeClass('ng-hide');
    //         $('.order-state-panel .paysuccess').addClass('success');
    //         //余额
    //         $('.pay_mymoney').html(resdata.data.commission);
    //         //转盘倒计时


    //         selltime = resdata.data.selltime;
    //         order_data = resdata.data;
    //         $('.paysuccess').show();
    //         _sell_time = order_data.selltime - order_data.buytime;
    //         timer = setInterval("endtimes()", 1000);
    //     } else {
    //         err_info(resdata.data);
    //     }

    // });
}
function getRandomInt(min, max) {
  // Math.floor() 向下取整
  // (max - min + 1) 是数值范围的总数量
  // Math.random() * (max - min + 1) 生成 [0, max - min + 1) 的数
  // 加上 min 后，范围变为 [min, max + 1)，向下取整后就变成了 [min, max]
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//转盘倒计时
function endtimes() {

    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    _sell_time--;
    var newsen = _sell_time;
    $('.pay_order_sen').html(newsen);

    var old_price = $('.data-price').html();

    var yuce_case = getRandomInt(-order_data.fee * order_data.lossrate / 100,order_data.fee * order_data.endloss / 100).toFixed(2);
    if(yuce_case<0){
		if (order_data.ostyle == 0) { //买涨
		    $('.yuce').removeClass('fall');
		    $('.yuce').addClass('rise');
		} else {
		    $('.yuce').removeClass('rise');
		    $('.yuce').addClass('fall');
		}
	}else{
		if (order_data.ostyle == 0) { //买涨
		    $('.yuce').removeClass('rise');
		    $('.yuce').addClass('fall');
		} else {
		    $('.yuce').removeClass('fall');
		    $('.yuce').addClass('rise');
		}
	}
	
	
	// if (order_data.buyprice * 10 < newprice * 10) {
 //        $('.data-price').removeClass('fall');
 //        $('.data-price').addClass('rise');

 //        if (order_data.ostyle == 0) { //买涨
 //            // yuce_case = '+' + (order_data.fee * order_data.endloss / 100);
	
 //            $('.yuce').removeClass('fall');
 //            $('.yuce').addClass('rise');
 //        } else {
 //            // yuce_case = order_data.fee*-1;
 //            // yuce_case = '-' + (order_data.fee * order_data.lossrate / 100);
	
 //            $('.yuce').removeClass('rise');
 //            $('.yuce').addClass('fall');
 //        }

 //    } else if (order_data.buyprice * 10 > newprice * 10) {
 //        $('.data-price').addClass('fall');
 //        $('.data-price').removeClass('rise');

 //        if (order_data.ostyle == 0) { //买涨
 //            // yuce_case = '-' + (order_data.fee * order_data.lossrate / 100);
		
 //            $('.yuce').removeClass('rise');
 //            $('.yuce').addClass('fall');
 //        } else {
 //            // yuce_case = '+' + (order_data.fee * order_data.endloss / 100);

 //            $('.yuce').removeClass('fall');
 //            $('.yuce').addClass('rise');
 //        }
 //    } else {
 //        // yuce_case = 0;
	// 	// yuce_case = '+' +yuce_case
 //    }
    $('.yuce').html('' + yuce_case);

    if (newsen <= 0) {
        $('.paysuccess').addClass('ng-hide');
        $('.paysuccess').removeClass('success');
        $('.order-state-panel .wait').removeClass('ng-hide');
        //请求检测订单
        //get_this_order();
        clearInterval(timer)
        //停止ajax
        clearTimeout(ccout);
        //go order
        goorder();
    }


}

function goorder() {

    var posturl = baseConfig.baseUrl+'/index/user/goorder';
    var postdata = 'price=' + newprice + "&oid=" + order_data.oid + "&order_rand=" + order_data.order_rand;

    $.post(posturl, postdata, function(res) {
        console.log(res);
        if (res == 1 || res == 3) {
            get_this_order();
        } else if (res == 2) {
            setTimeout('goorder()', 100);
        } else {
            get_this_order();
        }

    });
}


function get_this_order() {
    var tourl =  baseConfig.baseUrl+"/index/user/get_this_order?oid=" + order_data.oid;
    $.get(tourl, function(resdata) {
        if (resdata) {
            resdata = jQuery.parseJSON(Base64.decode(resdata));
            console.log(resdata);
            $('.order-state-panel .wait').addClass('ng-hide');
            $('.ordersuccess').removeClass('ng-hide');
            $('.ordersuccess').addClass('success');


            if (resdata.is_win == 1) {
                $('.result_profit').addClass('rise')
                $('.result_profit').removeClass('fall')
                //var _ploss = (resdata.ploss*10+resdata.fee*10)/10;
                var _ploss = (resdata.ploss * 10) / 10;
                $('.result_profit').html('' + _ploss);

                $('.endprice').addClass('rise')
                $('.endprice').removeClass('fall')
            } else if (resdata.is_win == 2) {
                $('.result_profit').addClass('fall')
                $('.result_profit').removeClass('rise')
                $('.result_profit').html('' + resdata.ploss);
                $('.endprice').addClass('fall')
                $('.endprice').removeClass('rise')
            } else {
                $('.result_profit').removeClass('rise')
                $('.result_profit').removeClass('fall')
                $('.result_profit').html('' + resdata.ploss);
                $('.endprice').removeClass('rise')
                $('.endprice').removeClass('fall')

            }
            $('.endprice').html('' + resdata.sellprice);
            ccout = setTimeout("getonedata()", 1000);

        } else {
            // $('.ordersuccess').addClass('ng-hide');
            // $('.ordersuccess').removeClass('success');
            // err_info('获取失败，请在订单列表查看');
            get_this_order();
        }
    });
}
/**
 * 继续下单
 * @author lukui  2017-06-30
 * @return {[type]} [description]
 */
function continue_order() {

    close_order();
    if (order_type == 0) {
        var _type = 'lookup';
    } else {
        var _type = 'lookdown';
    }
    toggle_order_confirm_panel(_type);
}

/**
 * 关闭窗口
 * @author lukui  2017-06-30
 * @return {[type]} [description]
 */
function close_order() {
    clearInterval(timer);
    resetOrderOverlayState();
    $('.ordersuccess').removeClass('success');
    $('.ordersuccess').addClass('ng-hide');
}

/**
 * 持仓明细
 */
function toggle_history_order_panel() {
    var type = $('.history-panel').attr('ng-include');
    if (type == 1) {


        //ajax order
        var ajaxorderurl = "/index/user/ajaxorder?pid=" + order_pid;
        $.get(ajaxorderurl, function(resdata) {

            resdata = jQuery.parseJSON(Base64.decode(resdata));

            resorderlist = resdata;

            if (resorderlist.length >= 1) {
                _ftime = resorderlist[0]['time'];
            } else {
                var timestamp = Date.parse(new Date());
                _ftime = timestamp / 1000;
            }
            //show_order_list();

            timer_orderlist = setInterval("show_order_list()", 1000);
            $('.history-panel').css('top', '50%')
            $('.history-panel').css('bottom', '10%')
            $('.history-panel').attr('ng-include', 0);
        })

    } else {
        $('.history-panel').css('top', '500%')
        $('.history-panel').css('bottom', '100%')
        $('.history-panel').attr('ng-include', 1);
        clearInterval(timer_orderlist)
    }



}
/**
 * 订单列表
 * @return {[type]} [description]
 */
function show_order_list() {
    var html = '';

    if (resorderlist.length == 0) {
        $('.trade_history_list ul').html(' ');
        return false;
    }

    _ftime++;
    $.each(resorderlist, function(k, v) {

        console.log(_ftime);
        var timestamp = Date.parse(new Date());
        var _end_time = (v.selltime - _ftime);
        var baifenbi = (_end_time / v.endprofit) * 100;
        console.log(_ftime);
        if (_end_time > 0) {

            var chaprice = newprice - v.buyprice;
            var closeprice = 0;
            var closeprice_class = '';
            if (v.ostyle == 0) {
                var ostyle_class = "buytop";
                var ostyle_class2 = 'in_money';
                var ostyle_name = "Buy";
                if (chaprice > 0) {
                    closeprice = '+' + (order_data.fee * order_data.endloss / 100);
                    closeprice_class = 'in_money';
                } else if (chaprice < 0) {
                    closeprice = '-' + (order_data.fee * order_data.lossrate / 100);
                    closeprice_class = 'out_money';
                } else {
                    closeprice = v.fee;
                    closeprice_class = '';
                }
            } else {
                var ostyle_class = "buydown";
                var ostyle_name = "Sell";
                var ostyle_class2 = 'out_money';

                if (chaprice < 0) {
                    closeprice = '+' + (order_data.fee * order_data.endloss / 100);
                    closeprice_class = 'in_money';
                } else if (chaprice > 0) {
                    closeprice = '-' + (order_data.fee * order_data.lossrate / 100);
                    closeprice_class = 'out_money';
                } else {
                    closeprice = v.fee;
                    closeprice_class = '';
                }

            }

            html += '<li ng-repeat="o in trade_order_list" class="">\
                        <section>\
                            <p style="margin: 0">\
                                <span class="ng-binding">' + v.ptitle + '</span>\
                                <span class="ng-binding ' + ostyle_class2 + '"><i class="' + ostyle_class + '"></i>' + ostyle_name + '（' + v.fee + '）</span>\
                            </p>\
                            <p style="margin: 0" class="ng-binding">\
                                ' + v.buyprice + '-<span  class="ng-binding ' + closeprice_class + '">' + newprice + '</span>\
                            </p>\
                            <p style="margin: 0" class="ng-binding">' + getLocalTime(v.buytime) + '</p>\
                        </section><section>\
                            <p style="margin: 0px;" class="ng-binding ' + closeprice_class + '">' + closeprice + '</p>\
                            <p style="margin: 0" class="ng-binding">' + formatSeconds2(_end_time) + '</p>\
                        </section>\
                        <article class="">\
                        <span class="move_width" style="width: ' + baifenbi + '%; transition-duration: 1s;">\
                        </span>\
                        <i>\
                            <em></em>\
                        </i>\
                        </article>\
                    </li>';

            $('.trade_history_list ul').html(html);

        } else {

            resorderlist.splice(k, 1);
        }
    })

}

/**
 * 订单错误提示
 * @param  {[type]} data 错误信息
 * @return {[type]}      [description]
 */
function err_info(data) {
    resetOrderOverlayState();
    var msg = data || '下单失败';
    if (typeof layer !== 'undefined' && layer.msg) {
        layer.msg(msg);
    } else {
        alert(msg);
    }
}

$(function() {
    resetOrderOverlayState();
});

window.addEventListener('pageshow', function(event) {
    resetOrderOverlayState();
});
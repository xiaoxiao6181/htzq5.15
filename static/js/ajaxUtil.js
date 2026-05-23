/**
 * jQuery AJAX 封装工具 v4
 * 功能：统一请求头、拦截器、错误处理、加载提示
 */
window.AJAX_UTIL_VERSION = 4;

// jQuery 1.9 的 Deferred 没有 .catch，旧页面 AjaxUtil.post().then().catch() 会报错
(function($) {
  if (!$ || !$.Deferred) return;
  var proto = $.Deferred.prototype;
  if (typeof proto.catch !== 'function') {
    proto.catch = function(onRejected) {
      return this.then(null, typeof onRejected === 'function' ? onRejected : undefined);
    };
  }
})(typeof jQuery !== 'undefined' ? jQuery : null);

const baseConfig = {
	// baseUrl: 'https://admin.sgx66.shop', // 接口基础路径
	baseUrl: 'https://api.68699.im',
	// baseUrl:'http://127.0.0.1',
	timeout: 10000, // 超时时间（毫秒）
	headers: {
	  'Content-Type': 'application/json',
	  'X-Requested-With': 'XMLHttpRequest',
	  "token":window.localStorage.getItem('token')
	}
};

window.AjaxUtil = (function($) {
  // 基础配置
  

  // 加载提示
  const loading = {
    show(text) {
      if (!document.querySelector('#ajax-loading')) {
        const div = document.createElement('div');
        div.id = 'ajax-loading';
        div.style.cssText = `
          position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
          padding: 10px 20px; background: rgba(0,0,0,0.7); color: white;
          border-radius: 4px; z-index: 9999;width:30px;height:30px;
          pointer-events: none;
        `;
        div.innerHTML = `<img src="./static/img/loading.gif" >`;
        document.body.appendChild(div);
      }
    },
    hide() {
      const el = document.querySelector('#ajax-loading');
      if (el) el.remove();
    }
  };

  // 请求拦截器（发送前处理）
  function requestInterceptor(config) {
    // 示例：添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Token'] = `${token}`;
    }
    // 拼接完整 URL
    config.url = baseConfig.baseUrl + config.url;
    return config;
  }

  // 响应拦截器（成功后处理，data 为接口 JSON 正文）
  function responseInterceptor(data) {
    if (data && data.code == 5001) {
      location.href = './login.html';
    }
    return data;
  }

  // 错误统一处理
  function errorHandler(error) {
    console.log('error', error);
    let message = '请求失败，请稍后重试';
    if (error.status) {
      switch (error.status) {
        case 401:
          message = '未登录或登录已过期，请重新登录';
          location.href = './login.html';
          break;
        case 403:
          message = '没有权限访问';
          break;
        case 404:
          message = '接口不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        case 408:
          message = '请求超时';
          break;
      }
    } else if (error.message === 'abort') {
      message = '请求已取消';
    }
    console.log(message);
    const err = error instanceof Error ? error : new Error(message);
    err.jqXHR = error;
    return err;
  }

  // 核心请求方法（返回原生 Promise，兼容 jQuery 1.9 无 .catch 的问题）
  function request(options) {
    const config = {
      ...baseConfig,
      ...options,
      headers: { ...baseConfig.headers, ...options.headers }
    };
    const processedConfig = requestInterceptor(config);
    const hideLoading = !options.data || !options.data.loadingHide;
    if (hideLoading) {
      loading.show();
    }

    return new Promise(function(resolve, reject) {
      $.ajax(processedConfig)
        .done(function(data) {
          try {
            resolve(responseInterceptor(data));
          } catch (e) {
            reject(e);
          }
        })
        .fail(function(jqXHR) {
          reject(errorHandler(jqXHR));
        })
        .always(function() {
          if (hideLoading) {
            loading.hide();
          }
        });
    });
  }

  // 暴露常用请求方法
  return {
    // GET 请求
    get(url, params = {}, options = {}) {
      return request({
        url,
        method: 'GET',
        data: params, // GET 参数自动拼到 URL
        ...options
      });
    },

    // POST 请求（JSON 格式）
    post(url, data = {}, options = {}) {
      return request({
        url,
        method: 'POST',
        data: JSON.stringify(data), // 转为 JSON 字符串
        ...options
      });
    },

    // POST 表单请求（form-data 格式）
    postForm(url, data = {}, options = {}) {
      // 转换为 FormData
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
	  console.log(formData)
      return request({
        url,
        method: 'POST',
        data: formData,
        contentType: false, // 不设置 Content-Type，由浏览器自动处理
        processData: false, // 不转换数据格式
        ...options
      });
    },

    // 取消请求（需配合 jQuery 的 xhr 对象）
    abort(xhr) {
      if (xhr && xhr.abort) {
        xhr.abort();
      }
    },
    loading
  };
})(jQuery);



// $.ajaxSetup({
//     headers: {
//         'Token':  localStorage.getItem('token')
//     }
// });
if(!(location.pathname.search('login.html')>0)&&!(location.pathname.search('reg.html')>0)){
    setInterval(function(){
        AjaxUtil.get('/index/login/uplastOptionTime?loadingHide=true').then(res => {
    
    
    	
        })
    },1000*60)
}


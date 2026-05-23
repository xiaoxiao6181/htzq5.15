
function maskString(str) {
    if (typeof str !== 'string') return str;
    
    if (str.length <= 8) {
        return str; // 如果字符串长度小于等于8，直接返回原字符串
    }
    
    const firstFour = str.substring(0, 4);
    const lastFour = str.substring(str.length - 4);
    const middleStars = '*'.repeat(str.length - 8);
    
    return firstFour + middleStars + lastFour;
}

async function  getUserInfo () {
	console.log(11)
    let res=await AjaxUtil.get('/index/user/getUserInfo')
	if(res.code==1) {
	  userInfo  =  res.data.user
	  window.localStorage.setItem('userInfo', JSON.stringify(userInfo))
	  return userInfo
	} else {
	  console.log(res.info)
	  window.location.href = '/login.html'
	}

}

function msg(title, content, type, url) {
	$(".contents").html(content);
	if (type == 1) {
		var btn = '<div class="confirm guanbi" onclick="$(\'.tipMask\').hide();">确定</div>';
	} else {
		var btn = '<div class="confirm guanbi" onclick="window.location.href=\'' + url + '\'">确定</div>';
	}
	$("#msgBtn").html(btn);
	$(".tipMask").show();
}

function getStatusText(status){
	  if(status==0){
		  return '审核中'
	  }
	  if(status==1){
			return '申请成功'
	  }
	  if(status==2){
			return '申请失败'
	  }
}
function isValidAlphanumeric(str) {

  return /^[0-9a-zA-Z]+$/.test(str);
}

/**
 * 补全外链协议，避免 admin.68699.im/chat.html 被当成相对路径
 */
function normalizeExternalUrl(url) {
    if (!url || typeof url !== 'string') return '';
    url = url.trim();
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/\//.test(url)) return 'https:' + url;
    if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(url)) {
        return 'https://' + url.replace(/^\/+/, '');
    }
    return url;
}

function openServiceUrl(url) {
    var target = normalizeExternalUrl(url);
    if (target) {
        window.location.href = target;
    }
}

function saveAppConfig(data) {
    if (data && data.service) {
        data.service = normalizeExternalUrl(data.service);
    }
    localStorage.setItem('config', JSON.stringify(data));
    return data;
}

function msg(title, content, type, url) {
	$(".title").text(title);
	$(".contents").html(content);
	if (type == 1) {
		var btn = '<div class="confirm guanbi" style="background-color:#33B497;" onclick="$(\'.tipMask\').hide();">' + I18n.t('common.confirm') + '</div>';
	} else {
		var btn = '<div class="confirm guanbi" style="background-color:#33B497;" onclick="window.location.href=\'' + url + '\'">' + I18n.t('common.confirm') + '</div>';
	}
	$("#msgBtn").html(btn);
	$(".tipMask").show();
}


window.addEventListener('pageshow', function(event) {
	if (event.persisted) {
		// 从缓存返回（比如通过浏览器后退按钮）
		window.location.reload();
	}
});



$.ajaxSetup({
    headers: {
        'Token':  localStorage.getItem('token')
    }
});

/**
 * 从上传接口响应中解析图片路径（兼容多种后端返回格式）
 */
function parseUploadImageUrl(response) {
    if (!response) return null;
    if (typeof response === 'string') {
        var trimmed = response.trim();
        if (/^https?:\/\//i.test(trimmed) || trimmed.indexOf('/upload/') === 0 || trimmed.indexOf('/Upload/') === 0) {
            return trimmed;
        }
        try {
            response = JSON.parse(trimmed);
        } catch (e) {
            return null;
        }
    }
    if (typeof response === 'string') return response;
    if (response.uploaded === true && response.url) return response.url;
    if (response.filename && response.url) return response.url;
    if (response.url) return response.url;
    if (response.path) return response.path;
    if (response.src) return response.src;
    if (response.data != null) {
        if (typeof response.data === 'string') return response.data;
        if (response.data.url) return response.data.url;
        if (response.data.path) return response.data.path;
        if (response.data.src) return response.data.src;
    }
    return null;
}

/**
 * 统一解析上传接口结果（ThinkAdmin / CKEditor 等）
 */
function normalizeUploadResponse(response, responseText) {
    var parsed = response;
    if (parsed == null || parsed === '') {
        if (responseText) {
            var directUrl = parseUploadImageUrl(responseText);
            if (directUrl && typeof directUrl === 'string') {
                return { ok: true, url: directUrl };
            }
            try {
                parsed = JSON.parse(responseText);
            } catch (e) {
                parsed = null;
            }
        }
    }
    if (typeof parsed === 'string') {
        try {
            parsed = JSON.parse(parsed);
        } catch (e) {
            var urlOnly = parseUploadImageUrl(parsed);
            if (urlOnly) return { ok: true, url: urlOnly };
        }
    }
    if (parsed && parsed.uploaded === false) {
        var errObj = parsed.error;
        var errMsg = (errObj && (errObj.message || errObj)) || parsed.info || parsed.msg || parsed.message || '上传失败';
        return { ok: false, error: typeof errMsg === 'string' ? errMsg : '上传失败' };
    }
    if (parsed && parsed.uploaded === true && parsed.url) {
        return { ok: true, url: parsed.url };
    }
    var imageUrl = parseUploadImageUrl(parsed);
    if (imageUrl) {
        return { ok: true, url: imageUrl };
    }
    if (parsed && parsed.code != null && parsed.code !== 1 && parsed.code !== 200) {
        return { ok: false, error: parsed.info || parsed.msg || parsed.message || '上传失败' };
    }
    return {
        ok: false,
        error: (parsed && (parsed.info || parsed.msg || parsed.message)) || '上传接口未返回有效的图片 URL'
    };
}

function isImageUploadFile(file) {
    if (!file) return false;
    var type = (file.type || '').toLowerCase();
    if (type.indexOf('image/') === 0) return true;
    var name = (file.name || '').toLowerCase();
    return /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/.test(name);
}

function isHeicUploadFile(file) {
    var type = (file.type || '').toLowerCase();
    var name = (file.name || '').toLowerCase();
    return type.indexOf('heic') >= 0 || type.indexOf('heif') >= 0 || /\.heic$/.test(name) || /\.heif$/.test(name);
}

function shouldCompressUploadImage(file) {
    if (!isImageUploadFile(file)) return false;
    if (isHeicUploadFile(file)) return true;
    if (!file.type) return true;
    var type = file.type.toLowerCase();
    if (type.indexOf('png') >= 0 || type.indexOf('webp') >= 0) return true;
    return !file.size || file.size > 200 * 1024;
}

function loadImageSourceForCompress(file) {
    return new Promise(function(resolve, reject) {
        if (window.createImageBitmap) {
            createImageBitmap(file, { imageOrientation: 'from-image' })
                .then(function(bitmap) {
                    resolve({ source: bitmap, isBitmap: true });
                })
                .catch(function() {
                    loadImageElementFromFile(file).then(function(img) {
                        resolve({ source: img, isBitmap: false });
                    }).catch(reject);
                });
            return;
        }
        loadImageElementFromFile(file).then(function(img) {
            resolve({ source: img, isBitmap: false });
        }).catch(reject);
    });
}

function loadImageElementFromFile(file) {
    return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() { resolve(img); };
            img.onerror = function() { reject(new Error('无法读取该图片')); };
            img.src = e.target.result;
        };
        reader.onerror = function() { reject(new Error('读取图片失败')); };
        reader.readAsDataURL(file);
    });
}

function canvasToJpegFile(file, source, isBitmap, options) {
    var maxWidth = options.maxWidth || 1920;
    var maxHeight = options.maxHeight || 1920;
    var quality = options.quality == null ? 0.82 : options.quality;
    var w = isBitmap ? source.width : source.width;
    var h = isBitmap ? source.height : source.height;
    var scale = Math.min(1, maxWidth / w, maxHeight / h);
    var targetW = Math.max(1, Math.round(w * scale));
    var targetH = Math.max(1, Math.round(h * scale));
    var canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0, targetW, targetH);
    if (isBitmap && source.close) source.close();
    return new Promise(function(resolve, reject) {
        canvas.toBlob(function(blob) {
            if (!blob) {
                reject(new Error('图片压缩失败'));
                return;
            }
            var baseName = (file.name || 'idcard').replace(/\.[^.]+$/, '');
            resolve(new File([blob], baseName + '.jpg', {
                type: 'image/jpeg',
                lastModified: Date.now()
            }));
        }, 'image/jpeg', quality);
    });
}

/**
 * 相册大图/HEIC/无 MIME 时压缩为 JPEG 后再上传
 */
function compressImageForUpload(file, options) {
    options = options || {};

    return new Promise(function(resolve, reject) {
        if (!file) {
            resolve(file);
            return;
        }
        if (!isImageUploadFile(file)) {
            resolve(file);
            return;
        }
        if (!shouldCompressUploadImage(file)) {
            resolve(file);
            return;
        }

        loadImageSourceForCompress(file)
            .then(function(loaded) {
                return canvasToJpegFile(file, loaded.source, loaded.isBitmap, options);
            })
            .then(resolve)
            .catch(function(err) {
                if (file.size && file.size <= 2 * 1024 * 1024 && !isHeicUploadFile(file)) {
                    resolve(file);
                    return;
                }
                if (isHeicUploadFile(file)) {
                    reject(new Error('相册中的 HEIC 格式无法识别，请改用拍照上传，或在系统相册中先分享/另存为 JPG 后再选'));
                    return;
                }
                reject(err && err.message ? err : new Error('无法处理该图片，请换一张或改用拍照上传'));
            });
    });
}


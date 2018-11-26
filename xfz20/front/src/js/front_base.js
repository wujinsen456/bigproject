
// 用来处理导航条//////////////////////////
// 将auth.js 中的代码放进 该文件中
function FrontBase() {

}

// 表示对象的入口
FrontBase.prototype.run = function () {
    var self = this;
    self.listenAuthBoxHover();
};

// 表示监听 用户 移入移出 事件
FrontBase.prototype.listenAuthBoxHover = function () {
    var authBox = $(".auth-box");
    var userMoreBox = $(".user-more-box");
    authBox.hover(function () {
        userMoreBox.show();
    },function () {
        userMoreBox.hide();
    });
};


// 用来处理登录和注册的//////////////////////////
function Auth() {
    var self = this;
    self.maskWrapper = $('.mask-wrapper');
    self.scrollWrapper = $(".scroll-wrapper");
    self.smsCaptcha = $('.sms-captcha-btn');
}

Auth.prototype.run = function () {
    var self = this;
    self.listenShowHideEvent();
    self.listenSwitchEvent();
    self.listenSigninEvent();
    self.listenImgCaptchaEvent();
    self.listenSmsCaptchaEvent();
    self.listenSignupEvent();
};

Auth.prototype.showEvent = function () {
    var self = this;
    self.maskWrapper.show();
};

Auth.prototype.hideEvent = function () {
    var self = this;
    self.maskWrapper.hide();
};

// 发送验证码成功
Auth.prototype.smsSuccessEvent = function () {
    var self = this;
    messageBox.showSuccess('短信验证码发送成功！');
    self.smsCaptcha.addClass('disabled');
    var count = 10;
    // 自动停止点击事件 unbind()
    self.smsCaptcha.unbind('click');
    var timer = setInterval(function () {
        self.smsCaptcha.text(count+'s');
        count -= 1;
        if(count <= 0){
            clearInterval(timer);
            self.smsCaptcha.removeClass('disabled');
            self.smsCaptcha.text('发送验证码');
            self.listenSmsCaptchaEvent();
        }
    },1000);
};

Auth.prototype.listenShowHideEvent = function () {
    var self = this;
    var signinBtn = $('.signin-btn');
    var signupBtn = $('.signup-btn');
    var closeBtn = $('.close-btn');

    signinBtn.click(function () {
        self.showEvent();
        self.scrollWrapper.css({"left":0});
    });

    signupBtn.click(function () {
        self.showEvent();
        self.scrollWrapper.css({"left":-400});
    });

    closeBtn.click(function () {
        self.hideEvent();
    });
};

// 监听切换事件
Auth.prototype.listenSwitchEvent = function () {
    var self = this;
    var switcher = $(".switch");
    switcher.click(function () {
        var currentLeft = self.scrollWrapper.css("left");
        currentLeft = parseInt(currentLeft);
        if(currentLeft < 0){
            self.scrollWrapper.animate({"left":'0'});
        }else{
            self.scrollWrapper.animate({"left":"-400px"});
        }
    });
};

//监听图形验证码 点击事件
Auth.prototype.listenImgCaptchaEvent = function () {
    var imgCaptcha = $('.img-captcha');
    imgCaptcha.click(function () {
        //重新请求url 重新获取验证码 不改变url ——给 url后面 加字符串
        //Math.random() 获取0-1 之间的小数
        imgCaptcha.attr("src","/account/img_captcha/"+"?random="+Math.random())
    });
};

//监听短信验证码 的点击事件
Auth.prototype.listenSmsCaptchaEvent = function () {
    var self = this;
    var smsCaptcha = $(".sms-captcha-btn");
    var telephoneInput = $(".signup-group input[name='telephone']");
    smsCaptcha.click(function () {
        var telephone = telephoneInput.val();
        if(!telephone){
            messageBox.showInfo('请输入手机号码！');
        }

        xfzajax.get({
            'url': '/account/sms_captcha/',
            'data':{
                'telephone': telephone
            },
            'success': function (result) {
                if(result['code'] == 200){
                    self.smsSuccessEvent();
                }
            },
            'fail': function (error) {
                console.log(error);
            }
        });
    });
};

//监听登陆事件
Auth.prototype.listenSigninEvent = function () {
    var self = this;
    // 因为模态对话框中有 登录和注册两个表单，其中的name值相同，所以通过大盒子在内部找相应的name以便区分
    var signinGroup = $('.signin-group');
    var telephoneInput = signinGroup.find("input[name='telephone']");
    var passwordInput = signinGroup.find("input[name='password']");
    var rememberInput = signinGroup.find("input[name='remember']");

    //找登录页面表单的登录按钮
    var submitBtn = signinGroup.find(".submit-btn");
    submitBtn.click(function () {
        //获取值
        var telephone = telephoneInput.val();
        var password = passwordInput.val();
         //获取值，remember获取方式不同
        var remember = rememberInput.prop("checked");

        // 因为 xfzajaxjs 文件已经引用到 front_base.py 中，所以 可以直接调用 xfzajax.post()
        xfzajax.post({
            'url': '/account/login/',
            'data': {
                'telephone': telephone,
                'password': password,
                'remember': remember?1:0
            },
            'success': function (result) {
                self.hideEvent();
                //重新加载页面
                window.location.reload();
            }
        });
    });
};


Auth.prototype.listenSignupEvent = function () {
    var signupGroup = $('.signup-group');
    var submitBtn = signupGroup.find('.submit-btn');
    submitBtn.click(function (event) {
        event.preventDefault();
        var telephoneInput = signupGroup.find("input[name='telephone']");
        var usernameInput = signupGroup.find("input[name='username']");
        var imgCaptchaInput = signupGroup.find("input[name='img_captcha']");
        var password1Input = signupGroup.find("input[name='password1']");
        var password2Input = signupGroup.find("input[name='password2']");
        var smsCaptchaInput = signupGroup.find("input[name='sms_captcha']");

        var telephone = telephoneInput.val();
        var username = usernameInput.val();
        var img_captcha = imgCaptchaInput.val();
        var password1 = password1Input.val();
        var password2 = password2Input.val();
        var sms_captcha = smsCaptchaInput.val();

        xfzajax.post({
            'url': '/account/register/',
            'data': {
                'telephone': telephone,
                'username': username,
                'img_captcha': img_captcha,
                'password1': password1,
                'password2': password2,
                'sms_captcha': sms_captcha
            },
            'success': function (result) {
                window.location.reload();
            }
        });
    });
};


$(function () {
    var auth = new Auth();
    auth.run();
});


$(function () {
    var frontBase = new FrontBase();
    frontBase.run();
});

$(function () {
    if(window.template){
        template.defaults.imports.timeSince = function (dateValue) {
            var date = new Date(dateValue);
            var datets = date.getTime(); // 得到的是毫秒的
            var nowts = (new Date()).getTime(); //得到的是当前时间的时间戳
            var timestamp = (nowts - datets)/1000; // 除以1000，得到的是秒
            if(timestamp < 60) {
                return '刚刚';
            }
            else if(timestamp >= 60 && timestamp < 60*60) {
                minutes = parseInt(timestamp / 60);
                return minutes+'分钟前';
            }
            else if(timestamp >= 60*60 && timestamp < 60*60*24) {
                hours = parseInt(timestamp / 60 / 60);
                return hours+'小时前';
            }
            else if(timestamp >= 60*60*24 && timestamp < 60*60*24*30) {
                days = parseInt(timestamp / 60 / 60 / 24);
                return days + '天前';
            }else{
                var year = date.getFullYear();
                var month = date.getMonth();
                var day = date.getDay();
                var hour = date.getHours();
                var minute = date.getMinutes();
                return year+'/'+month+'/'+day+" "+hour+":"+minute;
            }
        }
    }
});
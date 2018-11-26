
// 点击登录按钮，弹出模态对话框
// $(function () {
//     $("#btn").click(function () {
//         $(".mask-wrapper").show();
//     });
//
//     $(".close-btn").click(function () {
//         $(".mask-wrapper").hide();
//     });
// });
//
//
// $(function () {
//     $(".switch").click(function () {
//         var scrollWrapper = $(".scroll-wrapper");
//         var currentLeft = scrollWrapper.css("left");
//         currentLeft = parseInt(currentLeft);
//         if(currentLeft < 0){
//             scrollWrapper.animate({"left":'0'});
//         }else{
//             scrollWrapper.animate({"left":"-400px"});
//         }
//     });
// });

// 用面向对象的方法定义 代码更加优雅，更利于阅读，容易使用，容易重构

//构造一个函数
function Auth() {
    var self = this;
    self.maskWrapper = $('.mask-wrapper');
    self.scrollWrapper = $(".scroll-wrapper");
}

//在函数上绑定 run 方法
//表示一个程序/函数的入口
Auth.prototype.run = function () {
    var self = this;
    self.listenShowHideEvent();
    self.listenSwitchEvent();
    self.listenSigninEvent();
};

//表示显示的事件
Auth.prototype.showEvent = function () {
    var self = this;
    self.maskWrapper.show();
};

//表示隐藏事件
Auth.prototype.hideEvent = function () {
    var self = this;
    self.maskWrapper.hide();
};

//监听显示和隐藏的事件
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

// // 监听登陆事件
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
        //获取值，remember获取方式不同，被勾选上，prop("checked")返回true ，否则返回false
        var remember = rememberInput.prop("checked");

        // 因为 xfzajaxjs 文件已经引用到 front_base.py 中，所以 可以直接调用 xfzajax.post()
        xfzajax.post({
            'url': '/account/login/',
            'data': {
                'telephone': telephone,
                'password': password,
                'remember': remember?1:0    //三元运算符
            },
            'success': function (result) {
                if(result['code'] == 200){
                    self.hideEvent();
                    //重新加载页面
                    window.location.reload();
                }else{      //显示错误信息：添加 front / src / js / message.js 文件，用来动态的显示错误信息
                    var messageObject = result['message'];
                    if(typeof messageObject == 'string' || messageObject.constructor == String){
                        // console.log(messageObject)

                        window.messageBox.show(messageObject);
                    }else{
                        // {"password":['密码最大长度不能超过20为！','xxx'],"telephone":['xx','x']}
                        for(var key in messageObject){
                            var messages = messageObject[key];
                            var message = messages[0];
                            // console.log(message)
                            window.messageBox.show(message);
                        }
                    }
                }
            },
            'fail': function (error) {
                console.log(error);
            }
        });
    });
};

//整个页面都加载完 再运行里面的代码
//表示从入口执行
$(function () {
    var auth = new Auth();
    auth.run();
});
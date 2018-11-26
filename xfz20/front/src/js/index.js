// 面向对象
// 1. 添加属性
// 通过this关键字，绑定属性，并且指定他的值。
// 原型链
// 2. 添加方法
// 在Banner.prototype上绑定方法就可以了。

// function Banner() {
//     // 这个里面写的代码
//     // 相当于是Python中的__init__方法的代码
//     console.log('构造函数');
        //添加属性，通过this关键字，绑定属性，并且指定他的值。
//     this.person = 'zhiliao';
// }
//
// Banner.prototype.greet = function (word) {
//     console.log('hello ',word);
// };
//
// var banner = new Banner();
// console.log(banner.person);
// banner.greet('zhiliao');


//表示初始化方法
function Banner() {
    // 添加属性，通过this关键字，绑定属性，并且指定他的值。
    this.bannerWidth = 798;
    //this.xx = $("xx") 表示获取到 xx
    this.bannerGroup = $("#banner-group");
    //当鼠标 移动到banner上时，暂停轮播，将index保存在全局变量中，
    //移出时，轮播时就会接着上一次的图片往下轮播
    this.index = 1;
    //获取 左右箭头
    this.leftArrow = $(".left-arrow");
    this.rightArrow = $(".right-arrow");

    this.bannerUl = $("#banner-ul");
    //获取 bannerUl 下的 li 标签列表
    this.liList = this.bannerUl.children("li");
    //获取 bannerUl 下的 li 标签列表的长度
    this.bannerCount = this.liList.length;
    this.pageControl = $(".page-control");
}

//通过原型链，在Banner上面绑定方法 initBanner()
Banner.prototype.initBanner = function () {
    //thid 表示该 function 下的this ，想要使用Banner上的this，声明一个变量self
    var self = this;
    var firstBanner = self.liList.eq(0).clone();
    var lastBanner = self.liList.eq(self.bannerCount-1).clone();
    self.bannerUl.append(firstBanner);
    self.bannerUl.prepend(lastBanner);
    self.bannerUl.css({"width":self.bannerWidth*(self.bannerCount+2),'left':-self.bannerWidth});
};

Banner.prototype.initPageControl = function () {
    //此处的 this 表示Banner 对象的this
    var self = this;
    for(var i=0; i<self.bannerCount; i++){
        var circle = $("<li></li>");
        self.pageControl.append(circle);
        if(i === 0){
            circle.addClass("active");
        }
    }
    self.pageControl.css({"width":self.bannerCount*12+8*2+16*(self.bannerCount-1)});
};


//显示 或 隐藏左右剪头的方法
Banner.prototype.toggleArrow = function (isShow) {
    //此处的 this 表示Banner 对象的this
    var self = this;
    if(isShow){
        self.leftArrow.show();
        self.rightArrow.show();
    }else{
        self.leftArrow.hide();
        self.rightArrow.hide();
    }
};

//banner 从左往右移动
Banner.prototype.animate = function () {
    //此处的 this 表示Banner 对象的this
    var self = this;
    self.bannerUl.animate({"left":-798*self.index},500);
    var index = self.index;
    if(index === 0){
        index = self.bannerCount-1;
    }else if(index === self.bannerCount+1){
        index = 0;
    }else{
        index = self.index - 1;
    }
    self.pageControl.children('li').eq(index).addClass("active").siblings().removeClass('active');
};

//banner 实现自动轮播
Banner.prototype.loop = function () {
    //此处的 this 表示Banner 对象的this
    var self = this;
    this.timer = setInterval(function () {
        if(self.index >= self.bannerCount+1){
            self.bannerUl.css({"left":-self.bannerWidth});
            self.index = 2;
        }else{
            self.index++;
        }
        self.animate();
    },2000);
};

//监听箭头 点击事件
Banner.prototype.listenArrowClick = function () {
    //此处的 this 表示Banner 对象的this
    var self = this;
    //点击左箭头执行的方法
    self.leftArrow.click(function () {
        //当点击到第一章banner图片时，将index指定为最后一张图片
        if(self.index === 0){
            // ==：1 == '1'：true
            // ==== 1 != '1'
            self.bannerUl.css({"left":-self.bannerCount*self.bannerWidth});
            self.index = self.bannerCount - 1;
        }else{
            self.index--;
        }
        self.animate();
    });

     //点击有箭头执行的方法
    self.rightArrow.click(function () {
        if(self.index === self.bannerCount + 1){
            self.bannerUl.css({"left":-self.bannerWidth});
            self.index = 2;
        }else{
            self.index++;
        }
        self.animate();
    });
};

//监听banner 移入移出 方法
Banner.prototype.listenBannerHover = function () {
    //此处的 this 表示Banner 对象的this
    var self = this;
    this.bannerGroup.hover(function () {
        // 第一个函数是，把鼠标移动到banner上会执行的函数
        clearInterval(self.timer);
        //移入，显示箭头
        self.toggleArrow(true);
    },function () {
        // 第二个函数是，把鼠标从banner上移走会执行的函数
        self.loop();
        //移出，隐藏箭头
        self.toggleArrow(false);
    });
};

Banner.prototype.listenPageControl = function () {
    var self = this;
    self.pageControl.children("li").each(function (index,obj) {
        $(obj).click(function () {
            self.index = index;
            self.animate();
        });
    });
};

//让轮播图运行起来，绑定 run() 方法，进行执行方法步骤的拼接
Banner.prototype.run = function () {
    console.log("sss");
    this.initBanner();
    this.initPageControl();
    this.loop();
    this.listenBannerHover();
    this.listenArrowClick();
    this.listenPageControl();
};

//确保 整个文档元素加载完之后，再执行轮播
$(function () {
    //实例化一个Banner对象，以后均用实例banner
    var banner = new Banner();
    banner.run();
});
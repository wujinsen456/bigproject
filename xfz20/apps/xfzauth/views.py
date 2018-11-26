#encoding: utf-8

from django.contrib.auth import login,logout,authenticate
from django.views.decorators.http import require_POST
from .forms import LoginForm
from django.http import JsonResponse
from utils import restful
from django.shortcuts import redirect,reverse
# 引用 生成图片验证码的 模块
from utils.captcha.xfzcaptcha import Captcha
# 用来存储一些Bytes类型的数据，相当于一个内存管道，先把图片保存在里面，最后生成一个流对象
from io import BytesIO
from django.http import HttpResponse
from django.core.cache import cache



# 一般这样设计：
# {"code":400,"message":"","data":{}}

# 装饰器表示 这个函数只能用POST 提交
@require_POST
def login_view(request):
    form = LoginForm(request.POST)
    if form.is_valid():
        telephone = form.cleaned_data.get('telephone')
        password = form.cleaned_data.get('password')
        remember = form.cleaned_data.get('remember')
        # 在使用authenticate进行验证后，如果验证通过了。
        # 那么会返回一个user对象，拿到user对象后，可以使用django.contrib.auth.login进行登录.
        user = authenticate(request,username=telephone,password=password)
        if user:
            if user.is_active:
                login(request,user)
                if remember:
                    #  浏览器关闭后 默认过期时间为两周
                    request.session.set_expiry(None)
                else:
                    # 浏览器关闭后 马上过期
                    request.session.set_expiry(0)

                # JsonResponse({'code':200,'message':'','data':{}}) 重复代码很多，
                # 因此可以把它单独抽取出来，放进一个函数里，把相关的数据传进去即可，
                # 即将重复性的代码 重构
                # return JsonResponse({'code':200,'message':'','data':{}})
                return restful.ok()
            else:
                # return JsonResponse({'code': 405, 'message':'您的账号已经被冻结了', 'data': {}})
                return restful.unauth(message="您的账号已经被冻结了！")
        else:
            # return JsonResponse({'code': 400, 'message': '手机号或密码错误', 'data': {}})
            return restful.params_error(message="手机号或者密码错误！")
    else:
        errors = form.get_errors()
        # return JsonResponse({'code': 400, 'message': '', 'data': errors})
        # {"password":['密码最大长度不能超过20为！','xxx'],"telephone":['xx','x']}
        return restful.params_error(message=errors)


def logout_view(request):
    logout(request)
    return redirect(reverse('index'))


# 生成一个图形验证码
def img_captcha(request):
    text,image = Captcha.gene_code()
    # BytesIO：相当于一个管道，用来存储图片的流数据
    out = BytesIO()
    # 调用image的save方法，将这个image对象保存到BytesIO中
    image.save(out,'png')
    # 将BytesIO的文件指针移动到最开始的位置
    out.seek(0)

    # 代表存储的类型是一个图片  content_type 指定存储的类型
    response = HttpResponse(content_type='image/png')
    # 从BytesIO的管道中，读取出图片数据，保存到response对象上
    response.write(out.read())
    # 获取当前文件指针的位置 out.tell()
    response['Content-length'] = out.tell()

    # 12Df：12Df.lower()，将 图片验证码添加到 缓存中 ，text.lower() 表示k ,下一个text.lower() 表示值 设置过期时间为5min
    cache.set(text.lower(),text.lower(),5*60)

    return response

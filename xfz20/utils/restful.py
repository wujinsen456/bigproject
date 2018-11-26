# #encoding: utf-8
# 重构 restful API
from django.http import JsonResponse


class HttpCode(object):
    ok = 200
    paramserror = 400       # 参数错误
    unauth = 401            # 没有授权
    methoderror = 405       # 请求方法错误
    servererror = 500       # 服务器内部错误           后台定义好编码错误，告诉前段，哪个状态码是什么意思


# {"code":400,"message":"","data":{}}   restful规范：这三个参数不管有没有值，都必须要传进去
# 返回 restful 的结果
def result(code=HttpCode.ok,message="",data=None,kwargs=None):      # kwargs=None 除了那三个值，可能还会传其它的值
    json_dict = {"code":code,"message":message,"data":data}

    if kwargs and isinstance(kwargs,dict) and kwargs.keys():
        json_dict.update(kwargs)

    return JsonResponse(json_dict)


def ok():
    return result()

def params_error(message="",data=None):
    return result(code=HttpCode.paramserror,message=message,data=data)

def unauth(message="",data=None):
    return result(code=HttpCode.unauth,message=message,data=data)

def method_error(message='',data=None):
    return result(code=HttpCode.methoderror,message=message,data=data)

def server_error(message='',data=None):
    return result(code=HttpCode.servererror,message=message,data=data)

# 该文件用来返回一些 restful的接口
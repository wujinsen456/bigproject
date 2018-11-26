#encoding: utf-8

from django.contrib.auth.models import AbstractBaseUser,PermissionsMixin,BaseUserManager
from shortuuidfield import ShortUUIDField
from django.db import models


# 重新定义Manager对象，在创建user的时候使用telephone和password，而不是使用username和password
class UserManager(BaseUserManager):
    # 私有方法，在外面不能被使用
    def _create_user(self,telephone,username,password,**kwargs):
        if not telephone:
            raise ValueError('请传入手机号码！')
        if not username:
            raise ValueError('请传入用户名！')
        if not password:
            raise ValueError('请传入密码！')

        user = self.model(telephone=telephone,username=username,**kwargs)
        user.set_password(password)
        user.save()
        return user

    # 创建普通用户
    def create_user(self,telephone,username,password,**kwargs):
        kwargs['is_superuser'] = False
        return self._create_user(telephone,username,password,**kwargs)

    # 创建超级用户
    def create_superuser(self,telephone,username,password,**kwargs):
        kwargs['is_superuser'] = True
        kwargs['is_staff'] = True
        return self._create_user(telephone,username,password,**kwargs)


# 创建模型
# 想修改默认的验证方式，并且对于原来User模型上的一些字段不想要，
# 那么可以自定义一个模型，然后继承自AbstractBaseUser，再添加你想要的字段
class User(AbstractBaseUser,PermissionsMixin):
    # 我们不使用默认的自增长的主键
    # 为什么不使用？因为加入你的网站上用户有100个用户，那这100的用户的id就是1-100，
# 这样就存在很大的安全隐患。例如公司宣称注册用户有100万人，当别人访问用户的个人主页的时候，
# 通常是通过id获取用户，当id100能取到用户，id101取不到了，id102等都取不到，
# 这就证明 注册用户没有那么多，这样就泄露公司的机密

    # uuid：是唯一的字符串，但是缺点是 字符串特别长，当查询时，需要匹配的字符串就越多，影响查询性能
    # shortuuid：也是uuid,是比较短的uuid ,字符串既能保持唯一，也不会太长，是理想的选择
    # Shortuuidfield：pip install django-shortuuidfield 安装包

    # 创建主键
    uid = ShortUUIDField(primary_key=True)
    telephone = models.CharField(max_length=11,unique=True)
    email = models.EmailField(unique=True,null=True)
    username = models.CharField(max_length=100)
    # 是否是可用的
    is_active = models.BooleanField(default=True)
    # 是否是员工
    is_staff = models.BooleanField(default=False)
    # 什么时候加入
    data_joined = models.DateTimeField(auto_now_add=True)

    # 用来指定验证
    # 指定telephone作为USERNAME_FIELD，以后使用authenticate函数验证的时候，就可以根据telephone来验证
    # 而不是原来的username
    USERNAME_FIELD = 'telephone'
    # telephone，username，password
    # 创建超级用户时：虽然只是指定username，但是USERNAME_FIELD = 'telephone'的值和password自动会出现
    REQUIRED_FIELDS = ['username']
    # 给用户发送邮件
    EMAIL_FIELD = 'email'

    # 创建一个对象
    objects = UserManager()

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username


# 在创建了新的User模型后，还需要在settings中配置好。配置AUTH_USER_MODEL='appname.User'。
# 使用 User 写登录功能


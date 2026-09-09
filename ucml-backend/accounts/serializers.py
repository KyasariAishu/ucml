from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password 

# in djnago.contrib.auth we have admin, apps,backends ,base_user,checks,
# context_processor, decorators ,forms,hashers ,middleware,mixins, models,password_validation
# signals, taokens,validators, views :- all the files 
# C:\Users\Admin\AppData\Local\Programs\Python\Python314\Lib\site-packages\django\contrib\auth

from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Profile 

class RegisterSerializer(serializers.ModelSerializer):
    email=serializers.EmailField(validators=[UniqueValidator(queryset=User.objects.all(), message="Email already registered.")])
    full_name=serializers.CharField(max_length=150, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model=User 
        fields = ["email", "full_name", "password"]
    def create(self,validated_data):
        full_name = validated_data.pop("full_name", "")
        user = User.objects.create_user(
            username=validated_data["email"],   # email doubles as username internally
            email=validated_data["email"],
            password=validated_data["password"],
        )
        Profile.objects.create(user=user, full_name=full_name)

        return user 


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="profile.full_name", read_only=True)

    class Meta:
        model = User
        fields = ["email", "full_name", "date_joined"]

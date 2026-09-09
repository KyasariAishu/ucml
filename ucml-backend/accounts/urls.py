from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import MeView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
]



'''

curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" -d "{\"username\": \"aishwarya\", \"password\": \"Kyasari@123\"}"


The client sends: 
{
    "username": "aishwarya",
    "password": "password123"
}
TokenObtainPairView verifies the credentials and generates:
{
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi..."
}
TokenRefreshView do
path(
    "token/refresh/",
    TokenRefreshView.as_view(),
    name="token_refresh"
)

Access token  → expires in 5 minutes
Refresh token → expires in 1 day
After the access token expires, you don't want the user to enter their username/password again. POST /token/refresh/
{
    "refresh": "eyJhbGciOi..."
}
The server validates the refresh token and gives you a new access token.
'''
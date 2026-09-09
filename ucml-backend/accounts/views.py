from rest_framework import generics , permissions
# In generics we have :- CreateAPIView(POST) , ListAPIView(GET), RetrieveAPIView(GET), UpdateAPIView(PUT,PATCH),DestroyAPIView(DELETE)
# ListCreateAPIView(GET,POST) ,RetrieveUpdateAPIView(GET,PUT/PATCH),RetrieveDestroyAPIView(GET,DELETE),RetrieveUpdateDestroyAPIView
from .serializers import RegisterSerializer,UserSerializer

# In permissons we have 1.AllowAny(Anyone can access the API, authenticated or not) 2.IsAuthenticated(Only logged-in/authenticated users)
# IsAdminUser(Only users with is_staff=True) 4.IsAuthenticatedOrReadOnly(Anyone can GET, but only authenticated users can modify)
# DjangoModelPermissions(Uses Django model permissions (add, change, delete, etc.)),DjangoObjectPermissions etc 
class RegisterView(generics.CreateAPIView):
    serializer_class=RegisterSerializer
    permission_classes = [permissions.AllowAny]

class MeView(generics.RetrieveAPIView):
    serializer_class=UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

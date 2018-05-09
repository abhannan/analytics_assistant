from django.urls import path 
from calendar_assistant import views

app_name = 'calendar_assistant'
urlpatterns = [
  path(r'access-token-home/', views.access_token_home, name='access-token-home'),
  path(r'gettoken/', views.gettoken, name='gettoken'),
  path(r'mail/', views.mail, name='mail'),
  path(r'events/', views.events, name='events'),
]
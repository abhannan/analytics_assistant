import datetime
from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from calendar_assistant.authhelper import get_signin_url, get_token_from_code, get_access_token
from calendar_assistant.outlookservice import get_me, get_my_messages, get_my_events
import time


def access_token_home(request):
    redirect_uri = request.build_absolute_uri(reverse('calendar_assistant:gettoken'))
    sign_in_url = get_signin_url(redirect_uri)
    return HttpResponse('<a href="' + sign_in_url +'">Click here to sign in and view your mail</a>')

def gettoken(request):
      auth_code = request.GET['code']
      redirect_uri = request.build_absolute_uri(reverse('calendar_assistant:gettoken'))
      token = get_token_from_code(auth_code, redirect_uri)
      access_token = token['access_token']
      user = get_me(access_token)
      refresh_token = token['refresh_token']
      expires_in = token['expires_in']
      expiration = int(time.time()) + expires_in - 300
      request.session['access_token'] = access_token
      request.session['refresh_token'] = refresh_token
      request.session['token_expires'] = expiration
      return HttpResponseRedirect(reverse('calendar_assistant:mail'))

def mail(request):
      access_token = get_access_token(request, request.build_absolute_uri(reverse('calendar_assistant:gettoken')))
      if not access_token:
            return HttpResponseRedirect(reverse('calendar_assistant:home'))
      else:
        messages = get_my_messages(access_token)
        context = { 'messages': messages['value'] }
        return render(request, 'calendar_assistant/mail.html', context)

def events(request):
    start_date = request.GET.get("startDateTime")
    end_date = request.GET.get("endDateTime")
    start_time = "T00:00:00.0000000"
    end_time = "T23:00:00.0000000"
    start_date_time = start_date + start_time
    end_date_time = end_date + end_time
    access_token = get_access_token(request, request.build_absolute_uri(reverse('calendar_assistant:gettoken')))
    if not access_token:
        return HttpResponseRedirect(reverse('calendar_assistant:home'))
    else:
        events = get_my_events(access_token, start_date_time, end_date_time)
        return JsonResponse(events['value'], safe=False)
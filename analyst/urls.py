"""virtual_analyst URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from django.views.decorators.csrf import csrf_exempt
from . import views, import_data


urlpatterns = [
    re_path('^$', csrf_exempt(views.index), name='home'),

    # get the chat conversation going with user and watson:
    path('api/message', csrf_exempt(views.conversation_watson_user), name='send_request'),

    # complete rest data without any filter:
    path(r'api/v1/financial_data',
        views.ListFinancialData.as_view(),
        name='complete_financial_data'),  # Complete Data

    # General data requests like:
    path(r'api/v1/data/filtered',
         views.FilteredDataForGeneralRequests.as_view(),
         name='filtered_data_general'),

    # Comparison data requests like:
    path(r'api/v1/data/comparison',
         views.FilteredDataForComparisonRequests.as_view(),
         name='filtered_data_comparison'),

    #  import data from the csv files:
    path('import-financial-data', import_data.import_financial_data, name='import-financial-data'),
    path('import-stats-data', import_data.import_stats_data, name='import-stats-data'),
]

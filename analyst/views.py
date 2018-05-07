from .models import FinancialData, StatsData
from .serializers import FinancialDataSerializer, StatsDataSerializer
from .sqlqueries import *
from django.shortcuts import render
from django.http import JsonResponse
import watson_developer_cloud
import json
from rest_framework import generics


def index(request):
    return render(request, 'analyst/index.html', {})


def conversation_watson_user(request):
    user_request_context = {}
    conversation = watson_developer_cloud.ConversationV1(
        username='',
        password='',
        version='')

    workspace_id = ''
    if request.method == 'POST':
        user_request = json.loads(request.body.decode("utf-8"))
    try:
        user_request['input']
        user_request_text = user_request['input']['text']
        user_request_context = user_request['context']
    except KeyError as err:
        print(err)
        user_request_text = ""

    response = conversation.message(
        workspace_id=workspace_id,
        input={
            'text': user_request_text},
        context=user_request_context
    )
    return JsonResponse(response)


class ListFinancialData(generics.ListCreateAPIView):  # Complete Serialized Financial Data
    queryset = FinancialData.objects.all()
    serializer_class = FinancialDataSerializer


class FilteredDataForGeneralRequests(generics.ListAPIView):  # Serialized Filtered Financial & Stats Data

    def get_serializer_class(self):
        if self.request.GET.get("request_type") == 'get_financials':
            serializer_class = FinancialDataSerializer
        elif self.request.GET.get("request_type") == 'get_stats':
            serializer_class = StatsDataSerializer
        return serializer_class

    def get_queryset(self, *args, **kwargs):
        start_year_category = self.request.GET.get("financial_year_id_start")
        end_year_category = self.request.GET.get("financial_year_id_end")
        start_month_category = self.request.GET.get("financial_month_id_start")
        end_month_category = self.request.GET.get("financial_month_id_end")
        if self.request.GET.get("request_type") == 'get_financials':
            if start_year_category == end_year_category:
                queryset_filtered_airline = FinancialData.objects.raw(sql_query_for_same_year.format(
                    start_year_category, start_month_category,
                    end_month_category, end_year_category,
                    start_month_category, end_month_category
                ))
            else:
                queryset_filtered_airline = FinancialData.objects.raw(sql_query_for_different_years.format(
                    start_year_category, start_month_category, end_year_category, end_month_category
                ))

        elif self.request.GET.get("request_type") == 'get_stats':
            if start_year_category == end_year_category:
                queryset_filtered_airline = StatsData.objects.raw(sql_query_for_same_year.format(
                    start_year_category, start_month_category,
                    end_month_category, end_year_category,
                    start_month_category, end_month_category
                ))
            else:
                queryset_filtered_airline = StatsData.objects.raw(sql_query_for_different_years.format(
                    start_year_category, start_month_category, end_year_category, end_month_category
                ))

        return queryset_filtered_airline


class FilteredDataForComparisonRequests(
    generics.ListAPIView):  # Serialized Filtered Financial & Stats Data for Comparison

    def get_serializer_class(self):
        if self.request.GET.get("request_type") == 'comparison_financials':
            serializer_class = FinancialDataSerializer
        elif self.request.GET.get("request_type") == 'comparison_stats':
            serializer_class = StatsDataSerializer
        return serializer_class

    def get_queryset(self, *args, **kwargs):
        first_year_category = self.request.GET.get("financial_year_id_first")
        second_year_category = self.request.GET.get("financial_year_id_second")
        start_month_category = self.request.GET.get("financial_month_id_start")
        end_month_category = self.request.GET.get("financial_month_id_end")
        if self.request.GET.get("request_type") == 'comparison_financials':
            if self.request.GET.get("request_period") == "single":
                if first_year_category == second_year_category:
                    queryset_filtered_airline = FinancialData.objects.raw(
                        sql_query_for_comparison_same_month_different_years.format(
                            first_year_category, start_month_category,
                            second_year_category, end_month_category
                        ))
                else:
                    queryset_filtered_airline = FinancialData.objects.raw(
                        sql_query_for_comparison_multiple_months_different_years.format(
                            first_year_category, start_month_category, end_month_category,
                            second_year_category, start_month_category, end_month_category
                        ))
            elif self.request.GET.get("request_period") == "multiple":
                queryset_filtered_airline = FinancialData.objects.raw(
                    sql_query_for_comparison_multiple_months_different_years
                        .format(first_year_category, start_month_category, end_month_category,
                                second_year_category, start_month_category, end_month_category
                                ))

        elif self.request.GET.get("request_type") == 'comparison_stats':
            if self.request.GET.get("request_period") == "single":
                if first_year_category == second_year_category:
                    queryset_filtered_airline = StatsData.objects.raw(
                        sql_query_for_comparison_same_month_different_years.format(
                            first_year_category, start_month_category,
                            second_year_category, end_month_category
                        ))
                else:
                    queryset_filtered_airline = StatsData.objects.raw(
                        sql_query_for_comparison_multiple_months_different_years.format(
                            first_year_category, start_month_category, end_month_category,
                            second_year_category, start_month_category, end_month_category
                        ))
            elif self.request.GET.get("request_period") == "multiple":
                queryset_filtered_airline = StatsData.objects.raw(
                    sql_query_for_comparison_multiple_months_different_years
                        .format(first_year_category, start_month_category, end_month_category,
                                second_year_category, start_month_category, end_month_category
                                ))

        return queryset_filtered_airline

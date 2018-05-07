from django.contrib import admin
from .models import Year, Month, FinancialData, StatsData

class FinancialDataAdmin(admin.ModelAdmin):
    model = FinancialData
    list_display = ('financial_year', 'financial_month', 'passenger_revenue', 'cargo_revenue', 'aircraft_fuel')

class StatsDataAdmin(admin.ModelAdmin):
    model = StatsData
    list_display = ('financial_year', 'financial_month', 'block_hours', 'flight_hours')

admin.site.register(Year)
admin.site.register(Month)
admin.site.register(FinancialData, FinancialDataAdmin)
admin.site.register(StatsData, StatsDataAdmin)

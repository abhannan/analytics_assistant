from rest_framework import serializers
from .models import FinancialData, StatsData


class FinancialDataSerializer(serializers.ModelSerializer):
    financial_year = serializers.CharField(source="financial_year.year")
    financial_month = serializers.CharField(source="financial_month.get_month_display")

    class Meta:
        model = FinancialData
        fields = (
            'financial_year',
            'financial_month',
            'passenger_revenue',
            'cargo_revenue',
            'other_revenue',
            'aircraft_fuel',
            'aircraft_maintenance',
            'commissions',
            'ground_handling',
            'salaries_wages',
            'aircraft_lease',
            'overheads',
            'non_operating_items',
        )


class StatsDataSerializer(serializers.ModelSerializer):
    financial_year = serializers.CharField(source="financial_year.year")
    financial_month = serializers.CharField(source="financial_month.get_month_display")

    class Meta:
        model = StatsData
        fields = (
            'financial_year',
            'financial_month',
            'block_hours',
            'flight_hours',
            'departures',
            'rev_pax_miles',
            'avail_seat_miles',
            'fuel_gallons',
        )
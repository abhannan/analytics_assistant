import csv
from .models import FinancialData, StatsData


def import_financial_data(request):
    available_data = []
    with open('/Users/Hannan/Documents/Projects/analytics_assistant/virtual_analyst/static/csv/2013.csv', 'r') as f:
        rows = csv.reader(f)
        headers = next(rows)
        for row in rows:
            monthly_dict = {}
            month = row[0]
            monthly_data = dict(zip(headers[1:], row[1:]))
            monthly_dict[month] = monthly_data
            available_data.append(monthly_dict)

    month_counter = 0

    for row in available_data:
        for key, value in row.items():
            month_counter += 1
            FinancialData.objects.update_or_create(
                financial_year_id=5,
                financial_month_id=month_counter,
                passenger_revenue=value['Passenger Revenue'],
                cargo_revenue=value['Cargo Revenue'],
                other_revenue=value['Other Revenue'],
                aircraft_fuel=value['Fuel'],
                aircraft_maintenance=value['Maintenance'],
                commissions=value['Commission'],
                ground_handling=value['Ground Handling'],
                salaries_wages=value['Salaries and Wages'],
                aircraft_lease=value['Aircraft Lease'],
                overheads=value['Overheads'],
                non_operating_items=value['Non-Operating']
            )


def import_stats_data(request):
    available_data = []
    with open('/Users/Hannan/Documents/Projects/analytics_assistant/virtual_analyst/static/csv/2013_stats.csv', 'r') as f:
        rows = csv.reader(f)
        headers = next(rows)
        for row in rows:
            monthly_dict = {}
            month = row[0]
            monthly_data = dict(zip(headers[1:], row[1:]))
            monthly_dict[month] = monthly_data
            available_data.append(monthly_dict)

    month_counter = 0

    for row in available_data:
        for key, value in row.items():
            month_counter += 1
            StatsData.objects.create(
                financial_year_id=5,
                financial_month_id=month_counter,
                block_hours=value['Block Hours'],
                flight_hours=value['Flight Hours'],
                departures=value['Departures'],
                rev_pax_miles=value['RPMs'],
                avail_seat_miles=value['ASMs'],
                fuel_gallons=value['Gallons'],
            )

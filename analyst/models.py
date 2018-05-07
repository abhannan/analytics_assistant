from django.db import models
from django.utils.dates import MONTHS


class Year(models.Model):
    YEARS_CHOICE = (
        (2012, 2012),
        (2013, 2013),
        (2014, 2014),
        (2015, 2015),
        (2016, 2016),
        (2017, 2017),
    )
    year = models.IntegerField(choices=YEARS_CHOICE, blank=True, null=True)

    def __str__(self):
        return str(self.year)


class Month(models.Model):
    financial_year = models.ForeignKey(Year, on_delete=models.CASCADE, default=2017)
    month = models.IntegerField(choices=MONTHS.items(), blank=True, null=True)

    def __str__(self):
        return str(self.month)


class FinancialData(models.Model):  #
    financial_year = models.ForeignKey(Year, on_delete=models.CASCADE)
    financial_month = models.ForeignKey(Month, on_delete=models.CASCADE)
    passenger_revenue = models.DecimalField(max_digits=7, decimal_places=2)
    cargo_revenue = models.DecimalField(max_digits=7, decimal_places=2)
    other_revenue = models.DecimalField(max_digits=7, decimal_places=2)
    aircraft_fuel = models.DecimalField(max_digits=7, decimal_places=2)
    aircraft_maintenance = models.DecimalField(max_digits=7, decimal_places=2)
    commissions = models.DecimalField(max_digits=7, decimal_places=2)
    ground_handling = models.DecimalField(max_digits=7, decimal_places=2)
    salaries_wages = models.DecimalField(max_digits=7, decimal_places=2)
    aircraft_lease = models.DecimalField(max_digits=7, decimal_places=2)
    overheads = models.DecimalField(max_digits=7, decimal_places=2)
    non_operating_items = models.DecimalField(max_digits=7, decimal_places=2)

    def __str__(self):
        return str(self.passenger_revenue)


class StatsData(models.Model):
    financial_year = models.ForeignKey(Year, on_delete=models.CASCADE)
    financial_month = models.ForeignKey(Month, on_delete=models.CASCADE)
    block_hours = models.DecimalField(max_digits=6, decimal_places=2)  # in thousands
    flight_hours = models.DecimalField(max_digits=6, decimal_places=2)  # in thousands
    departures = models.DecimalField(max_digits=6, decimal_places=2)  # in thousands
    rev_pax_miles = models.DecimalField(max_digits=7, decimal_places=4)  # in billions
    avail_seat_miles = models.DecimalField(max_digits=7, decimal_places=4)  # in billions
    fuel_gallons = models.DecimalField(max_digits=6, decimal_places=2)  # in millions

    def __str__(self):
        return str(self.block_hours)

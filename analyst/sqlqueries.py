sql_query_for_same_year = 'SELECT * FROM analyst_financialdata WHERE (financial_year_id = {} ' \
                           'AND financial_month_id BETWEEN {} AND {}) ' \
                           'OR (financial_year_id = {} AND financial_month_id BETWEEN {} AND {})'

sql_query_for_different_years = 'SELECT * FROM analyst_financialdata WHERE (financial_year_id = {} ' \
                            'AND financial_month_id >= {}) OR (financial_year_id = {} ' \
                            'AND financial_month_id <= {})'

sql_query_for_comparison_same_month_different_years = 'SELECT * FROM analyst_financialdata WHERE (financial_year_id = {} ' \
                            'AND financial_month_id = {}) OR (financial_year_id = {} ' \
                            'AND financial_month_id = {})'

sql_query_for_comparison_different_months_different_years = 'SELECT * FROM analyst_financialdata ' \
                                                            'WHERE (financial_year_id = {} AND financial_month_id = {}) ' \
                                                            'OR (financial_year_id = {} AND financial_month_id = {})'

sql_query_for_comparison_multiple_months_different_years = 'SELECT * FROM analyst_financialdata ' \
                                                           'WHERE (financial_year_id = {} AND financial_month_id BETWEEN {} AND {}) ' \
                                                           'OR (financial_year_id = {} AND financial_month_id BETWEEN {} AND {})'

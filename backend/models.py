def get_terminal_growth(sector):
    sector_growth_defaults = {
        'Technology': 3.0,
        'Healthcare': 2.5,
        'Consumer Cyclical': 2.7,
        'Financial Services': 2.3,
        'General': 2.4,
    }
    return sector_growth_defaults.get(sector, 2.5)


def run_dcf_engine(result, warnings):
    try:
        price = result.get('price', 0)
        eps = result.get('eps', 0)
        growth = result.get('growthRate', 0) / 100
        wacc = result.get('wacc', 9.0) / 100
        terminal_growth = result.get('terminalGrowth', 2.5) / 100
        exit_pe = result.get('exitPE', 15.0)

        if price <= 0 or eps <= 0:
            raise ValueError('Insufficient base data for DCF')

        result['intrinsicValue'] = round(price * (1 + growth) / (wacc - terminal_growth), 2)
        result['valuationSource'] = 'Simple DCF proxy engine'
    except Exception as exc:
        warnings.append(f'DCF engine failed: {exc}')
        result['intrinsicValue'] = 0.0
        result['valuationSource'] = 'DCF fallback failure'

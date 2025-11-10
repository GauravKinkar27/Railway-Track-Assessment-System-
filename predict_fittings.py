import sys
import json

def predict_railway_fittings(line_length_km, gauge_type):
    if line_length_km <= 0:
        raise ValueError("Line length must be positive.")
    
    if gauge_type.upper() == 'BG':
        sleepers_per_km = 1660
    elif gauge_type.upper() == 'MG':
        sleepers_per_km = 1430
    elif gauge_type.upper() == 'NG':
        sleepers_per_km = 1200
    else:
        raise ValueError("Invalid gauge_type. Use 'BG', 'MG', or 'NG'.")
    
    railpads_per_sleeper = 2
    liners_per_sleeper = 2
    
    total_sleepers = int(sleepers_per_km * line_length_km)
    total_railpads = int(railpads_per_sleeper * total_sleepers)
    total_liners = int(liners_per_sleeper * total_sleepers)
    
    return {
        'gauge_type': gauge_type.upper(),
        'line_length_km': line_length_km,
        'sleepers': total_sleepers,
        'railpads': total_railpads,
        'liners': total_liners
    }

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    line_length = float(input_data['line_length_km'])  # Fixed: Convert to float
    gauge = input_data['gauge_type']
    
    try:
        result = predict_railway_fittings(line_length, gauge)
        print(json.dumps(result))
    except ValueError as e:
        print(json.dumps({'error': str(e)}))
from flask import Flask, request, jsonify, render_template
import pandas as pd
import numpy as np
import joblib
import os
from datetime import timedelta
import matplotlib.pyplot as plt
import io
import base64
import sklearn


app = Flask(__name__)

# Define paths
base_model_path = 'F:/model_vit'
base_excel_path = 'F:/Rand_vit'

# Map of products to their categories
product_category_map = {
    'Vitamin C Serum': 'Skincare_Products',
    'Neem Facewash Powder': 'Skincare_Products',
    'Aloe Vera Sunscreen': 'Skincare_Products',
    'Ragi': 'Organic_Food_Products',
    'Kambu': 'Organic_Food_Products',
    'ABC Juice Powder': 'Organic_Food_Products',
    'Fenugreek Powder': 'Organic_Medicinal_Products',
    'Nilevembu Powder': 'Organic_Medicinal_Products',
    'Papaya Leaf Powder': 'Organic_Medicinal_Products'
}

@app.route('/predict', methods=['POST'])
def predict():
    product_name = request.form.get('product_name')
    if product_name not in product_category_map:
        return jsonify({'error': 'Product not found'}), 404

    category = product_category_map[product_name]
    model_file = os.path.join(base_model_path, category, f'{product_name.replace(" ", "_")}_model.pkl')
    excel_file_path = os.path.join(base_excel_path, category, f'{product_name.replace(" ", "_")}.xlsx')

    if not os.path.exists(model_file) or not os.path.exists(excel_file_path):
        return jsonify({'error': 'Model or data not found'}), 404

    model = joblib.load(model_file)
    df = pd.read_excel(excel_file_path)
    last_date = df['Date'].max()
    future_dates = [last_date + timedelta(days=i) for i in range(1, 8)]

    future_days = pd.DataFrame({
        'Day': [date.dayofyear for date in future_dates],
        'Competitor Price': np.random.uniform(low=df['Competitor Price'].min(), high=df['Competitor Price'].max(), size=7),
        'Discount': np.random.choice([0, 5, 10, 15, 20], size=7),
        'Promotional Campaign': np.random.choice([0, 1], size=7),
        'Season_Spring': [1 if date.month in [3, 4, 5] else 0 for date in future_dates],
        'Season_Summer': [1 if date.month in [6, 7, 8] else 0 for date in future_dates],
        'Season_Autumn': [1 if date.month in [9, 10, 11] else 0 for date in future_dates],
        'Season_Winter': [1 if date.month in [12, 1, 2] else 0 for date in future_dates]
    })

    for column in model.feature_names_in_:
        if column not in future_days.columns:
            if column in df.columns:
                future_days[column] = df[column].mode()[0] if df[column].dtype == 'object' else df[column].median()
            else:
                future_days[column] = 0

    future_days = future_days[model.feature_names_in_]
    predicted_prices = model.predict(future_days)

    # Plotting
    plt.figure(figsize=(10, 6))
    plt.plot(df['Date'], df['Price'], color='red', label='Existing Prices')
    plt.plot(future_dates, predicted_prices, color='green', label='Predicted Prices')

    plt.xlabel('Date')
    plt.ylabel('Price')
    plt.title(f'Price Prediction for {product_name}')
    plt.legend()
    plt.grid(True)

    # Save plot to a BytesIO object
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    img_base64 = base64.b64encode(img.getvalue()).decode()

    return jsonify({'image': img_base64})

@app.route('/')
def index():
    return render_template('index2.html')

if __name__ == '__main__':
    app.run(debug=True)
